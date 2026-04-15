/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => String(value || "").trim())
    .filter(Boolean);
}

function normalizeTopicInput(topic) {
  return {
    id: String(topic?.id || "").trim(),
    titleHint: String(topic?.titleHint || "").trim(),
    topicCategory: String(topic?.topicCategory || "").trim(),
    angle: String(topic?.angle || "").trim(),
    places: normalizeArray(topic?.places),
    tags: normalizeArray(topic?.tags),
    ...(typeof topic?.coverImage === "string" && topic.coverImage.trim()
      ? { coverImage: topic.coverImage.trim() }
      : {}),
    ...(typeof topic?.coverAlt === "string" && topic.coverAlt.trim()
      ? { coverAlt: topic.coverAlt.trim() }
      : {}),
  };
}

function isValidTopic(topic) {
  return Boolean(
    topic.id &&
      topic.titleHint &&
      topic.topicCategory &&
      topic.angle &&
      topic.places.length > 0 &&
      topic.tags.length > 0
  );
}

function isSeoulInfoPost(post) {
  return post?.sourceType === "정보글" && post?.region === "서울" && Boolean(post?.sourceId);
}

function createTopicRecord(topic, { status = "pending", origin = "seed", createdAt, usedAt = null } = {}) {
  const normalized = normalizeTopicInput(topic);

  return {
    ...normalized,
    origin,
    status,
    createdAt,
    usedAt,
  };
}

