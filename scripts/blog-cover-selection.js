/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("node:crypto");
const { CATALOG_VERSION, PALETTES, SUBJECTS, getScene } = require("./blog-cover-catalog");
const topicMap = require("./blog-cover-topic-map");
const RULES = [
    ["music", 110, /\bLP\b|레코드|바이닐|턴테이블|청음|리스닝|음악 감상|vinyl|listening|record-shop/i],
    ["book", 100, /도서관|서점|책방|독서|헌책|만화|책맥|book|librar/i],
    ["tea", 115, /티하우스|티 하우스|다도|찻집|찻주전자|전통 다방|tea[- ]?(?:house|room|salon)|traditional-tea/i],
    ["bakery", 112, /베이커리|빵집|디저트|한과|bakery|bakeries|dessert/i],
    ["cafe", 75, /카페|커피|에스프레소|로스터리|cafe|coffee|roastery/i],
    ["plant", 145, /식물.*(?:편집|병원|도매)|가드닝|온실|greenhouse|gardening|plant.*(?:shop|market)/i],
    ["shop", 125, /뮤지엄숍|museum.*(?:gift|design)|문구|필기구|연필|편집숍|빈티지 숍|구제|가구.*쇼룸|향수|리필숍|제로웨이스트|stationery|designer-shop|vintage-clothing|furniture|zero-waste|perfume|incense/i],
    ["photo", 135, /카메라|촬영|포토.*스튜디오|필름|사진.*투어|camera|photobooth|photo-walk/i],
    ["sports", 115, /자전거|따릉이|러닝|달리기|클라이밍|아이스링크|롤러장|bik|bicycle|running|bouldering|skating|ttareungyi/i],
    ["pet", 130, /반려견|반려동물|pet-friendly|dog-/i],
    ["hanok", 80, /한옥|궁궐|사찰|hanok|palace|temple/i],
    ["forest", 70, /숲|피크닉|황톳길|맨발|공원|정원|등산|수목원|forest|picnic|garden|hiking|earthing|arboretum/i],
    ["river", 82, /한강|수변|하천|작은 천|계곡|강변|hangang|waterfront|stream|valley|river/i],
    ["view", 95, /야경|노을|전망|천문|낙조|밤하늘|별빛|observator|sunset|night-view|star-gazing|astronom/i],
    ["craft", 105, /공예|공방|원데이|도자기|창작|craft|workshop|ceramic|creative-work/i],
    ["museum", 90, /박물관|유물|소장품|museum/i],
    ["art", 85, /전시|미술|갤러리|포스터|아트|gallery|art-space|art-museum|poster/i],
    ["market", 95, /시장|마트|식재료|식료품|market|grocery/i],
    ["food", 60, /맛집|먹거리|음식|미식|브런치|비건|food|brunch|vegan/i],
    ["family", 98, /아이와|가족|어린이|키즈|family|kids-/i],
    ["wellness", 110, /족욕|스파|사우나|명상|웰니스|생각 정리|발.*휴식|foot-bath|spa|sauna|wellness|meditation/i],
    ["cinema", 106, /영화|공연|오락|아케이드|레트로.*게임|cinema|film-archive|arcade|amusement|retro-play/i],
    ["architecture", 72, /건축|공공.*공간|공개공지|작업.*공간|워크스페이스|공부|아파트|architecture|architectural|public-space|cowork|workspace|study-space|apartment/i],
    ["citywalk", 65, /산책|골목|동네|거리|마을|walk|alley|neighborhood|street|village|district/i],
];
function hash(value) {
    return crypto.createHash("sha256").update(String(value)).digest("hex");
}
function strings(values) {
    return values.filter(value => typeof value === "string").join(" ");
}
function classifyTopic(topic) {
    if (!topic || typeof topic !== "object")
        throw new Error("표지 주제 정보가 필요합니다.");
    if (Object.hasOwn(topicMap, topic.id || ""))
        return { ...topicMap[topic.id], reviewRequired: false };
    const primary = strings([topic.id, topic.titleHint]);
    const secondary = strings([topic.angle, topic.topicCategory, ...(Array.isArray(topic.tags) ? topic.tags : [])]);
    const scores = RULES.map(([subjectId, weight, pattern]) => ({
        subjectId, score: (pattern.test(primary) ? weight : 0) + (pattern.test(secondary) ? 12 : 0),
    })).filter(candidate => candidate.score >= 60).sort((a, b) => b.score - a.score || a.subjectId.localeCompare(b.subjectId));
    if (!scores.length)
        return { subjectId: "neutral", reason: "핵심 주제를 판단하지 못해 공공 공간 장면 사용", reviewRequired: true };
    return { subjectId: scores[0].subjectId, reason: `제목·ID의 핵심 표현과 보조 문맥: ${SUBJECTS[scores[0].subjectId].label}`, reviewRequired: false };
}
function sceneKey(design) { return `${design.subjectId}/${design.sceneId}`; }
function visualKey(design) { return `${sceneKey(design)}/${design.paletteId}`; }
function selectCoverDesign(topic, { assignments = [], recent = [], avoidScenes = [], maxRepeats = 3 } = {}) {
    const classification = classifyTopic(topic);
    const subject = SUBJECTS[classification.subjectId];
    const scenes = classification.sceneId ? subject.scenes.filter(([id]) => id === classification.sceneId) : subject.scenes;
    const used = new Map();
    const usedScenes = new Map();
    for (const assignment of assignments) {
        used.set(visualKey(assignment), (used.get(visualKey(assignment)) || 0) + 1);
        usedScenes.set(sceneKey(assignment), (usedScenes.get(sceneKey(assignment)) || 0) + 1);
    }
    const recentKeys = new Set(recent.slice(0, 11).map(sceneKey));
    const forbidden = new Set(avoidScenes);
    const seed = `${topic.id || topic.titleHint}:${CATALOG_VERSION}`;
    const candidates = scenes.flatMap(([sceneId]) => PALETTES.map(p => ({ subjectId: classification.subjectId, sceneId, paletteId: p.id, catalogVersion: CATALOG_VERSION })));
    if (!candidates.length)
        throw new Error("사용할 수 있는 표지 장면이 없습니다.");
    candidates.sort((a, b) => Number(forbidden.has(sceneKey(a))) - Number(forbidden.has(sceneKey(b)))
        || Number(recentKeys.has(sceneKey(a))) - Number(recentKeys.has(sceneKey(b)))
        || Number((used.get(visualKey(a)) || 0) >= maxRepeats) - Number((used.get(visualKey(b)) || 0) >= maxRepeats)
        || (used.get(visualKey(a)) || 0) - (used.get(visualKey(b)) || 0)
        || (usedScenes.get(sceneKey(a)) || 0) - (usedScenes.get(sceneKey(b)) || 0)
        || hash(seed + visualKey(a)).localeCompare(hash(seed + visualKey(b))));
    const selected = candidates[0];
    const repeated = recentKeys.has(sceneKey(selected)) || forbidden.has(sceneKey(selected)) || (used.get(visualKey(selected)) || 0) >= maxRepeats;
    return { ...selected, reason: classification.reason, reviewRequired: classification.reviewRequired || repeated };
}
function readCoverDesign(svg) {
    if (typeof svg !== "string" || !svg.includes('data-cover-generator="seoulcity"'))
        return null;
    const value = name => svg.match(new RegExp(`data-cover-${name}="([a-z0-9-]+)"`))?.[1];
    const design = { subjectId: value("subject"), sceneId: value("scene"), paletteId: value("palette"), catalogVersion: value("version") };
    try {
        if (design.catalogVersion !== CATALOG_VERSION || !PALETTES.some(p => p.id === design.paletteId))
            return null;
        getScene(design.subjectId, design.sceneId);
        return design;
    }
    catch {
        return null;
    }
}
function visualFingerprint(svg) {
    return hash(svg.replace(/<(title|desc)\b[^>]*>[\s\S]*?<\/\1>/g, "").replace(/\s(?:data-cover-[\w-]+|aria-labelledby)="[^"]*"/g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/>\s+</g, "><").trim());
}
function auditAssignments(entries) {
    const sceneCounts = new Map(), visualCounts = new Map(), fingerprints = new Map();
    let adjacentRepeats = 0;
    entries.forEach((entry, index) => {
        const design = entry.design || entry;
        visualCounts.set(visualKey(design), (visualCounts.get(visualKey(design)) || 0) + 1);
        if (index < 12)
            sceneCounts.set(sceneKey(design), (sceneCounts.get(sceneKey(design)) || 0) + 1);
        if (index && sceneKey(entries[index - 1].design || entries[index - 1]) === sceneKey(design))
            adjacentRepeats++;
        if (entry.svg) {
            const key = visualFingerprint(entry.svg);
            fingerprints.set(key, (fingerprints.get(key) || 0) + 1);
        }
    });
    const result = { count: entries.length, recentSceneDuplicates: [...sceneCounts.values()].reduce((sum, n) => sum + Math.max(0, n - 1), 0), maxVisualRepeats: Math.max(0, ...visualCounts.values()), adjacentRepeats, uniqueVisuals: visualCounts.size, uniqueFingerprints: fingerprints.size, maxFingerprintRepeats: Math.max(0, ...fingerprints.values()), reviewRequired: entries.filter(e => (e.design || e).reviewRequired).length };
    result.passed = result.recentSceneDuplicates === 0 && result.maxVisualRepeats <= 3 && result.adjacentRepeats === 0 && result.reviewRequired === 0 && result.maxFingerprintRepeats <= 3;
    return result;
}
module.exports = { hash, classifyTopic, selectCoverDesign, sceneKey, visualKey, readCoverDesign, visualFingerprint, auditAssignments };
