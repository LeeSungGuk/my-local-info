# Seoul Blog Topic Queue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist Seoul blog topics in a queue file, auto-replenish pending topics with AI when stock is low, and mark topics as used only after a post is successfully written.

**Architecture:** Keep the existing `scripts/seoul-blog-topics.js` array as seed data, but move runtime state into a JSON queue file under `data/`. Refactor `scripts/generate-blog-post.js` into testable helper functions for queue loading, topic replenishment, duplicate filtering, and successful-use state transitions, while keeping the current daily one-post guard and cover generation flow.

**Tech Stack:** Node.js scripts, `gray-matter`, built-in `node:test`, filesystem JSON persistence

---

### Task 1: Add queue behavior tests first

**Files:**
- Create: `scripts/generate-blog-post.test.js`
- Modify: `scripts/generate-blog-post.js`

- [ ] **Step 1: Write the failing queue initialization and selection tests**

```js
test("loadTopicQueue seeds missing queue file and marks existing post topics as used", () => {
  const queue = loadTopicQueue({
    queueFilePath,
    seedTopics: [
      { id: "used-topic", titleHint: "used", topicCategory: "코스", angle: "a", places: ["A"], tags: ["x"] },
      { id: "pending-topic", titleHint: "pending", topicCategory: "코스", angle: "b", places: ["B"], tags: ["y"] },
    ],
    posts: [{ sourceId: "used-topic", sourceType: "정보글", region: "서울" }],
    nowIso: "2026-04-15T07:30:00+09:00",
  });

  assert.equal(queue.topics[0].status, "used");
  assert.equal(queue.topics[1].status, "pending");
  assert.equal(selectNextPendingTopic(queue).id, "pending-topic");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/generate-blog-post.test.js`
Expected: FAIL because `loadTopicQueue` and `selectNextPendingTopic` are not exported yet

- [ ] **Step 3: Write minimal queue helpers**

```js
function loadTopicQueue({ queueFilePath, seedTopics, posts, nowIso }) {
  // read queue if present, otherwise seed from seedTopics
}

function selectNextPendingTopic(queue) {
  return queue.topics.find((topic) => topic.status === "pending") || null;
}

module.exports = {
  loadTopicQueue,
  selectNextPendingTopic,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/generate-blog-post.test.js`
Expected: PASS for the new queue initialization test

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-blog-post.js scripts/generate-blog-post.test.js
git commit -m "test: cover seed queue initialization for blog topics"
```

### Task 2: Cover duplicate filtering and replenishment triggers

**Files:**
- Modify: `scripts/generate-blog-post.js`
- Modify: `scripts/generate-blog-post.test.js`

- [ ] **Step 1: Write the failing duplicate-filter and replenish-trigger tests**

```js
test("shouldReplenishTopics returns true only when pending stock is below threshold", () => {
  assert.equal(shouldReplenishTopics({ topics: [{ status: "pending" }] }, 2), true);
  assert.equal(shouldReplenishTopics({ topics: [{ status: "pending" }, { status: "pending" }] }, 2), false);
});

test("filterGeneratedTopics removes id and normalized title duplicates", () => {
  const filtered = filterGeneratedTopics({
    candidates: [
      { id: "fresh-topic", titleHint: "서울 비 오는 날 실내 코스", topicCategory: "실내", angle: "x", places: ["A"], tags: ["t"] },
      { id: "used-topic", titleHint: "다른 제목", topicCategory: "실내", angle: "x", places: ["A"], tags: ["t"] },
      { id: "another-id", titleHint: "서울  비 오는 날  실내 코스", topicCategory: "실내", angle: "x", places: ["B"], tags: ["t"] },
    ],
    queue,
    posts,
  });

  assert.deepEqual(filtered.map((topic) => topic.id), ["fresh-topic"]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/generate-blog-post.test.js`
Expected: FAIL because replenish and duplicate-filter helpers do not exist yet

- [ ] **Step 3: Write minimal replenish and duplicate-filter helpers**

```js
function shouldReplenishTopics(queue, minimumPendingTopics) {
  return countPendingTopics(queue) < minimumPendingTopics;
}

function filterGeneratedTopics({ candidates, queue, posts }) {
  // remove duplicates by id and normalized title
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/generate-blog-post.test.js`
Expected: PASS for replenish and duplicate-filter coverage

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-blog-post.js scripts/generate-blog-post.test.js
git commit -m "test: cover topic replenishment filtering"
```

### Task 3: Wire queue persistence and successful-use transitions into generation flow

**Files:**
- Modify: `scripts/generate-blog-post.js`
- Modify: `scripts/generate-blog-post.test.js`
- Create: `data/seoul-blog-topic-queue.json`

- [ ] **Step 1: Write the failing used-transition test**

```js
test("markTopicAsUsed only updates queue after save success", () => {
  const queue = {
    version: 1,
    topics: [
      { id: "pending-topic", status: "pending", createdAt: nowIso, usedAt: null, titleHint: "pending", topicCategory: "코스", angle: "a", places: ["A"], tags: ["x"], origin: "seed" },
    ],
  };

  const updated = markTopicAsUsed(queue, "pending-topic", nowIso);

  assert.equal(updated.topics[0].status, "used");
  assert.equal(updated.topics[0].usedAt, nowIso);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/generate-blog-post.test.js`
Expected: FAIL because `markTopicAsUsed` and queue persistence are not implemented yet

- [ ] **Step 3: Write minimal implementation for queue persistence and main flow**

```js
function markTopicAsUsed(queue, topicId, nowIso) {
  return {
    ...queue,
    topics: queue.topics.map((topic) =>
      topic.id === topicId ? { ...topic, status: "used", usedAt: nowIso } : topic
    ),
  };
}

async function main() {
  // keep existing today guard
  // load queue
  // replenish when needed
  // generate post from next pending topic
  // save post
  // mark used and write queue JSON atomically
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/generate-blog-post.test.js scripts/generate-blog-cover.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-blog-post.js scripts/generate-blog-post.test.js data/seoul-blog-topic-queue.json
git commit -m "feat: persist and replenish Seoul blog topic queue"
```

### Task 4: Verify the script surface and linting

**Files:**
- Modify: `scripts/generate-blog-post.js`
- Modify: `scripts/generate-blog-post.test.js`
- Modify: `data/seoul-blog-topic-queue.json`

- [ ] **Step 1: Run focused test suite**

Run: `node --test scripts/generate-blog-post.test.js scripts/generate-blog-cover.test.js`
Expected: PASS

- [ ] **Step 2: Run lint for changed script files**

Run: `npx eslint scripts/generate-blog-post.js scripts/generate-blog-post.test.js scripts/generate-blog-cover.js`
Expected: PASS with no errors

- [ ] **Step 3: Sanity-check queue JSON shape**

Run: `node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('data/seoul-blog-topic-queue.json','utf8')); console.log('queue json ok')"`
Expected: `queue json ok`

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-blog-post.js scripts/generate-blog-post.test.js data/seoul-blog-topic-queue.json
git commit -m "chore: verify Seoul blog topic queue workflow"
```
