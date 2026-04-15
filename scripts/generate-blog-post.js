/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const SEOUL_BLOG_TOPICS = require("./seoul-blog-topics");
const { ensureTopicCoverAsset } = require("./generate-blog-cover");
const { generateTopicCandidates } = require("./blog-topic-generator");
const {
  countPendingTopics,
  filterGeneratedTopics,
  loadTopicQueue,
  markTopicAsUsed,
  mergeGeneratedTopics,
  selectNextPendingTopic,
  shouldReplenishTopics,
  writeTopicQueue,
} = require("./blog-topic-queue");

const ENV_FILE_PATH = path.join(__dirname, "..", ".env.local");
const POSTS_DIR = path.join(__dirname, "..", "src", "content", "posts");
const TOPIC_QUEUE_FILE_PATH = path.join(__dirname, "..", "data", "seoul-blog-topic-queue.json");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const lines = fileContents.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const unwrappedValue = rawValue.replace(/^['"]|['"]$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = unwrappedValue;
    }
  }
}

loadEnvFile(ENV_FILE_PATH);

const BLOG_GENERATION_MODEL = "gemini-3-flash-preview";
const TOPIC_GENERATION_MODEL = process.env.GEMINI_BLOG_TOPIC_MODEL || BLOG_GENERATION_MODEL;
const MINIMUM_PENDING_TOPICS = Number(process.env.BLOG_TOPIC_MIN_PENDING || 7);
const TARGET_PENDING_TOPICS = Number(process.env.BLOG_TOPIC_TARGET_PENDING || 15);
const MAX_TOPIC_GENERATION_BATCH = Number(process.env.BLOG_TOPIC_MAX_BATCH || 10);

function getSeoulDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  return formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }

    return acc;
  }, {});
}

