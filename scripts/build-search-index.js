/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT_DIR = path.join(__dirname, "..");
const EVENTS_INDEX_PATH = path.join(ROOT_DIR, "public", "data", "events", "index.json");
const BENEFITS_INDEX_PATH = path.join(ROOT_DIR, "public", "data", "benefits", "index.json");
const POSTS_DIR = path.join(ROOT_DIR, "src", "content", "posts");
const SEARCH_DATA_DIR = path.join(ROOT_DIR, "public", "data", "search");
const SEARCH_INDEX_PATH = path.join(SEARCH_DATA_DIR, "index.json");

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function normalizeDate(value) {
  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  return "";
}

function getTodayInSeoul() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isVisibleEvent(item, today) {
  const effectiveStartDate = item.startDate || item.endDate;
  const effectiveEndDate = item.endDate || item.startDate;

  if (!effectiveStartDate && !effectiveEndDate) {
    return false;
  }

  return (effectiveEndDate || effectiveStartDate) >= today;
}

function createKeywordSet(values) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => {
          if (!value) {
            return [];
          }

          if (Array.isArray(value)) {
            return value;
          }

          return String(value)
            .split(/[\n,|/·]+/)
            .map((item) => item.trim());
        })
        .filter(Boolean)
    )
  );
}

function buildEventItems(eventsIndex, today) {
  return (eventsIndex.items || []).map((event) => ({
    id: event.id,
    type: "event",
    typeLabel: "행사",
    title: event.title,
    summary: event.summary,
    category: event.category,
    district: event.district,
    tags: createKeywordSet([event.category, event.district, event.organizer, event.isFree ? "무료" : "유료"]),
    keywords: createKeywordSet([
      "행사",
      "축제",
      "서울",
      event.category,
      event.district,
      event.organizer,
      event.venue,
      event.target,
      event.isFree ? "무료" : "유료",
    ]),
    href: `/events/${event.id}`,
    provider: event.organizer || "",
    venue: event.venue || "",
    dateLabel: event.dateText || [event.startDate, event.endDate].filter(Boolean).join(" ~ "),
    startDate: event.startDate || "",
    endDate: event.endDate || "",
    updatedAt: "",
    isActive: isVisibleEvent(event, today),
    isFree: Boolean(event.isFree),
  }));
}

function buildBenefitItems(benefitsIndex) {
  return (benefitsIndex.items || []).map((benefit) => ({
    id: benefit.id,
    type: "benefit",
    typeLabel: "혜택",
    title: benefit.title,
    summary: benefit.summary,
    category: benefit.field,
    district: benefit.district,
    tags: createKeywordSet([benefit.field, benefit.district, benefit.providerType]),
    keywords: createKeywordSet([
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
    ]),
    href: `/benefits/${benefit.id}`,
    provider: benefit.provider || "",
    venue: benefit.receptionAgency || "",
    dateLabel: benefit.deadlineText || "기한 정보 없음",
    startDate: "",
    endDate: "",
    updatedAt: benefit.updatedAt || benefit.registeredAt || "",
    isActive: true,
    isFree: false,
  }));
}

function buildBlogItems() {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(POSTS_DIR)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const fileContents = fs.readFileSync(path.join(POSTS_DIR, fileName), "utf8");
      const { data, content } = matter(fileContents);
      const region = typeof data.region === "string" ? data.region : "";
      const sourceType = typeof data.sourceType === "string" ? data.sourceType : "";

      if (region !== "서울" || sourceType !== "정보글") {
        return null;
      }

      const title = typeof data.title === "string" ? data.title : "";
      const summary = typeof data.summary === "string" ? data.summary : "";
      const tags = Array.isArray(data.tags) ? data.tags : [];
      const slug = fileName.replace(/\.md$/, "");

      return {
        id: slug,
        type: "blog",
        typeLabel: "블로그",
        title,
        summary,
        category: typeof data.category === "string" ? data.category : "정보",
        district: "",
        tags,
        keywords: createKeywordSet(["블로그", "서울", title, summary, tags, content.slice(0, 300)]),
        href: `/blog/${slug}`,
        provider: "서울시티",
        venue: "",
        dateLabel: normalizeDate(data.date),
        startDate: "",
        endDate: "",
        updatedAt: normalizeDate(data.date),
        isActive: true,
        isFree: false,
      };
    })
    .filter(Boolean);
}

function writeIndex(indexData) {
  fs.mkdirSync(SEARCH_DATA_DIR, { recursive: true });
  fs.writeFileSync(SEARCH_INDEX_PATH, `${JSON.stringify(indexData, null, 2)}\n`, "utf8");
}

function main() {
  const today = getTodayInSeoul();
  const eventsIndex = readJson(EVENTS_INDEX_PATH, { items: [] });
  const benefitsIndex = readJson(BENEFITS_INDEX_PATH, { items: [] });

  const items = [
    ...buildEventItems(eventsIndex, today),
    ...buildBenefitItems(benefitsIndex),
    ...buildBlogItems(),
  ];

  const indexData = {
    generatedAt: new Date().toISOString(),
    counts: {
      event: items.filter((item) => item.type === "event").length,
      benefit: items.filter((item) => item.type === "benefit").length,
      blog: items.filter((item) => item.type === "blog").length,
    },
    items,
  };

  writeIndex(indexData);

  console.log("🔎 통합 검색 인덱스 생성 완료");
  console.log(`- 행사: ${indexData.counts.event}건`);
  console.log(`- 혜택: ${indexData.counts.benefit}건`);
  console.log(`- 블로그: ${indexData.counts.blog}건`);
  console.log(`- 경로: ${SEARCH_INDEX_PATH}`);
}

main();
