/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const { createBlogCoverSvg } = require("./generate-blog-cover");
const { createCoverPlan, applyCoverPlan, restoreCoverPlan } = require("./rebuild-blog-covers");
const { hash, selectCoverDesign } = require("./blog-cover-selection");
function fixture(t) {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "cover-fixture-")), reportDir = fs.mkdtempSync(path.join(os.tmpdir(), "cover-report-test-"));
    const publicDir = path.join(rootDir, "public");
    fs.mkdirSync(path.join(publicDir, "blog-covers"), { recursive: true });
    const posts = [{ sourceId: "future-coffee", title: "서울 전문 커피 바", date: "2026-10-21", region: "서울", sourceType: "정보글", slug: "coffee", tags: [] }, { sourceId: "future-books", title: "서울 독립서점", date: "2026-10-20", region: "서울", sourceType: "정보글", slug: "books", tags: [] }];
    const topics = posts.map(p => ({ id: p.sourceId, titleHint: p.title, tags: p.tags }));
    for (const topic of topics) {
        const originalDesign = selectCoverDesign(topic);
        originalDesign.paletteId = originalDesign.paletteId === "sea" ? "clay" : "sea";
        fs.writeFileSync(path.join(publicDir, "blog-covers", topic.id + ".svg"), createBlogCoverSvg(topic, { design: originalDesign }));
    }
    t.after(() => { fs.rmSync(rootDir, { recursive: true, force: true }); fs.rmSync(reportDir, { recursive: true, force: true }); });
    const options = { rootDir, publicDir, reportDir, posts, topics };
    return { ...options, options, target: path.join(publicDir, "blog-covers/future-coffee.svg") };
}
test("dry-run writes previews outside public without changing original assets", t => {
    const f = fixture(t), before = hash(fs.readFileSync(f.target));
    const result = createCoverPlan(f.options);
    assert.equal(hash(fs.readFileSync(f.target)), before);
    assert.equal(result.audit.passed, true);
    assert.equal(result.entries.length, 2);
    assert.ok(fs.existsSync(path.join(f.reportDir, "compare.html")));
    assert.throws(() => createCoverPlan({ ...f.options, reportDir: path.join(f.publicDir, "report") }), /프로젝트/);
});
test("unowned custom images are preserved even at a default generated path", t => {
    const f = fixture(t);
    fs.writeFileSync(f.target, "custom illustration");
    const result = createCoverPlan(f.options);
    assert.equal(result.preserved.length, 1);
    assert.equal(result.complete, false);
    assert.equal(fs.readFileSync(f.target, "utf8"), "custom illustration");
});
test("apply checks every original hash before changing any cover", t => {
    const f = fixture(t), result = createCoverPlan(f.options), second = path.join(f.publicDir, "blog-covers/future-books.svg"), before = hash(fs.readFileSync(second));
    fs.writeFileSync(f.target, "edited after review");
    assert.throws(() => applyCoverPlan(result.manifestPath, f), /검토 이후/);
    assert.equal(hash(fs.readFileSync(second)), before);
});
test("applying a reviewed plan and restoring it preserve exact original bytes", t => {
    const f = fixture(t), before = fs.readFileSync(f.target), result = createCoverPlan(f.options);
    const applied = applyCoverPlan(result.manifestPath, f);
    assert.equal(applied.count, 2);
    assert.equal(applyCoverPlan(result.manifestPath, f).alreadyApplied, true);
    assert.equal(restoreCoverPlan(result.manifestPath, f).count, 2);
    assert.deepEqual(fs.readFileSync(f.target), before);
});
test("a mid-application write failure rolls back covers already changed", t => {
    const f = fixture(t), before = fs.readFileSync(f.target), result = createCoverPlan(f.options);
    assert.throws(() => applyCoverPlan(result.manifestPath, { ...f, beforeWrite(_entry, index) { if (index === 1)
            throw new Error("injected write failure"); } }), /injected write failure/);
    assert.deepEqual(fs.readFileSync(f.target), before);
    assert.equal(JSON.parse(fs.readFileSync(path.join(f.reportDir, "application.json"))).status, "failed");
});
test("restore refuses to overwrite later user edits", t => {
    const f = fixture(t), result = createCoverPlan(f.options);
    applyCoverPlan(result.manifestPath, f);
    fs.writeFileSync(f.target, "new user illustration");
    assert.throws(() => restoreCoverPlan(result.manifestPath, f), /편집된 파일/);
    assert.equal(fs.readFileSync(f.target, "utf8"), "new user illustration");
});
test("symlink targets and traversal paths are not replacement candidates", t => {
    const f = fixture(t);
    fs.unlinkSync(f.target);
    fs.writeFileSync(path.join(f.rootDir, "custom.svg"), "custom");
    fs.symlinkSync(path.join(f.rootDir, "custom.svg"), f.target);
    const result = createCoverPlan(f.options);
    assert.equal(result.preserved.length, 1);
    assert.equal(fs.readFileSync(path.join(f.rootDir, "custom.svg"), "utf8"), "custom");
});
test("tampered staged SVGs cannot be applied", t => {
    const f = fixture(t), result = createCoverPlan(f.options);
    fs.appendFileSync(path.join(f.reportDir, "new/future-coffee.svg"), "<!-- modified -->");
    assert.throws(() => applyCoverPlan(result.manifestPath, f), /검토 이후/);
});
test("editing the manifest hash cannot turn a custom image into a managed asset", t => {
    const f = fixture(t), result = createCoverPlan(f.options);
    fs.writeFileSync(f.target, "custom image after review");
    const manifest = JSON.parse(fs.readFileSync(result.manifestPath, "utf8"));
    manifest.entries[0].oldHash = hash(fs.readFileSync(f.target));
    fs.writeFileSync(result.manifestPath, JSON.stringify(manifest));
    assert.throws(() => applyCoverPlan(result.manifestPath, f), /소유권/);
    assert.equal(fs.readFileSync(f.target, "utf8"), "custom image after review");
});
test("a redirected backup directory cannot receive application writes", t => {
    const f = fixture(t), result = createCoverPlan(f.options), original = fs.readFileSync(f.target);
    fs.rmdirSync(path.join(f.reportDir, "backups"));
    fs.mkdirSync(path.join(f.rootDir, "redirect"));
    fs.symlinkSync(path.join(f.rootDir, "redirect"), path.join(f.reportDir, "backups"));
    assert.throws(() => applyCoverPlan(result.manifestPath, f), /백업 경로/);
    assert.deepEqual(fs.readFileSync(f.target), original);
});
