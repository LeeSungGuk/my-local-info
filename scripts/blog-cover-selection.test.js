/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test"), assert = require("node:assert/strict");
const { SUBJECTS, PALETTES } = require("./blog-cover-catalog");
const { createBlogCoverSvg } = require("./generate-blog-cover");
const { classifyTopic, selectCoverDesign, sceneKey, visualKey, visualFingerprint, readCoverDesign } = require("./blog-cover-selection");
test("compound topics retain the main subject despite incidental tags", () => {
    for (const [titleHint, subjectId] of [["서울 LP 감상 카페", "music"], ["서울 현대식 티하우스", "tea"], ["서울 비건 베이커리", "bakery"], ["서울 뮤지엄숍 추천", "shop"], ["서울 식물 편집숍", "plant"], ["서울 노을 맛집 전망대", "view"], ["서울 필름 카메라 전문점", "photo"]]) {
        assert.equal(classifyTopic({ id: "future-topic", titleHint, tags: ["맛집", "미술", "카페"] }).subjectId, subjectId);
    }
});
test("unknown subjects use an explicit neutral review state", () => {
    assert.equal(classifyTopic({ id: "prototype-safe", titleHint: "새로운 취향" }).subjectId, "neutral");
    assert.equal(classifyTopic({ id: "__proto__", tags: [null, 8, {}] }).reviewRequired, true);
    assert.throws(() => classifyTopic(null));
});
test("catalog offers distinct drawings rather than metadata-only variants", () => {
    const fingerprints = new Set();
    for (const [subjectId, subject] of Object.entries(SUBJECTS)) {
        assert.ok(subject.scenes.length >= 3);
        for (const [sceneId] of subject.scenes) {
            const svg = createBlogCoverSvg({ id: "catalog", titleHint: "주제" }, { design: { subjectId, sceneId, paletteId: PALETTES[0].id } });
            const fingerprint = visualFingerprint(svg);
            assert.ok(!fingerprints.has(fingerprint), `${subjectId}/${sceneId}`);
            fingerprints.add(fingerprint);
            assert.doesNotMatch(svg, /<(?:text|tspan|foreignObject|script|image)\b|undefined|NaN/);
            assert.equal(readCoverDesign(svg).sceneId, sceneId);
        }
    }
    assert.equal(Object.keys(SUBJECTS).length - 1, 24);
});
test("assignment remains reproducible when inventory enumeration changes", () => {
    const topic = { id: "new-coffee", titleHint: "서울 전문 커피 바" };
    const a = selectCoverDesign(topic), b = selectCoverDesign({ id: "other-coffee", titleHint: "서울 커피" });
    const before = JSON.stringify(a);
    assert.deepEqual(selectCoverDesign(topic, { assignments: [a, b] }), selectCoverDesign(topic, { assignments: [b, a] }));
    selectCoverDesign({ id: "third", titleHint: "서울 카페" }, { assignments: [a, b] });
    assert.equal(JSON.stringify(a), before);
});
test("selector avoids recent scenes before considering different colors", () => {
    const topic = { id: "new-coffee", titleHint: "서울 커피" };
    const first = selectCoverDesign(topic), next = selectCoverDesign(topic, { assignments: [first], recent: [first] });
    assert.notEqual(sceneKey(first), sceneKey(next));
    assert.equal(next.reviewRequired, false);
});
test("exhausted subjects stay relevant and require review", () => {
    const assignments = SUBJECTS.cafe.scenes.flatMap(([sceneId]) => PALETTES.flatMap(p => Array.from({ length: 3 }, () => ({ subjectId: "cafe", sceneId, paletteId: p.id }))));
    const selected = selectCoverDesign({ id: "exhausted", titleHint: "서울 카페" }, { assignments, recent: SUBJECTS.cafe.scenes.map(([sceneId]) => ({ subjectId: "cafe", sceneId })) });
    assert.equal(selected.subjectId, "cafe");
    assert.equal(selected.reviewRequired, true);
    assert.ok(assignments.some(a => visualKey(a) === visualKey(selected)));
});
test("metadata, whitespace and labels cannot manufacture visual uniqueness", () => {
    const svg = createBlogCoverSvg({ id: "new-coffee", titleHint: "서울 커피" });
    const edited = svg.replace(/<title[^>]*>.*?<\/title>/, "<title>다른 제목</title>").replace('data-cover-generator="seoulcity"', 'data-cover-generator="other"').replace(/>\s+</g, ">\n  <");
    assert.equal(visualFingerprint(svg), visualFingerprint(edited));
    assert.equal(readCoverDesign(edited), null);
});
