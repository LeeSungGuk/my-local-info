import assert from "node:assert/strict";
import test from "node:test";
import {
  getAllSituations,
  getRelatedPostsForSituation,
  getSituationBySlug,
} from "./situations.ts";
import type { Post } from "./posts.ts";

function makePost(overrides: Partial<Post>): Post {
  return {
    slug: overrides.slug ?? overrides.sourceId ?? "post",
    title: overrides.title ?? "",
    date: overrides.date ?? "2026-04-16",
    updatedAt: overrides.updatedAt ?? "2026-04-16",
    summary: overrides.summary ?? "",
    category: overrides.category ?? "서울 코스",
    tags: overrides.tags ?? [],
    content: overrides.content ?? "",
    region: overrides.region ?? "서울",
    sourceType: overrides.sourceType ?? "정보글",
    sourceId: overrides.sourceId ?? overrides.slug ?? "post",
    sourceUrl: overrides.sourceUrl ?? "",
    sourceNote: overrides.sourceNote ?? "",
    coverImage: overrides.coverImage ?? "",
    coverAlt: overrides.coverAlt ?? "",
  };
}

test("defines the first three public situation guides", () => {
  assert.deepEqual(
    getAllSituations().map((situation) => situation.slug),
    ["kids", "rainy-day", "free"]
  );
  assert.deepEqual(
    getAllSituations().map((situation) => situation.href),
    ["/situations/kids", "/situations/rainy-day", "/situations/free"]
  );
});

test("looks up a situation by slug and returns null for unknown slugs", () => {
  assert.equal(getSituationBySlug("kids")?.title, "아이와 서울 나들이");
  assert.equal(getSituationBySlug("unknown"), null);
});

test("related posts prefer explicit source ids before tag matches and dedupe posts", () => {
  const free = getSituationBySlug("free");
  assert.ok(free);

  const posts = [
    makePost({
      slug: "tag-match-first",
      sourceId: "tag-match-first",
      title: "서울 저비용 반나절 코스",
      tags: ["저비용"],
    }),
    makePost({
      slug: "2026-04-16-seoul-free-spot-guide",
      sourceId: "seoul-free-spot-guide",
      title: "서울 무료 나들이 코스",
      tags: ["무료", "서울"],
    }),
    makePost({
      slug: "duplicate-source-id",
      sourceId: "seoul-free-spot-guide",
      title: "서울 무료 나들이 코스 복제",
      tags: ["무료", "공원"],
    }),
    makePost({
      slug: "unrelated",
      sourceId: "unrelated",
      title: "서울 야간 데이트",
      tags: ["데이트"],
    }),
  ];

  assert.deepEqual(
    getRelatedPostsForSituation(free, posts).map((post) => post.sourceId),
    ["seoul-free-spot-guide", "tag-match-first"]
  );
});
