import type { SearchFilters, SearchIndexItem, SearchItemType } from "@/lib/search-types";

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitQuery(query: string) {
  return normalizeText(query)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function fieldIncludes(field: string, token: string) {
  return normalizeText(field).includes(token);
}

function arrayIncludes(fields: string[], token: string) {
  return fields.some((field) => fieldIncludes(field, token));
}

function scoreItem(item: SearchIndexItem, tokens: string[]) {
  if (tokens.length === 0) {
    return 0;
  }

  let score = 0;

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

    if (!matched) {
      return -1;
    }
  }

  if (item.isActive) {
    score += 4;
  }

  if (item.type === "event" && item.startDate) {
    score += 2;
  }

  return score;
}

function compareItems(a: SearchIndexItem & { _score: number }, b: SearchIndexItem & { _score: number }) {
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

export function filterSearchItems(items: SearchIndexItem[], filters: SearchFilters) {
  const tokens = splitQuery(filters.query);
  const filtered = items.filter((item) => {
    if (filters.type !== "all" && item.type !== filters.type) {
      return false;
    }

    if (filters.district !== "전체 지역" && item.district !== filters.district) {
      return false;
    }

    if (filters.activeOnly && !item.isActive) {
      return false;
    }

    if (tokens.length === 0) {
      return true;
    }

    return scoreItem(item, tokens) >= 0;
  });

  return filtered
    .map((item) => ({
      ...item,
      _score: tokens.length === 0 ? (item.isActive ? 1 : 0) : scoreItem(item, tokens),
    }))
    .sort(compareItems);
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