function writeTopicQueue(queue, queueFilePath) {
  const directory = path.dirname(queueFilePath);
  fs.mkdirSync(directory, { recursive: true });

  const tempFilePath = `${queueFilePath}.tmp`;
  fs.writeFileSync(tempFilePath, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
  fs.renameSync(tempFilePath, queueFilePath);
}

function buildSeedQueue({ seedTopics, posts, nowIso }) {
  const usedTopicIds = new Set(posts.filter(isSeoulInfoPost).map((post) => post.sourceId));

  return {
    version: 1,
    lastGeneratedAt: null,
    topics: seedTopics
      .map(normalizeTopicInput)
      .filter(isValidTopic)
      .map((topic) =>
        createTopicRecord(topic, {
          status: usedTopicIds.has(topic.id) ? "used" : "pending",
          origin: "seed",
          createdAt: nowIso,
          usedAt: usedTopicIds.has(topic.id) ? nowIso : null,
        })
      ),
  };
}

function loadExistingQueue(queueFilePath) {
  if (!fs.existsSync(queueFilePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(queueFilePath, "utf8");
  const parsed = JSON.parse(fileContents);

  if (!parsed || !Array.isArray(parsed.topics)) {
    throw new Error("주제 큐 파일 형식이 올바르지 않습니다.");
  }

  return {
    version: typeof parsed.version === "number" ? parsed.version : 1,
    lastGeneratedAt: typeof parsed.lastGeneratedAt === "string" ? parsed.lastGeneratedAt : null,
    topics: parsed.topics
      .map((topic) => {
        const normalized = normalizeTopicInput(topic);

        return {
          ...normalized,
          origin: topic?.origin === "ai" ? "ai" : "seed",
          status: topic?.status === "used" ? "used" : "pending",
          createdAt: typeof topic?.createdAt === "string" ? topic.createdAt : null,
          usedAt: typeof topic?.usedAt === "string" ? topic.usedAt : null,
        };
      })
      .filter(isValidTopic),
  };
}

function syncQueueWithPosts(queue, posts, nowIso) {
  const usedTopicIds = new Set(posts.filter(isSeoulInfoPost).map((post) => post.sourceId));

  return {
    ...queue,
    topics: queue.topics.map((topic) => {
      if (!usedTopicIds.has(topic.id)) {
        return topic;
      }

      return {
        ...topic,
        status: "used",
        usedAt: topic.usedAt || nowIso,
      };
    }),
  };
}

function mergeSeedTopics(queue, seedTopics, posts, nowIso) {
  const usedTopicIds = new Set(posts.filter(isSeoulInfoPost).map((post) => post.sourceId));
  const existingIds = new Set(queue.topics.map((topic) => topic.id));
  const appendedTopics = seedTopics
    .map(normalizeTopicInput)
    .filter(isValidTopic)
    .filter((topic) => !existingIds.has(topic.id))
    .map((topic) =>
      createTopicRecord(topic, {
        status: usedTopicIds.has(topic.id) ? "used" : "pending",
        origin: "seed",
        createdAt: nowIso,
        usedAt: usedTopicIds.has(topic.id) ? nowIso : null,
      })
    );

  return {
    ...queue,
    topics: [...queue.topics, ...appendedTopics],
  };
}

function loadTopicQueue({ queueFilePath, seedTopics, posts = [], nowIso }) {
  const existingQueue = loadExistingQueue(queueFilePath);
  const queue = existingQueue
    ? mergeSeedTopics(syncQueueWithPosts(existingQueue, posts, nowIso), seedTopics, posts, nowIso)
    : buildSeedQueue({ seedTopics, posts, nowIso });

  writeTopicQueue(queue, queueFilePath);

  return queue;
}

function countPendingTopics(queue) {
  return queue.topics.filter((topic) => topic.status === "pending").length;
}

function shouldReplenishTopics(queue, minimumPendingTopics) {
  return countPendingTopics(queue) < minimumPendingTopics;
}

function selectNextPendingTopic(queue) {
  return queue.topics.find((topic) => topic.status === "pending") || null;
}

function hasOverlappingCategoryAndPlaces(candidate, existingTopic) {
  if (normalizeText(candidate.topicCategory) !== normalizeText(existingTopic.topicCategory)) {
    return false;
  }

  const candidatePlaces = new Set(candidate.places.map(normalizeText));
  const overlapCount = existingTopic.places.filter((place) => candidatePlaces.has(normalizeText(place))).length;
  return overlapCount >= 2;
}

function filterGeneratedTopics({ candidates, queue, posts }) {
  const existingIds = new Set([
    ...queue.topics.map((topic) => topic.id),
    ...posts.filter(isSeoulInfoPost).map((post) => post.sourceId),
  ]);
  const existingTitles = new Set(queue.topics.map((topic) => normalizeText(topic.titleHint)));
  const acceptedTopics = [];

  for (const candidate of candidates) {
    const normalized = normalizeTopicInput(candidate);

    if (!isValidTopic(normalized)) {
      continue;
    }

    const normalizedTitle = normalizeText(normalized.titleHint);

    if (existingIds.has(normalized.id) || existingTitles.has(normalizedTitle)) {
      continue;
    }

    const comparisonPool = [...queue.topics, ...acceptedTopics];
    if (comparisonPool.some((topic) => hasOverlappingCategoryAndPlaces(normalized, topic))) {
      continue;
    }

    existingIds.add(normalized.id);
    existingTitles.add(normalizedTitle);
    acceptedTopics.push(normalized);
  }

  return acceptedTopics;
}

function markTopicAsUsed(queue, topicId, nowIso) {
  return {
    ...queue,
    topics: queue.topics.map((topic) =>
      topic.id === topicId
        ? {
            ...topic,
            status: "used",
            usedAt: nowIso,
          }
        : topic
    ),
  };
}

function mergeGeneratedTopics(queue, topics, nowIso) {
  return {
    ...queue,
    topics: [
      ...queue.topics,
      ...topics.map((topic) =>
        createTopicRecord(topic, {
          status: "pending",
          origin: "ai",
          createdAt: nowIso,
          usedAt: null,
        })
      ),
    ],
  };
}

module.exports = {
  countPendingTopics,
  createTopicRecord,
  filterGeneratedTopics,
  loadTopicQueue,
  markTopicAsUsed,
  mergeGeneratedTopics,
  selectNextPendingTopic,
  shouldReplenishTopics,
  writeTopicQueue,
};
