/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

function loadCoverModule() {
  try {
    return require("./generate-blog-cover");
  } catch {
    return {};
  }
}

test("createBlogCoverSvg escapes text content for SVG output", () => {
  const { createBlogCoverSvg } = loadCoverModule();

  assert.equal(typeof createBlogCoverSvg, "function");

  const svg = createBlogCoverSvg({
    id: "escape-check",
    titleHint: "서울 & 비 오는 날 <실내>",
    topicCategory: "실내&전시",
    places: ["DDP", "코엑스 <별마당>", "서울식물원"],
    tags: ["비오는날"],
  });

  assert.match(svg, /서울 &amp; 비 오는 날 &lt;실내&gt;/);
  assert.match(svg, /실내&amp;전시/);
  assert.match(svg, /코엑스 &lt;별마당&gt;/);
});

test("ensureTopicCoverAsset creates a default SVG cover when cover metadata is missing", () => {
  const { ensureTopicCoverAsset } = loadCoverModule();

  assert.equal(typeof ensureTopicCoverAsset, "function");

  const publicDir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-cover-public-"));

  try {
    const result = ensureTopicCoverAsset(
      {
        id: "seoul-rainy-day-indoor",
        titleHint: "서울 비 오는 날 실내 나들이 추천",
        topicCategory: "실내나들이",
        places: ["국립중앙박물관", "서울시립미술관", "코엑스 별마당도서관"],
        tags: ["비오는날", "서울실내"],
      },
      { publicDir }
    );

    assert.deepEqual(result, {
      coverImage: "/blog-covers/seoul-rainy-day-indoor.svg",
      coverAlt: "서울 비 오는 날 실내 나들이 추천을 보여주는 서울 정보글 커버 이미지",
    });

    const coverPath = path.join(publicDir, "blog-covers", "seoul-rainy-day-indoor.svg");
    assert.equal(fs.existsSync(coverPath), true);

    const svg = fs.readFileSync(coverPath, "utf8");
    assert.match(svg, /실내나들이/);
    assert.match(svg, /국립중앙박물관/);
    assert.match(svg, /서울시립미술관/);
  } finally {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
});

test("ensureTopicCoverAsset picks a natural Korean object particle for generated coverAlt", () => {
  const { ensureTopicCoverAsset } = loadCoverModule();

  assert.equal(typeof ensureTopicCoverAsset, "function");

  const publicDir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-cover-public-"));

  try {
    const result = ensureTopicCoverAsset(
      {
        id: "seoul-family-weekend-course",
        titleHint: "아이와 함께 가기 좋은 서울 주말 코스",
        topicCategory: "가족코스",
        places: ["서울상상나라", "어린이대공원", "서울식물원"],
        tags: ["서울가족나들이", "체험"],
      },
      { publicDir }
    );

    assert.equal(
      result.coverAlt,
      "아이와 함께 가기 좋은 서울 주말 코스를 보여주는 서울 정보글 커버 이미지"
    );
  } finally {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
});

test("covers keep accessible titles without displaying typography", () => {
  const { createBlogCoverSvg } = loadCoverModule();
  const titles = [
    "턴테이블 위 바늘 끝에서 퍼지는 감성, 음악에 온전히 몰입하는 서울 LP & 리스닝 바",
    "서울에서 오래 머무르기 좋은 조용한 공간과 작은 발견을 따라 떠나는 주말 산책, 도서관부터 미술관과 한강의 야경까지 차근차근 둘러보는 긴 하루의 기록",
    "SEOUL WWW iii LP & ART: A quiet afternoon, 서울의 작은 취향을 찾아서",
    "띄어쓰기없이길게이어지는서울의산책코스와숨은공간을찾아떠나는아주길고도특별한이야기".repeat(3),
    "서울 가족 👨‍👩‍👧‍👦 나들이, 숲길 산책과 작은 도서관을 함께 즐기는 하루",
  ];

  for (const titleHint of titles) {
    const svg = createBlogCoverSvg({ id: "long-title", titleHint });
    assert.match(svg, /<title id="cover-title">[^<]+<\/title>/);
    assert.match(svg, /aria-labelledby="cover-title cover-desc"/);
    assert.doesNotMatch(svg, /<(?:text|tspan|foreignObject)\b|textLength|font-size/);
  }
});

test("place and tag labels do not crowd the visible cover", () => {
  const { createBlogCoverSvg } = loadCoverModule();
  const svg = createBlogCoverSvg({
    id: "seoul-vinyl-listening-bars",
    titleHint: "서울 LP & 리스닝 바",
    topicCategory: "생활취향",
    places: ["용산구 바이닐앤플라스틱", "마포구 연남동 뮤직퍼블릭", "성동구 성수동 뮤직바"],
    tags: ["아주긴태그이름으로겹침을확인", "음악감상"],
  });
  const textElements = [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map((match) => match[1]).join("");
  assert.doesNotMatch(textElements, /바이닐앤플라스틱|뮤직퍼블릭|아주긴태그|음악감상|자동 생성/);
  assert.match(svg, /<desc[^>]*>[^<]*용산구 바이닐앤플라스틱/);
  assert.match(svg, /data-cover-subject="music"/);
});

test("long categories remain accessible metadata without becoming a visible badge", () => {
  const { createBlogCoverSvg } = loadCoverModule();
  const category = "아주 긴 이름을 가진 서울의 다양한 생활 취향과 나들이 분류";
  const svg = createBlogCoverSvg({ id: "category", titleHint: "서울 산책", topicCategory: category });
  assert.ok(svg.includes(`분류: ${category}`));
  assert.doesNotMatch(svg, /data-cover-category|<text\b/);
});

test("updating the common template never overwrites an existing cover asset", () => {
  const { ensureTopicCoverAsset } = loadCoverModule();
  const publicDir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-cover-existing-"));
  const topic = { id: "existing-cover", titleHint: "서울 산책" };
  try {
    const coverPath = path.join(publicDir, "blog-covers", "existing-cover.svg");
    fs.mkdirSync(path.dirname(coverPath), { recursive: true });
    fs.writeFileSync(coverPath, "existing custom cover", "utf8");
    ensureTopicCoverAsset(topic, { publicDir });
    assert.equal(fs.readFileSync(coverPath, "utf8"), "existing custom cover");
  } finally {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
});

test("new covers use recent inventory but existing covers never get reassigned", () => {
  const { ensureTopicCoverAsset } = loadCoverModule();
  const { readCoverDesign, sceneKey } = require("./blog-cover-selection");
  const publicDir=fs.mkdtempSync(path.join(os.tmpdir(),"cover-inventory-"));
  try {
    const first={id:"new-coffee-one",titleHint:"서울 커피 바"};
    ensureTopicCoverAsset(first,{publicDir});
    const file=path.join(publicDir,"blog-covers/new-coffee-one.svg"),original=fs.readFileSync(file,"utf8");
    ensureTopicCoverAsset({id:"new-coffee-two",titleHint:"서울 커피 공간"},{publicDir,posts:[{sourceId:first.id,date:"2026-10-21",region:"서울",sourceType:"정보글"}]});
    const next=fs.readFileSync(path.join(publicDir,"blog-covers/new-coffee-two.svg"),"utf8");
    assert.notEqual(sceneKey(readCoverDesign(original)),sceneKey(readCoverDesign(next)));
    ensureTopicCoverAsset({...first,titleHint:"다른 이름"},{publicDir});assert.equal(fs.readFileSync(file,"utf8"),original);
  } finally {fs.rmSync(publicDir,{recursive:true,force:true});}
});

test("generated cover writes reject traversal and symlinks", () => {
  const { ensureTopicCoverAsset } = loadCoverModule();
  const publicDir=fs.mkdtempSync(path.join(os.tmpdir(),"cover-path-"));
  try {
    assert.throws(()=>ensureTopicCoverAsset({id:"invalid",coverImage:"/blog-covers/../../escaped.svg"},{publicDir}),/경로/);
    fs.mkdirSync(path.join(publicDir,"blog-covers"));fs.writeFileSync(path.join(publicDir,"custom.svg"),"custom");
    fs.symlinkSync(path.join(publicDir,"custom.svg"),path.join(publicDir,"blog-covers/custom.svg"));
    assert.throws(()=>ensureTopicCoverAsset({id:"custom"},{publicDir}),/심볼릭/);
    assert.equal(fs.readFileSync(path.join(publicDir,"custom.svg"),"utf8"),"custom");
  } finally {fs.rmSync(publicDir,{recursive:true,force:true});}
});

test("custom images in recent posts do not pull older scenes into the recent window", () => {
  const { ensureTopicCoverAsset, readExistingAssignments } = loadCoverModule();
  const publicDir=fs.mkdtempSync(path.join(os.tmpdir(),"cover-recent-window-"));
  try {
    ensureTopicCoverAsset({id:"older-coffee",titleHint:"서울 커피"},{publicDir});
    const posts=Array.from({length:11},(_,i)=>({sourceId:`custom-${i}`,date:"2026-10-21",region:"서울",sourceType:"정보글"}));
    posts.push({sourceId:"older-coffee",date:"2026-10-01",region:"서울",sourceType:"정보글"});
    const result=readExistingAssignments(publicDir,posts);
    assert.equal(result.assignments.length,1);assert.equal(result.recent.length,0);
  } finally {fs.rmSync(publicDir,{recursive:true,force:true});}
});
