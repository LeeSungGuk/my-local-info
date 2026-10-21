/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs"), path = require("node:path"), os = require("node:os"), crypto = require("node:crypto"), matter = require("gray-matter");
const { createBlogCoverSvg, getPublicFilePath, normalizeCoverImagePath, isManagedCover, escapeXml } = require("./generate-blog-cover");
const { hash, selectCoverDesign, sceneKey, readCoverDesign, auditAssignments } = require("./blog-cover-selection");
const { SUBJECTS, PALETTES, CATALOG_VERSION } = require("./blog-cover-catalog");
const ROOT = path.resolve(__dirname, "..");
function normalizedDate(value) { return value instanceof Date ? value.toISOString().slice(0, 10) : String(value || ""); }
function readPosts(rootDir) {
    return fs.readdirSync(path.join(rootDir, "src/content/posts")).filter(n => n.endsWith(".md")).sort().map(name => {
        const file = path.join(rootDir, "src/content/posts", name), raw = fs.readFileSync(file, "utf8"), { data } = matter(raw);
        return { ...data, slug: name.slice(0, -3), markdownPath: path.relative(rootDir, file), markdownHash: hash(raw) };
    }).filter(p => p.region === "서울" && p.sourceType === "정보글");
}
function canonicalLocation(location) {
    let existing = path.resolve(location), suffix = [];
    while (!fs.existsSync(existing)) {
        suffix.unshift(path.basename(existing));
        const parent = path.dirname(existing);
        if (parent === existing)
            break;
        existing = parent;
    }
    return path.join(fs.realpathSync(existing), ...suffix);
}
function inside(parent, child) { const relative = path.relative(parent, child); return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative)); }
function validateReportDirectory(reportDir, rootDir, publicDir) {
    const candidate = canonicalLocation(reportDir);
    if (inside(canonicalLocation(rootDir), candidate) || inside(canonicalLocation(publicDir), candidate))
        throw new Error("보고서는 프로젝트와 공개 폴더 밖에 저장해야 합니다.");
}
function atomicWrite(file, contents) {
    const temporary = path.join(path.dirname(file), `.cover-${crypto.randomUUID()}.tmp`);
    try {
        fs.writeFileSync(temporary, contents, { flag: "wx" });
        fs.renameSync(temporary, file);
    }
    finally {
        if (fs.existsSync(temporary))
            fs.unlinkSync(temporary);
    }
}
function validateSvg(svg) {
    if (!readCoverDesign(svg) || /<(?:text|tspan|foreignObject|script|image)\b|\bon\w+\s*=|\b(?:href|src)\s*=|undefined|NaN/i.test(svg))
        throw new Error("검증되지 않은 표지 SVG입니다.");
}
function buildHtml(entries, { title, compare = false } = {}) {
    const cards = entries.map(entry => `<article>${compare ? `<img alt="변경 전" src="before/${path.basename(entry.coverImage)}">` : ""}<img alt="${escapeXml(entry.design.subjectId)}" src="new/${path.basename(entry.coverImage)}"><p>${escapeXml(entry.title)}</p><small>${escapeXml(entry.design.subjectId + " / " + entry.design.sceneId)}</small></article>`).join("");
    return `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeXml(title)}</title><style>body{margin:32px;background:#f7f3eb;color:#303a33;font:15px system-ui}h1{font-size:24px}main{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:26px}article{min-width:0}img{width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:16px;display:block;margin-bottom:8px}p{margin:10px 0 6px;line-height:1.6}small{color:#6b7369}@media(max-width:700px){body{margin:16px}main{grid-template-columns:1fr}}</style><h1>${escapeXml(title)}</h1><main>${cards}</main></html>`;
}
function createCoverPlan(options = {}) {
    const rootDir = path.resolve(options.rootDir || ROOT), publicDir = path.resolve(options.publicDir || path.join(rootDir, "public"));
    const reportDir = path.resolve(options.reportDir || fs.mkdtempSync(path.join(os.tmpdir(), "seoul-cover-review-")));
    validateReportDirectory(reportDir, rootDir, publicDir);
    if (fs.existsSync(reportDir) && fs.readdirSync(reportDir).length)
        throw new Error("비어 있는 보고서 폴더가 필요합니다.");
    const posts = [...(options.posts || readPosts(rootDir))].sort((a, b) => normalizedDate(b.date).localeCompare(normalizedDate(a.date)) || String(a.sourceId).localeCompare(String(b.sourceId)));
    const topics = options.topics || JSON.parse(fs.readFileSync(path.join(rootDir, "data/seoul-blog-topic-queue.json"), "utf8")).topics;
    if (!Array.isArray(topics))
        throw new Error("주제 목록 형식이 올바르지 않습니다.");
    const queue = new Map(topics.map(t => [t.id, t])), entries = [], preserved = [], seen = new Set();
    for (const post of posts) {
        const topic = { ...queue.get(post.sourceId), id: post.sourceId, titleHint: post.title, tags: post.tags, coverAlt: post.coverAlt, coverImage: post.coverImage };
        const coverImage = normalizeCoverImagePath(topic);
        if (seen.has(coverImage))
            throw new Error("여러 글이 같은 표지 경로를 사용합니다.");
        seen.add(coverImage);
        let target;
        try {
            target = getPublicFilePath(publicDir, coverImage);
        }
        catch (error) {
            preserved.push({ id: post.sourceId, coverImage, reason: error.message });
            continue;
        }
        if (!fs.existsSync(target)) {
            preserved.push({ id: post.sourceId, coverImage, reason: "기존 표지 파일이 없어 교체에서 제외" });
            continue;
        }
        const original = fs.readFileSync(target, "utf8");
        if (!isManagedCover(original, topic)) {
            preserved.push({ id: post.sourceId, coverImage, reason: "사용자 지정 또는 출처를 확인할 수 없는 표지" });
            continue;
        }
        entries.push({ id: post.sourceId, slug: post.slug, title: post.title, date: normalizedDate(post.date), coverImage, oldHash: hash(original), topic, original, markdownPath: post.markdownPath, markdownHash: post.markdownHash });
    }
    const assignments = [];
    for (let index = 0; index < entries.length; index++) {
        const entry = entries[index], recent = index < 12 ? [...assignments].reverse() : [];
        const previous = assignments.at(-1);
        const design = selectCoverDesign(entry.topic, { assignments, recent, avoidScenes: previous ? [sceneKey(previous)] : [] });
        const svg = createBlogCoverSvg(entry.topic, { design });
        validateSvg(svg);
        Object.assign(entry, { design, svg, newHash: hash(svg) });
        assignments.push(design);
    }
    const audit = auditAssignments(entries);
    const manifest = { version: 1, catalogVersion: CATALOG_VERSION, rootDir, publicDir, createdAt: new Date().toISOString(), audit, complete: preserved.length === 0, preserved, entries: entries.map(({ original, svg, ...entry }) => { void original; void svg; return entry; }) };
    fs.mkdirSync(reportDir, { recursive: true });
    for (const name of ["new", "before", "backups", "catalog"])
        fs.mkdirSync(path.join(reportDir, name));
    for (const entry of entries) {
        fs.writeFileSync(path.join(reportDir, "new", path.basename(entry.coverImage)), entry.svg);
        fs.writeFileSync(path.join(reportDir, "before", path.basename(entry.coverImage)), entry.original);
    }
    fs.writeFileSync(path.join(reportDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
    fs.writeFileSync(path.join(reportDir, "index.html"), buildHtml(entries, { title: `블로그 표지 ${entries.length}개 미리보기` }));
    fs.writeFileSync(path.join(reportDir, "compare.html"), buildHtml(entries.slice(0, 12), { title: "최신 12개 표지 · 변경 전과 후", compare: true }));
    const catalog = [];
    for (const [subjectId, subject] of Object.entries(SUBJECTS))
        for (const [sceneId] of subject.scenes) {
            const design = { subjectId, sceneId, paletteId: PALETTES[0].id, catalogVersion: CATALOG_VERSION };
            const name = `${subjectId}-${sceneId}.svg`, svg = createBlogCoverSvg({ id: name, titleHint: subject.label }, { design });
            validateSvg(svg);
            fs.writeFileSync(path.join(reportDir, "catalog", name), svg);
            catalog.push({ title: subject.label, coverImage: `/catalog/${name}`, design });
        }
    fs.writeFileSync(path.join(reportDir, "catalog/index.html"), buildHtml(catalog, { title: `주제별 장면 ${catalog.length}개` }).replaceAll('src="new/', 'src="'));
    return { reportDir, manifestPath: path.join(reportDir, "manifest.json"), ...manifest };
}
function loadPlan(manifestPath, options = {}) {
    const rootDir = path.resolve(options.rootDir || ROOT), publicDir = path.resolve(options.publicDir || path.join(rootDir, "public"));
    const reportDir = path.dirname(path.resolve(manifestPath));
    validateReportDirectory(reportDir, rootDir, publicDir);
    if (fs.lstatSync(manifestPath).isSymbolicLink())
        throw new Error("목록 파일이 심볼릭 링크입니다.");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (manifest.version !== 1 || manifest.catalogVersion !== CATALOG_VERSION || manifest.rootDir !== rootDir || manifest.publicDir !== publicDir || !Array.isArray(manifest.entries) || !manifest.entries.length)
        throw new Error("적용 목록이 현재 프로젝트와 일치하지 않습니다.");
    const seen = new Set();
    const records = manifest.entries.map(entry => {
        const target = getPublicFilePath(publicDir, entry.coverImage), name = path.basename(target);
        if (seen.has(target))
            throw new Error("중복된 교체 경로입니다.");
        seen.add(target);
        const asset = path.join(reportDir, "new", name);
        if (canonicalLocation(asset) !== path.join(canonicalLocation(reportDir), "new", name))
            throw new Error("미리보기 경로가 변경되었습니다.");
        const svg = fs.readFileSync(asset, "utf8");
        validateSvg(svg);
        if (hash(svg) !== entry.newHash || createBlogCoverSvg(entry.topic, { design: entry.design }) !== svg)
            throw new Error("미리보기 표지가 검토 이후 변경되었습니다.");
        if (!fs.existsSync(target))
            throw new Error("기존 표지 파일이 없습니다.");
        return { ...entry, target, name, svg, currentHash: hash(fs.readFileSync(target)) };
    });
    if (!auditAssignments(records).passed)
        throw new Error("다양성 기준을 통과하지 않은 목록입니다.");
    return { manifest, records, reportDir };
}
function applyCoverPlan(manifestPath, options = {}) {
    const { records, reportDir } = loadPlan(manifestPath, options);
    if (records.every(e => e.currentHash === e.newHash))
        return { alreadyApplied: true, count: records.length };
    if (records.some(e => e.currentHash !== e.oldHash))
        throw new Error("원본 표지가 검토 이후 변경되었습니다. 적용을 중단합니다.");
    if (records.some(e => !isManagedCover(fs.readFileSync(e.target, "utf8"), e.topic)))
        throw new Error("자동 생성 소유권을 확인할 수 없습니다.");
    const journalFile = path.join(reportDir, "application.json");
    if (fs.existsSync(journalFile))
        throw new Error("이미 적용 기록이 있는 목록입니다. 새 dry-run이 필요합니다.");
    for (const record of records) {
        const backup = path.join(reportDir, "backups", record.name);
        if (canonicalLocation(backup) !== path.join(canonicalLocation(reportDir), "backups", record.name))
            throw new Error("백업 경로가 변경되었습니다.");
        if (fs.existsSync(backup))
            throw new Error("이미 백업 파일이 있습니다.");
        fs.writeFileSync(backup, fs.readFileSync(record.target), { flag: "wx" });
    }
    const changed = [];
    try {
        for (let index = 0; index < records.length; index++) {
            const record = records[index];
            options.beforeWrite?.(record, index);
            getPublicFilePath(options.publicDir || path.join(options.rootDir || ROOT, "public"), record.coverImage);
            if (hash(fs.readFileSync(record.target)) !== record.oldHash)
                throw new Error("적용 중 원본 파일이 변경되었습니다.");
            atomicWrite(record.target, record.svg);
            changed.push(record);
        }
        atomicWrite(journalFile, JSON.stringify({ status: "applied", appliedAt: new Date().toISOString(), count: changed.length }, null, 2));
        return { count: changed.length, reportDir };
    }
    catch (error) {
        const conflicts = [];
        for (const record of changed.reverse()) {
            try {
                getPublicFilePath(options.publicDir || path.join(options.rootDir || ROOT, "public"), record.coverImage);
                if (hash(fs.readFileSync(record.target)) !== record.newHash)
                    throw new Error("사용자 편집 충돌");
                atomicWrite(record.target, fs.readFileSync(path.join(reportDir, "backups", record.name)));
            }
            catch {
                conflicts.push(record.coverImage);
            }
        }
        atomicWrite(journalFile, JSON.stringify({ status: "failed", message: error.message, conflicts }, null, 2));
        throw new Error(`${error.message} · 복원 충돌 ${conflicts.length}개`);
    }
}
function restoreCoverPlan(manifestPath, options = {}) {
    const { records, reportDir } = loadPlan(manifestPath, options);
    const journal = JSON.parse(fs.readFileSync(path.join(reportDir, "application.json"), "utf8"));
    if (!["applied", "restored"].includes(journal.status))
        throw new Error("정상 적용 기록이 없습니다.");
    const backups = records.map(record => {
        const backupPath = path.join(reportDir, "backups", record.name);
        if (canonicalLocation(backupPath) !== path.join(canonicalLocation(reportDir), "backups", record.name))
            throw new Error("백업 경로가 변경되었습니다.");
        const backup = fs.readFileSync(backupPath);
        if (hash(backup) !== record.oldHash)
            throw new Error("백업이 변경되었습니다.");
        if (record.currentHash !== record.newHash && record.currentHash !== record.oldHash)
            throw new Error("적용 이후 편집된 파일이 있어 복원을 중단합니다.");
        return { ...record, backup };
    });
    for (const record of backups)
        if (record.currentHash !== record.oldHash)
            atomicWrite(record.target, record.backup);
    atomicWrite(path.join(reportDir, "application.json"), JSON.stringify({ ...journal, status: "restored", restoredAt: new Date().toISOString() }, null, 2));
    return { count: backups.length, reportDir };
}
function main(args = process.argv.slice(2)) {
    const modes = ["--dry-run", "--apply", "--restore"].filter(flag => args.includes(flag));
    if (modes.length > 1)
        throw new Error("하나의 실행 모드만 선택해야 합니다.");
    const value = flag => { const index = args.indexOf(flag); if (index < 0)
        return undefined; if (!args[index + 1] || args[index + 1].startsWith("--"))
        throw new Error(`${flag} 값이 필요합니다.`); return args[index + 1]; };
    const known = new Set(["--dry-run", "--apply", "--restore", "--report-dir", "--manifest"]);
    for (let i = 0; i < args.length; i++) {
        if (!known.has(args[i]))
            throw new Error("알 수 없는 옵션입니다.");
        if (["--report-dir", "--manifest"].includes(args[i]))
            i++;
    }
    if (args.includes("--apply") || args.includes("--restore")) {
        const manifestPath = value("--manifest");
        if (!manifestPath)
            throw new Error("--manifest가 필요합니다.");
        console.log(JSON.stringify((args.includes("--apply") ? applyCoverPlan : restoreCoverPlan)(manifestPath), null, 2));
    }
    else {
        const result = createCoverPlan({ reportDir: value("--report-dir") });
        console.log(JSON.stringify({ reportDir: result.reportDir, audit: result.audit, preserved: result.preserved }, null, 2));
        if (!result.audit.passed)
            process.exitCode = 1;
    }
}
if (require.main === module) {
    try {
        main();
    }
    catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
module.exports = { readPosts, validateSvg, createCoverPlan, applyCoverPlan, restoreCoverPlan, main };
