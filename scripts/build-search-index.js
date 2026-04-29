/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT_DIR = path.join(__dirname, "..");
const POSTS_DIR = path.join(ROOT_DIR, "src", "content", "posts");
const EVENTS_INDEX_PATH = path.join(ROOT_DIR, "public", "data", "events", "index.json");
const BENEFITS_INDEX_PATH = path.join(ROOT_DIR, "public", "data", "benefits", "index.json");
const FOOD_INDEX_PATH = path.join(ROOT_DIR, "public", "data", "food", "index.json");
const CHAT_SEARCH_INDEX_PATH = path.join(ROOT_DIR, "public", "data", "search-index.json");
const UNIFIED_SEARCH_INDEX_PATH = path.join(ROOT_DIR, "public", "data", "search", "index.json");

function stripMarkdown(value) {
  return String(value || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[\s>*-]*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/[*_>#|]/g, "")
    .replace(/-{3,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function normalizeTimestamp(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const trimmedValue = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return `${trimmedValue}T00:00:00.000Z`;
  }

  return trimmedValue;
}

function getLatestTimestamp(values) {
  return values.map(normalizeTimestamp).filter(Boolean).sort().at(-1) || "";
}

function getTodayInSeoul(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function readJsonFile(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function getMarkdownFiles() {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(POSTS_DIR)
    .filter((fileName) => fileName.endsWith(".md"))
    .sort();
}

function getPostRecords() {
  return getMarkdownFiles().map((fileName) => {
    const filePath = path.join(POSTS_DIR, fileName);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);
    const slug = fileName.replace(/\.md$/, "");

    return {
      slug,
      data,
      content,
    };
  });
}

function uniqueValues(values) {
  return Array.from(
    new Set(
      values
        .flat()
        .map((value) => stripMarkdown(value))
        .filter(Boolean),
    ),
  );
}

function formatEventDateLabel(event) {
  if (event.startDate && event.endDate && event.startDate !== event.endDate) {
    return `${event.startDate}~${event.endDate}`;
  }

  return event.startDate || event.endDate || event.dateText || "";
}

function isEventActive(event, today) {
  const effectiveEndDate = event.endDate || event.startDate;

  if (!effectiveEndDate) {
    return false;
  }

  return effectiveEndDate >= today;
}

function isBenefitActive(benefit, today) {
  if (benefit.isAlwaysOpen) {
    return true;
  }

  if (!benefit.deadlineSortKey || benefit.deadlineSortKey === "9999-12-31") {
    return true;
  }

  return benefit.deadlineSortKey >= today;
}

function buildEventSearchItem(event, today) {
  const feeLabel = event.isFree ? "무료" : "유료";

  return {
    id: event.id,
    type: "event",
    typeLabel: "행사",
    title: event.title || "",
    summary: event.summary || "",
    category: event.category || "",
    district: event.district || "",
    tags: uniqueValues([event.category, event.district, event.venue, feeLabel]),
    keywords: uniqueValues([
      "행사",
      "축제",
      "서울",
      event.category,
      event.district,
      event.venue,
      event.organizer,
      event.target,
      event.fee,
      event.summary,
      feeLabel,
    ]),
    href: `/events/${event.id}`,
    provider: event.organizer || "",
    venue: event.venue || "",
    dateLabel: formatEventDateLabel(event),
    startDate: event.startDate || "",
    endDate: event.endDate || "",
    updatedAt: "",
    isActive: isEventActive(event, today),
    isFree: Boolean(event.isFree),
    isExternal: false,
  };
}

function buildBenefitSearchItem(benefit, today) {
  const fieldTags = String(benefit.field || "")
    .split("·")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    id: benefit.id,
    type: "benefit",
    typeLabel: "혜택",
    title: benefit.title || "",
    summary: benefit.summary || "",
    category: benefit.field || "",
    district: benefit.district || "",
    tags: uniqueValues([
      fieldTags,
      benefit.district,
      benefit.providerType,
      benefit.supportType,
    ]),
    keywords: uniqueValues([
      "혜택",
      "지원금",
      "공공서비스",
      "서울",
      benefit.field,
      benefit.district,
      benefit.provider,
      benefit.providerType,
      benefit.userType,
      benefit.supportType,
      benefit.targetSummary,
      benefit.supportSummary,
      benefit.receptionAgency,
      benefit.applicationMethodTypes || [],
      benefit.inquiry || [],
      benefit.summary,
    ]),
    href: `/benefits/${benefit.id}`,
    provider: benefit.provider || "",
    venue: benefit.receptionAgency || "",
    dateLabel: benefit.isAlwaysOpen ? "상시신청" : benefit.deadlineText || "상세페이지 확인",
    startDate: "",
    endDate: benefit.isAlwaysOpen ? "" : benefit.deadlineSortKey || "",
    updatedAt: benefit.updatedAt || "",
    isActive: isBenefitActive(benefit, today),
    isFree: false,
    isExternal: false,
  };
}

function buildKakaoMapSearchUrl(query) {
  return `https://map.kakao.com/link/search/${encodeURIComponent(String(query || "").trim())}`;
}

function buildFoodSearchItem(place) {
  const address = place.roadAddress || place.address || "";
  const areaLabel = [place.district, place.area].filter(Boolean).join(" · ");
  const mapSearchQuery =
    place.mapSearchQuery || address || [place.district, place.area, place.name].filter(Boolean).join(" ");

  return {
    id: place.id,
    type: "food",
    typeLabel: "먹거리",
    title: place.name || "",
    summary:
      place.summary ||
      `${areaLabel || "서울"}에 등록된 ${place.category || place.mainMenu || "음식점"} 정보입니다.`,
    category: place.category || place.mainMenu || "",
    district: place.district || "",
    tags: uniqueValues([
      place.category,
      place.mainMenu,
      place.district,
      place.area,
      place.status,
    ]),
    keywords: uniqueValues([
      "먹거리",
      "음식점",
      "식당",
      "서울",
      place.name,
      place.category,
      place.mainMenu,
      place.district,
      place.area,
      address,
      place.summary,
    ]),
    href: buildKakaoMapSearchUrl(mapSearchQuery),
    provider: place.sourceLabel || "서울 열린데이터광장",
    venue: address || areaLabel,
    dateLabel: place.updatedAt || place.licenseDate || "",
    startDate: place.licenseDate || "",
    endDate: "",
    updatedAt: place.updatedAt || "",
    isActive: place.status === "영업",
    isFree: false,
    isExternal: true,
  };
}

function buildBlogSearchItem(post) {
  const title = stripMarkdown(post.data.title);
  const summary = stripMarkdown(post.data.summary);
  const category = stripMarkdown(post.data.category);
  const tags = Array.isArray(post.data.tags) ? post.data.tags : [];
  const date = normalizeDate(post.data.date);
  const updatedAt = normalizeDate(post.data.updatedAt) || date;
  const contentPreview = stripMarkdown(post.content).slice(0, 700);

  return {
    id: post.slug,
    type: "blog",
    typeLabel: "블로그",
    title,
    summary,
    category,
    district: "",
    tags: uniqueValues(tags),
    keywords: uniqueValues([
      "블로그",
      "서울",
      title,
      summary,
      category,
      tags,
      contentPreview,
    ]),
    href: `/blog/${post.slug}`,
    provider: "서울시티",
    venue: "",
    dateLabel: date,
    startDate: "",
    endDate: "",
    updatedAt,
    isActive: true,
    isFree: false,
    isExternal: false,
  };
}

function buildChatSearchIndex(posts) {
  return posts.map((post) => ({
    slug: post.slug,
    title: stripMarkdown(post.data.title),
    summary: stripMarkdown(post.data.summary),
    content: stripMarkdown(post.content).slice(0, 500),
  }));
}

function buildUnifiedSearchIndex(posts) {
  const today = getTodayInSeoul();
  const eventsIndex = readJsonFile(EVENTS_INDEX_PATH, { items: [] });
  const benefitsIndex = readJsonFile(BENEFITS_INDEX_PATH, { items: [] });
  const foodIndex = readJsonFile(FOOD_INDEX_PATH, { items: [] });
  const publicPosts = posts.filter((post) => {
    return post.data.region === "서울" && post.data.sourceType === "정보글";
  });
  const eventItems = (eventsIndex.items || []).map((event) =>
    buildEventSearchItem(event, today),
  );
  const benefitItems = (benefitsIndex.items || []).map((benefit) =>
    buildBenefitSearchItem(benefit, today),
  );
  const foodItems = (foodIndex.items || []).map(buildFoodSearchItem);
  const blogItems = publicPosts.map(buildBlogSearchItem);
  const generatedAt = getLatestTimestamp([
    eventsIndex.source?.collectedAt,
    benefitsIndex.source?.collectedAt,
    foodIndex.source?.collectedAt,
    ...publicPosts.map((post) => post.data.updatedAt || post.data.date),
  ]);

  return {
    generatedAt,
    counts: {
      event: eventItems.length,
      benefit: benefitItems.length,
      food: foodItems.length,
      blog: blogItems.length,
    },
    items: [...eventItems, ...benefitItems, ...foodItems, ...blogItems],
  };
}

function writeJsonFile(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function main() {
  const posts = getPostRecords();
  const chatSearchIndex = buildChatSearchIndex(posts);
  const unifiedSearchIndex = buildUnifiedSearchIndex(posts);

  writeJsonFile(CHAT_SEARCH_INDEX_PATH, chatSearchIndex);
  writeJsonFile(UNIFIED_SEARCH_INDEX_PATH, unifiedSearchIndex);

  console.log(`Chat search index built: ${chatSearchIndex.length} entries`);
  console.log(
    `Unified search index built: ${unifiedSearchIndex.items.length} entries ` +
      `(${unifiedSearchIndex.counts.event} events, ` +
      `${unifiedSearchIndex.counts.benefit} benefits, ` +
      `${unifiedSearchIndex.counts.food} food places, ` +
      `${unifiedSearchIndex.counts.blog} blogs)`,
  );
}

main();
