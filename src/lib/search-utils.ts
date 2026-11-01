import type { SearchFilters, SearchIndexItem, SearchItemType } from "@/lib/search-types";

export type SearchMatchMode = "all" | "partial";
export type ScoredSearchItem = SearchIndexItem & { _score: number };

export interface SearchResult {
  items: ScoredSearchItem[];
  matchMode: SearchMatchMode;
}

// 거의 모든 항목에 들어 있거나 뜻을 좁히지 않는 말이라, 남겨 두면 결과만 막는다
const FILLER_TOKENS = new Set(["서울", "서울시", "서울특별시", "곳", "갈만한", "가볼만한"]);

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitQuery(query: string) {
  const tokens = normalizeText(query)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
  const meaningfulTokens = tokens.filter((token) => !FILLER_TOKENS.has(token));

  return meaningfulTokens.length > 0 ? meaningfulTokens : tokens;
}

function fieldIncludes(field: string, token: string) {
  return normalizeText(field).includes(token);
}

function arrayIncludes(fields: string[], token: string) {
  return fields.some((field) => fieldIncludes(field, token));
}

function matchItem(item: SearchIndexItem, tokens: string[]) {
  let score = 0;
  let matchedCount = 0;

  for (const token of tokens) {
    let matched = false;

    if (fieldIncludes(item.title, token)) {
      score += normalizeText(item.title).startsWith(token) ? 28 : 22;
      matched = true;
    }

    if (fieldIncludes(item.district, token)) {
      score += 16;
      matched = true;
    }

    if (fieldIncludes(item.category, token)) {
      score += 14;
      matched = true;
    }

    if (arrayIncludes(item.tags, token)) {
      score += 12;
      matched = true;
    }

    if (arrayIncludes(item.keywords, token)) {
      score += 10;
      matched = true;
    }

    if (fieldIncludes(item.provider, token) || fieldIncludes(item.venue, token)) {
      score += 8;
      matched = true;
    }

    if (fieldIncludes(item.summary, token)) {
      score += 6;
      matched = true;
    }

    if (matched) {
      matchedCount += 1;
    }
  }

  if (matchedCount === 0) {
    return { score, matchedCount };
  }

  if (item.isActive) {
    score += 4;
  }

  if (item.type === "event" && item.startDate) {
    score += 2;
  }

  return { score, matchedCount };
}

function compareItems(a: ScoredSearchItem, b: ScoredSearchItem) {
  if (b._score !== a._score) {
    return b._score - a._score;
  }

  if (a.isActive !== b.isActive) {
    return Number(b.isActive) - Number(a.isActive);
  }

  if (a.type === "event" && b.type === "event") {
    return (a.startDate || "9999-12-31").localeCompare(b.startDate || "9999-12-31");
  }

  const aDate = a.updatedAt || a.startDate || "";
  const bDate = b.updatedAt || b.startDate || "";

  return bDate.localeCompare(aDate);
}

function passesFilters(item: SearchIndexItem, filters: SearchFilters) {
  if (filters.type !== "all" && item.type !== filters.type) {
    return false;
  }

  if (filters.district !== "전체 지역" && item.district !== filters.district) {
    return false;
  }

  if (filters.activeOnly && !item.isActive) {
    return false;
  }

  return true;
}

export function searchItems(items: SearchIndexItem[], filters: SearchFilters): SearchResult {
  const tokens = splitQuery(filters.query);
  const candidates = items.filter((item) => passesFilters(item, filters));

  if (tokens.length === 0) {
    return {
      items: candidates.map((item) => ({ ...item, _score: item.isActive ? 1 : 0 })).sort(compareItems),
      matchMode: "all",
    };
  }

  const matches = candidates.map((item) => {
    const { score, matchedCount } = matchItem(item, tokens);
    return { item: { ...item, _score: score }, matchedCount };
  });
  const fullMatches = matches.filter((match) => match.matchedCount === tokens.length);

  if (fullMatches.length > 0 || tokens.length === 1) {
    return { items: fullMatches.map((match) => match.item).sort(compareItems), matchMode: "all" };
  }

  // 모든 단어가 맞는 결과가 없을 때만, 많이 맞은 결과부터 보여준다
  const partialMatches = matches
    .filter((match) => match.matchedCount > 0)
    .sort((a, b) => b.matchedCount - a.matchedCount || compareItems(a.item, b.item));

  return {
    items: partialMatches.map((match) => match.item),
    matchMode: partialMatches.length > 0 ? "partial" : "all",
  };
}

export function filterSearchItems(items: SearchIndexItem[], filters: SearchFilters) {
  return searchItems(items, filters).items;
}

export function getSuggestionItems(items: SearchIndexItem[], query: string, limit = 6) {
  const results = filterSearchItems(items, {
    query,
    type: "all",
    district: "전체 지역",
    activeOnly: true,
  });

  return results.slice(0, limit);
}

export function getSearchDistricts(items: SearchIndexItem[]) {
  return Array.from(new Set(items.map((item) => item.district).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "ko")
  );
}

export function getSearchTypeLabel(type: SearchItemType) {
  switch (type) {
    case "event":
      return "행사";
    case "benefit":
      return "혜택";
    case "food":
      return "먹거리";
    case "blog":
      return "블로그";
  }
}
