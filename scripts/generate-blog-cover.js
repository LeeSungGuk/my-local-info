/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { CATALOG_VERSION, renderScene } = require("./blog-cover-catalog");
const { hash, selectCoverDesign, readCoverDesign } = require("./blog-cover-selection");
const topicMap = require("./blog-cover-topic-map");
function escapeXml(value) {
    return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function normalizeCoverImagePath(topic) {
    if (typeof topic.coverImage === "string" && topic.coverImage.trim()) {
        const configured = topic.coverImage.trim();
        if (/^https?:\/\//.test(configured))
            return configured;
        return configured.startsWith("/") ? configured : `/${configured}`;
    }
    const id = String(topic.id || topic.titleHint || "blog-cover").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "");
    if (!id)
        throw new Error("표지 파일 이름을 만들 수 없습니다.");
    return `/blog-covers/${id}.svg`;
}
function getPublicFilePath(publicDir, coverImage) {
    if (!/^\/blog-covers\/[a-zA-Z0-9_-]+\.svg$/.test(coverImage))
        throw new Error("허용된 표지 경로가 아닙니다.");
    const root = path.resolve(publicDir), directory = path.join(root, "blog-covers"), target = path.join(root, coverImage.slice(1));
    for (const candidate of [root, directory, target]) {
        try {
            if (fs.lstatSync(candidate).isSymbolicLink())
                throw new Error("심볼릭 링크 표지는 변경할 수 없습니다.");
        }
        catch (error) {
            if (error.code !== "ENOENT")
                throw error;
        }
    }
    return target;
}
function resolveCoverAlt(topic) {
    if (typeof topic.coverAlt === "string" && topic.coverAlt.trim())
        return topic.coverAlt.trim();
    const title = String(topic.titleHint || "서울 정보글").trim();
    const last = title.charCodeAt(title.length - 1), hangul = last >= 0xac00 && last <= 0xd7a3;
    const particle = hangul && (last - 0xac00) % 28 !== 0 ? "을" : "를";
    return `${title}${particle} 보여주는 서울 정보글 커버 이미지`;
}
function createBlogCoverSvg(topic, options = {}) {
    const design = options.design || selectCoverDesign(topic);
    const { palette, scene, markup } = renderScene(design);
    const title = String(topic.titleHint || topic.id || "서울 정보글").replace(/\s+/g, " ").trim();
    const category = typeof topic.topicCategory === "string" ? topic.topicCategory : "서울 추천";
    const places = Array.isArray(topic.places) ? topic.places.filter(p => typeof p === "string").slice(0, 3) : [];
    const description = `${scene.description}. 분류: ${category}${places.length ? `. 추천 장소: ${places.join(", ")}` : ""}`;
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="900" viewBox="0 0 1600 900" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="cover-title cover-desc" data-cover-generator="seoulcity" data-cover-version="${CATALOG_VERSION}" data-cover-subject="${design.subjectId}" data-cover-scene="${design.sceneId}" data-cover-palette="${design.paletteId}">
  <title id="cover-title">${escapeXml(title)}</title>
  <desc id="cover-desc">${escapeXml(description)}</desc>
  <rect width="1600" height="900" fill="${palette.paper}"/>
  <rect x="120" y="65" width="1360" height="770" rx="54" fill="${palette.wash}"/>
  <ellipse cx="800" cy="763" rx="420" ry="18" fill="${palette.ink}" opacity=".06"/>
  ${markup}
</svg>`;
}
function isManagedCover(svg, topic) {
    const known = Object.hasOwn(topicMap, topic.id || "") ? topicMap[topic.id] : null;
    if (known?.legacyHash === hash(svg))
        return true;
    const design = readCoverDesign(svg);
    return Boolean(design && createBlogCoverSvg(topic, { design }) === svg);
}
function readExistingAssignments(publicDir, posts = []) {
    const directory = path.join(publicDir, "blog-covers");
    if (!fs.existsSync(directory))
        return { assignments: [], recent: [] };
    if (fs.lstatSync(directory).isSymbolicLink())
        throw new Error("표지 폴더가 심볼릭 링크입니다.");
    const byId = new Map();
    for (const name of fs.readdirSync(directory).filter(n => /^[a-zA-Z0-9_-]+\.svg$/.test(n)).sort()) {
        const file = path.join(directory, name);
        if (!fs.lstatSync(file).isFile())
            continue;
        const design = readCoverDesign(fs.readFileSync(file, "utf8"));
        if (design)
            byId.set(name.slice(0, -4), design);
    }
    const date = p => p.date instanceof Date ? p.date.toISOString().slice(0, 10) : String(p.date || "");
    const recent = [...posts].filter(p => p.region === "서울" && p.sourceType === "정보글").sort((a, b) => date(b).localeCompare(date(a)) || String(a.sourceId).localeCompare(String(b.sourceId))).slice(0, 11).map(p => byId.get(p.sourceId)).filter(Boolean);
    return { assignments: [...byId.values()], recent };
}
function ensureTopicCoverAsset(topic, options = {}) {
    const publicDir = options.publicDir || path.join(__dirname, "..", "public");
    const coverImage = normalizeCoverImagePath(topic), coverAlt = resolveCoverAlt(topic);
    if (!coverImage.startsWith("/blog-covers/"))
        return { coverImage, coverAlt };
    const target = getPublicFilePath(publicDir, coverImage);
    if (!fs.existsSync(target)) {
        const context = readExistingAssignments(publicDir, options.posts);
        const design = selectCoverDesign(topic, context);
        if (design.reviewRequired)
            (options.onWarning || console.warn)(`표지 다양성 검토 필요: ${topic.id || "미분류"} (${design.reason})`);
        const svg = createBlogCoverSvg(topic, { design });
        fs.mkdirSync(path.dirname(target), { recursive: true });
        const temporary = path.join(path.dirname(target), `.cover-${crypto.randomUUID()}.tmp`);
        try {
            fs.writeFileSync(temporary, svg, { encoding: "utf8", flag: "wx" });
            // Publish a complete file without overwriting a concurrent custom image.
            try {
                fs.linkSync(temporary, target);
            }
            catch (error) {
                if (error.code !== "EEXIST")
                    throw error;
            }
        }
        finally {
            if (fs.existsSync(temporary))
                fs.unlinkSync(temporary);
        }
    }
    return { coverImage, coverAlt };
}
module.exports = { createBlogCoverSvg, ensureTopicCoverAsset, escapeXml, normalizeCoverImagePath, getPublicFilePath, isManagedCover, readExistingAssignments };
