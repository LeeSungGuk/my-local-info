import assert from "node:assert/strict";
import test from "node:test";
import { filterSearchItems, searchItems } from "./search-utils.ts";
import type { SearchFilters, SearchIndexItem } from "./search-types.ts";

function makeItem(overrides: Partial<SearchIndexItem>): SearchIndexItem {
  return {
    id: overrides.id ?? "item",
    type: overrides.type ?? "blog",
    typeLabel: overrides.typeLabel ?? "블로그",
    title: overrides.title ?? "",
    summary: overrides.summary ?? "",
    category: overrides.category ?? "",
    district: overrides.district ?? "",
    tags: overrides.tags ?? [],
    keywords: overrides.keywords ?? [],
    href: overrides.href ?? "/",
    provider: overrides.provider ?? "",
    venue: overrides.venue ?? "",
    dateLabel: overrides.dateLabel ?? "",
    startDate: overrides.startDate ?? "",
    endDate: overrides.endDate ?? "",
    updatedAt: overrides.updatedAt ?? "",
    isActive: overrides.isActive ?? true,
    isFree: overrides.isFree ?? false,
    isExternal: overrides.isExternal ?? false,
  };
}

function makeFilters(query: string): SearchFilters {
  return { query, type: "all", district: "전체 지역", activeOnly: false };
}

const items = [
  makeItem({ id: "kids-walk", title: "서울에서 아이와 함께 걷는 주말", summary: "서울 가족 나들이" }),
  makeItem({ id: "kids-indoor", title: "아이와 부담 없이 즐기는 실내 공간", summary: "서울 무료 전시" }),
  makeItem({ id: "seongdong-free", type: "event", title: "성수 무료 공연", district: "성동구", summary: "서울 성동구" }),
  makeItem({ id: "seongdong-exhibit", type: "event", title: "성수 사진전", district: "성동구", category: "전시" }),
  makeItem({ id: "jongno-free-exhibit", type: "event", title: "종로 무료 전시", district: "종로구" }),
  makeItem({ id: "gangnam-free", type: "event", title: "강남 무료 강좌", district: "강남구" }),
  makeItem({ id: "mapo-food", type: "food", title: "망원 칼국수", district: "마포구", summary: "서울 마포구 맛집" }),
];

test("ignores filler words such as 서울, 곳, 갈만한 so situation shortcuts find results", () => {
  const result = searchItems(items, makeFilters("서울 아이와 갈만한 곳"));

  assert.equal(result.matchMode, "all");
  assert.deepEqual(result.items.map((item) => item.id).sort(), ["kids-indoor", "kids-walk"]);
});

test("searches filler words as typed when the query has nothing else", () => {
  const result = searchItems(items, makeFilters("서울"));

  assert.equal(result.matchMode, "all");
  assert.equal(result.items.length, 4);
});

test("falls back to partial matches ranked by matched word count when no item matches every word", () => {
  const result = searchItems(items, makeFilters("성동구 무료 전시"));

  assert.equal(result.matchMode, "partial");
  const ids = result.items.map((item) => item.id);
  const twoWordMatches = ["seongdong-free", "seongdong-exhibit", "jongno-free-exhibit", "kids-indoor"];

  assert.deepEqual(ids.slice(0, 4).sort(), [...twoWordMatches].sort());
  assert.equal(ids[4], "gangnam-free");
  assert.ok(!ids.includes("mapo-food"));
  assert.ok(!ids.includes("kids-walk"));
});

test("keeps strict matching when some item matches every word", () => {
  const result = searchItems(items, makeFilters("종로 무료 전시"));

  assert.equal(result.matchMode, "all");
  assert.deepEqual(result.items.map((item) => item.id), ["jongno-free-exhibit"]);
});

test("does not fall back to partial matches for a single word", () => {
  const result = searchItems(items, makeFilters("벚꽃"));

  assert.equal(result.matchMode, "all");
  assert.equal(result.items.length, 0);
});

test("filterSearchItems returns the same items as searchItems", () => {
  const filters = makeFilters("성동구 무료 전시");

  assert.deepEqual(
    filterSearchItems(items, filters).map((item) => item.id),
    searchItems(items, filters).items.map((item) => item.id)
  );
});

test("applies type and district filters before matching words", () => {
  const result = searchItems(items, { ...makeFilters("무료"), type: "event", district: "성동구" });

  assert.deepEqual(result.items.map((item) => item.id), ["seongdong-free"]);
});
