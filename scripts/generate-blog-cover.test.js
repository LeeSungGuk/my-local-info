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
