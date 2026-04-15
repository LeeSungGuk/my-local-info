/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  filterGeneratedTopics,
  loadTopicQueue,
  markTopicAsUsed,
  selectNextPendingTopic,
  shouldReplenishTopics,
} = require("./blog-topic-queue");
const { parseTopicCandidatesText } = require("./blog-topic-generator");

function createTempQueuePath() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-topic-queue-"));
  return {
    tempDir,
    queueFilePath: path.join(tempDir, "data", "seoul-blog-topic-queue.json"),
  };
}

function cleanupTempDir(tempDir) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

test("loadTopicQueue seeds missing queue file and marks existing Seoul info posts as used", () => {
  const { tempDir, queueFilePath } = createTempQueuePath();

  try {
    const queue = loadTopicQueue({
      queueFilePath,
      seedTopics: [
        {
          id: "used-topic",
          titleHint: "이미 사용한 주제",
          topicCategory: "도심산책",
          angle: "이미 사용한 각도",
          places: ["정동길", "덕수궁"],
          tags: ["서울산책"],
        },
        {
          id: "pending-topic",
          titleHint: "아직 안 쓴 주제",
          topicCategory: "실내나들이",
          angle: "아직 안 쓴 각도",
          places: ["서울도서관", "서울식물원"],
          tags: ["서울실내"],
        },
      ],
      posts: [
        { sourceId: "used-topic", sourceType: "정보글", region: "서울" },
        { sourceId: "used-topic", sourceType: "행사", region: "서울" },
      ],
      nowIso: "2026-04-15T07:30:00+09:00",
    });

    assert.equal(queue.topics[0].status, "used");
    assert.equal(queue.topics[0].usedAt, "2026-04-15T07:30:00+09:00");
    assert.equal(queue.topics[1].status, "pending");
    assert.equal(selectNextPendingTopic(queue).id, "pending-topic");
    assert.equal(fs.existsSync(queueFilePath), true);
  } finally {
    cleanupTempDir(tempDir);
  }
});

test("shouldReplenishTopics returns true only when pending stock is below threshold", () => {
  assert.equal(shouldReplenishTopics({ topics: [{ status: "pending" }] }, 2), true);
  assert.equal(
    shouldReplenishTopics({ topics: [{ status: "pending" }, { status: "pending" }] }, 2),
    false
  );
});

test("filterGeneratedTopics removes duplicates by id, normalized title, and overlapping category/place mix", () => {
  const queue = {
    version: 1,
    topics: [
      {
        id: "queued-topic",
        titleHint: "서울 비 오는 날 실내 코스",
        topicCategory: "실내나들이",
        angle: "queue",
        places: ["서울도서관", "서울식물원", "DDP"],
        tags: ["서울실내"],
        origin: "seed",
        status: "pending",
        createdAt: "2026-04-15T07:30:00+09:00",
        usedAt: null,
      },
    ],
  };
  const posts = [{ sourceId: "used-topic", sourceType: "정보글", region: "서울" }];

  const filtered = filterGeneratedTopics({
    candidates: [
      {
        id: "fresh-topic",
        titleHint: "서울 무료 야경 산책 추천",
        topicCategory: "무료코스",
        angle: "fresh",
        places: ["낙산공원", "응봉산", "청계천"],
        tags: ["서울야경"],
      },
      {
        id: "used-topic",
        titleHint: "이미 사용된 아이디",
        topicCategory: "무료코스",
        angle: "dup id",
        places: ["낙산공원", "응봉산"],
        tags: ["서울야경"],
      },
      {
        id: "another-id",
        titleHint: "서울  비 오는 날  실내 코스",
        topicCategory: "실내나들이",
        angle: "dup title",
        places: ["코엑스", "DDP"],
        tags: ["서울실내"],
      },
      {
        id: "overlap-topic",
        titleHint: "서울 조용한 실내 피난처 추천",
        topicCategory: "실내나들이",
        angle: "dup places",
        places: ["서울식물원", "서울도서관", "코엑스 별마당도서관"],
        tags: ["서울실내"],
      },
    ],
    queue,
    posts,
  });

  assert.deepEqual(
    filtered.map((topic) => topic.id),
    ["fresh-topic"]
  );
});

test("markTopicAsUsed updates only the matching pending topic", () => {
  const updatedQueue = markTopicAsUsed(
    {
      version: 1,
      topics: [
        {
          id: "pending-topic",
          titleHint: "아직 안 쓴 주제",
          topicCategory: "실내나들이",
          angle: "angle",
          places: ["서울도서관"],
          tags: ["서울실내"],
          origin: "seed",
          status: "pending",
          createdAt: "2026-04-15T07:30:00+09:00",
          usedAt: null,
        },
        {
          id: "still-pending",
          titleHint: "다른 주제",
          topicCategory: "도심산책",
          angle: "angle",
          places: ["정동길"],
          tags: ["서울산책"],
          origin: "seed",
          status: "pending",
          createdAt: "2026-04-15T07:30:00+09:00",
          usedAt: null,
        },
      ],
    },
    "pending-topic",
    "2026-04-16T07:30:00+09:00"
  );

  assert.equal(updatedQueue.topics[0].status, "used");
  assert.equal(updatedQueue.topics[0].usedAt, "2026-04-16T07:30:00+09:00");
  assert.equal(updatedQueue.topics[1].status, "pending");
  assert.equal(updatedQueue.topics[1].usedAt, null);
});

test("parseTopicCandidatesText extracts a JSON array from fenced model output", () => {
  const topics = parseTopicCandidatesText(`\`\`\`json
[
  {
    "id": "fresh-topic",
    "titleHint": "서울 무료 야경 산책 추천",
    "topicCategory": "무료코스",
    "angle": "야경을 가볍게 즐기기 좋은 코스를 정리한다.",
    "places": ["낙산공원", "응봉산", "청계천"],
    "tags": ["서울야경", "무료명소"]
  }
]
\`\`\``);

  assert.equal(topics.length, 1);
  assert.equal(topics[0].id, "fresh-topic");
  assert.deepEqual(topics[0].places, ["낙산공원", "응봉산", "청계천"]);
});