function getTodayInSeoul() {
  const parts = getSeoulDateParts();
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getNowInSeoulIso() {
  const parts = getSeoulDateParts();
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+09:00`;
}

function normalizeDate(value) {
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

function getExistingPosts() {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(POSTS_DIR)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const filePath = path.join(POSTS_DIR, fileName);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        fileName,
        slug: fileName.replace(/\.md$/, ""),
        date: normalizeDate(data.date),
        title: typeof data.title === "string" ? data.title : "",
        sourceType: typeof data.sourceType === "string" ? data.sourceType : "",
        sourceId: typeof data.sourceId === "string" ? data.sourceId : "",
        region: typeof data.region === "string" ? data.region : "",
        content,
      };
    });
}

function hasTodayInfoPost(posts, today) {
  return posts.some((post) => post.date === today && post.sourceType === "정보글" && post.region === "서울");
}

async function maybeReplenishTopicQueue(queue, posts, nowIso) {
  if (!shouldReplenishTopics(queue, MINIMUM_PENDING_TOPICS)) {
    return queue;
  }

  const pendingCount = countPendingTopics(queue);
  const targetCount = Math.max(1, TARGET_PENDING_TOPICS - pendingCount);
  const requestedCount = Math.min(MAX_TOPIC_GENERATION_BATCH, targetCount);

  try {
    console.log(`🧠 서울 정보글 주제 보충 중... (현재 pending ${pendingCount}개)`);
    const candidates = await generateTopicCandidates({
      apiKey: process.env.GEMINI_API_KEY,
      model: TOPIC_GENERATION_MODEL,
      count: requestedCount,
      existingTopics: queue.topics,
      fetchImpl: fetch,
    });
    const filteredTopics = filterGeneratedTopics({
      candidates,
      queue,
      posts,
    });

    if (filteredTopics.length === 0) {
      console.log("ℹ️ 새로 추가할 서울 정보글 주제를 찾지 못했습니다.");
      return queue;
    }

    const updatedQueue = mergeGeneratedTopics(queue, filteredTopics, nowIso);
    writeTopicQueue(updatedQueue, TOPIC_QUEUE_FILE_PATH);
    console.log(`📚 서울 정보글 주제 ${filteredTopics.length}개를 큐에 추가했습니다.`);
    return updatedQueue;
  } catch (error) {
    if (pendingCount > 0) {
      console.warn(`⚠️ 주제 보충에 실패했지만 기존 pending 주제로 계속 진행합니다: ${error.message}`);
      return queue;
    }

    throw error;
  }
}

async function generateBlogPost(topic, today) {
  const imageFrontmatter = topic.coverImage
    ? `coverImage: ${topic.coverImage}\ncoverAlt: ${topic.coverAlt || ""}\n`
    : "";

  const prompt = `아래 주제를 바탕으로 서울 전용 정보성 블로그 글을 작성해줘.

주제 정보:
${JSON.stringify(topic, null, 2)}

목표:
- 행사, 축제, 지원금, 혜택 안내 글처럼 쓰지 않는다.
- "서울에서 가볼만한 곳", "여러 곳을 묶은 방문 코스", "서울 생활 취향별 추천"에 집중한다.
- 서울 시민이나 서울 방문자가 실제로 참고할 수 있는 정보글이어야 한다.
- 장소 설명은 과장하지 말고, 운영시간이나 입장료처럼 바뀔 수 있는 세부값은 단정하지 않는다.
- 본문은 추천 이유 3가지, 추천 동선 또는 방문 팁, 누구에게 맞는지까지 포함한다.
- 정보에 없는 사실을 추정하지 않는다.
- 이모지는 꼭 필요한 위치에만 절제해서 사용한다.
- 제목, 소제목, 팁, 추천 포인트처럼 가독성을 높이는 지점에만 사용하고 남발하지 않는다.
- 문단마다 붙이지 말고 전체 글 기준으로 3개에서 6개 사이 정도로 제한한다.

출력 형식:
---
title: (서울 블로그에 어울리는 제목)
date: ${today}
summary: (한 줄 요약)
category: 정보
tags: [${topic.tags.join(", ")}]
region: 서울
sourceType: 정보글
sourceId: ${topic.id}
sourceUrl:
${imageFrontmatter}---

(본문: 900자 이상, 서울 생활 정보 블로그 톤, 소제목 포함. 이모지는 꼭 필요한 위치에만 사용)

마지막 줄에 FILENAME: ${today}-keyword 형식으로 파일명도 출력해줘. 키워드는 영문 소문자와 하이픈만 사용해줘.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${BLOG_GENERATION_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  console.log(`🤖 Gemini AI로 서울 정보글 생성 중... (${topic.id}, ${BLOG_GENERATION_MODEL})`);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API 오류: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!text) {
    throw new Error("Gemini 응답이 비어있습니다.");
  }

  return text;
}

function savePost(geminiResponse, today, topic) {
  const lines = geminiResponse.trim().split("\n");
  let filename = "";
  let content = "";

  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim().startsWith("FILENAME:")) {
      filename = lines[i].trim().replace("FILENAME:", "").trim();
      content = lines.slice(0, i).join("\n").trim();
      break;
    }
  }

  if (!filename) {
    filename = `${today}-${topic.id}`;
    content = geminiResponse.trim();
  }

  content = content
    .replace(/^```markdown\s*/i, "")
    .replace(/^```md\s*/i, "")
    .replace(/```\s*$/g, "")
    .trim();

  filename = filename.replace(/\.md$/, "");

  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }

  const parsed = matter(content);
  const coverAsset = ensureTopicCoverAsset(topic);
  const normalizedFrontmatter = {
    title: parsed.data.title || topic.titleHint,
    date: today,
    summary: parsed.data.summary || "",
    category: "정보",
    tags: Array.isArray(parsed.data.tags) && parsed.data.tags.length > 0 ? parsed.data.tags : topic.tags,
    region: "서울",
    sourceType: "정보글",
    sourceId: topic.id,
    sourceUrl: "",
    ...(coverAsset.coverImage ? { coverImage: coverAsset.coverImage } : {}),
    ...(coverAsset.coverAlt ? { coverAlt: coverAsset.coverAlt } : {}),
  };

  const normalizedContent = matter.stringify(parsed.content.trim(), normalizedFrontmatter).trim();
  const filePath = path.join(POSTS_DIR, `${filename}.md`);
  fs.writeFileSync(filePath, `${normalizedContent}\n`, "utf8");

  return { filename, filePath, coverImage: coverAsset.coverImage };
}

async function main() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("환경변수 GEMINI_API_KEY가 설정되지 않았습니다.");
    }

    const today = getTodayInSeoul();
    const nowIso = getNowInSeoulIso();
    const posts = getExistingPosts();

    if (hasTodayInfoPost(posts, today)) {
      console.log("ℹ️ 오늘 날짜의 서울 정보글이 이미 있어 새 글을 만들지 않습니다.");
      return;
    }

    let topicQueue = loadTopicQueue({
      queueFilePath: TOPIC_QUEUE_FILE_PATH,
      seedTopics: SEOUL_BLOG_TOPICS,
      posts,
      nowIso,
    });
    topicQueue = await maybeReplenishTopicQueue(topicQueue, posts, nowIso);

    const nextTopic = selectNextPendingTopic(topicQueue);

    if (!nextTopic) {
      console.log("ℹ️ 사용 가능한 서울 정보글 주제가 남아있지 않습니다.");
      return;
    }

    console.log(`📋 오늘의 서울 정보글 주제: ${nextTopic.id}`);
    const geminiResponse = await generateBlogPost(nextTopic, today);
    const { filename, filePath, coverImage } = savePost(geminiResponse, today, nextTopic);
    topicQueue = markTopicAsUsed(topicQueue, nextTopic.id, nowIso);
    topicQueue.lastGeneratedAt = nowIso;
    writeTopicQueue(topicQueue, TOPIC_QUEUE_FILE_PATH);

    console.log("✅ 서울 정보글 생성 완료!");
    console.log(`📄 파일명: ${filename}.md`);
    console.log(`📂 경로: ${filePath}`);
    console.log(`🖼️ 커버 이미지: ${coverImage}`);
  } catch (error) {
    console.error("❌ 오류 발생:", error.message);
    console.log("기존 파일을 유지합니다.");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateBlogPost,
  getExistingPosts,
  getNowInSeoulIso,
  getTodayInSeoul,
  hasTodayInfoPost,
  main,
  maybeReplenishTopicQueue,
  savePost,
};
