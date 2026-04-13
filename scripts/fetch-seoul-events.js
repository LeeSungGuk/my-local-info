/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { createHash } = require("crypto");

const API_BASE = "http://openapi.seoul.go.kr:8088";
const SERVICE_NAME = "culturalEventInfo";
const EVENTS_DIR = path.join(__dirname, "..", "public", "data", "events");
const ITEMS_DIR = path.join(EVENTS_DIR, "items");
const OFFICIAL_URL = "https://data.seoul.go.kr/dataList/OA-15486/S/1/datasetView.do";
const ENV_FILE_PATH = path.join(__dirname, "..", ".env.local");

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

const API_KEY = process.env.SEOUL_OPEN_DATA_API_KEY || process.env.PUBLIC_DATA_API_KEY || "sample";
const START_DATE_FILTER = process.env.EVENTS_START_DATE || "2026-04-01";

function toDateOnly(value) {
  if (!value) {
    return "";
  }

  const normalized = String(value).trim();
  return normalized.slice(0, 10);
}

function loadExistingIndex() {
  try {
    const filePath = path.join(EVENTS_DIR, "index.json");
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function buildSummaryRecord(event) {
  return {
    id: event.id,
    sourceId: event.sourceId,
    title: event.title,
    category: event.category,
    district: event.district,
    venue: event.venue,
    startDate: event.startDate,
    endDate: event.endDate,
    dateText: event.dateText,
    timeText: event.timeText,
    target: event.target,
    fee: event.fee,
    isFree: event.isFree,
    organizer: event.organizer,
    inquiry: event.inquiry,
    imageUrl: event.imageUrl,
    detailUrl: event.detailUrl,
    summary: event.summary,
  };
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractCultcode(detailUrl) {
  if (!detailUrl) {
    return "";
  }

  try {
    const url = new URL(detailUrl);
    return url.searchParams.get("cultcode") || "";
  } catch {
    return "";
  }
}

function buildEventId(row) {
  const sourceId = extractCultcode(row.HMPG_ADDR);

  if (sourceId) {
    return {
      id: `seoul-event-${sourceId}`,
      sourceId,
    };
  }

  const fallbackSeed = [row.TITLE, row.STRTDATE, row.PLACE, row.ORG_NAME].join("|");
  const fallbackId = createHash("sha1").update(fallbackSeed).digest("hex").slice(0, 12);

  return {
    id: `seoul-event-${fallbackId}`,
    sourceId: fallbackId,
  };
}

function buildSummary(row) {
  const isFree = detectIsFree(row);
  const parts = [];

  if (row.GUNAME) {
    parts.push(row.GUNAME);
  }

  if (row.PLACE) {
    parts.push(row.PLACE);
  }

  const locationText = parts.length > 0 ? `${parts.join(" · ")}에서 열리는` : "서울에서 열리는";
  const feeText = isFree ? "무료로 참여할 수 있는 행사입니다." : `${row.USE_FEE || "이용 요금은 상세 페이지를 확인해 주세요."}`;

  return `${locationText} ${row.CODENAME || "문화"} 행사입니다. ${feeText}`.trim();
}

function detectIsFree(row) {
  const flagIsFree = row.IS_FREE === "무료";
  const feeText = String(row.USE_FEE || "");
  const feeMentionsPrice = /\d/.test(feeText);
  const feeMentionsFree = feeText.includes("무료");

  if (feeMentionsPrice) {
    return false;
  }

  return flagIsFree || feeMentionsFree;
}

function normalizeEvent(row, collectedAt) {
  const { id, sourceId } = buildEventId(row);
  const isFree = detectIsFree(row);

  return {
    id,
    sourceId,
    title: row.TITLE || "",
    category: row.CODENAME || "행사",
    district: row.GUNAME || "서울특별시",
    venue: row.PLACE || "장소 정보 없음",
    startDate: toDateOnly(row.STRTDATE),
    endDate: toDateOnly(row.END_DATE),
    dateText: row.DATE || "",
    timeText: row.PRO_TIME || "",
    target: row.USE_TRGT || "이용 대상 정보 없음",
    fee: row.USE_FEE || (isFree ? "무료" : "요금 정보 없음"),
    isFree,
    organizer: row.ORG_NAME || "주최 정보 없음",
    inquiry: row.INQUIRY || "문의처 정보 없음",
    imageUrl: row.MAIN_IMG || "",
    detailUrl: row.HMPG_ADDR || "",
    summary: buildSummary(row),
    organizerUrl: row.ORG_LINK || "",
    ticketType: row.TICKET || "",
    description: row.ETC_DESC || "",
    performer: row.PLAYER || "",
    program: row.PROGRAM || "",
    latitude: toNumber(row.LAT),
    longitude: toNumber(row.LOT),
    registeredAt: toDateOnly(row.RGSTDATE),
    collectedAt,
  };
}

function sortEvents(a, b) {
  const byStartDate = (a.startDate || a.endDate || "9999-12-31").localeCompare(
    b.startDate || b.endDate || "9999-12-31"
  );

  if (byStartDate !== 0) {
    return byStartDate;
  }

  const byEndDate = (a.endDate || a.startDate || "9999-12-31").localeCompare(
    b.endDate || b.startDate || "9999-12-31"
  );

  if (byEndDate !== 0) {
    return byEndDate;
  }

  const byRegisteredAt = (b.registeredAt || "").localeCompare(a.registeredAt || "");

  if (byRegisteredAt !== 0) {
    return byRegisteredAt;
  }

  const byDistrict = a.district.localeCompare(b.district, "ko");

  if (byDistrict !== 0) {
    return byDistrict;
  }

  return a.title.localeCompare(b.title, "ko");
}

function isAfterStartDateFilter(event) {
  if (!event.startDate) {
    return false;
  }

  return event.startDate >= START_DATE_FILTER;
}

async function fetchEvents(startIndex, endIndex) {
  const endpoint = `${API_BASE}/${encodeURIComponent(API_KEY)}/json/${SERVICE_NAME}/${startIndex}/${endIndex}/`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`서울 Open API 오류: ${response.status} ${response.statusText}`);
  }

  const responseText = await response.text();

  if (responseText.trim().startsWith("<")) {
    const compactXml = responseText.replace(/\s+/g, " ").trim();
    throw new Error(`서울 Open API가 JSON 대신 XML 응답을 반환했습니다: ${compactXml.slice(0, 200)}`);
  }

  const json = JSON.parse(responseText);
  const payload = json[SERVICE_NAME];

  if (!payload) {
    throw new Error("서울 Open API 응답 형식이 예상과 다릅니다.");
  }

  if (payload.RESULT?.CODE && payload.RESULT.CODE !== "INFO-000") {
    throw new Error(`서울 Open API 응답 오류: ${payload.RESULT.CODE} ${payload.RESULT.MESSAGE}`);
  }

  return payload;
}

async function main() {
  try {
    const usesPublicDataFallback = !process.env.SEOUL_OPEN_DATA_API_KEY && Boolean(process.env.PUBLIC_DATA_API_KEY);
    const sampleMode = API_KEY === "sample";
    const pageSize = sampleMode ? 5 : 1000;
    const collectedAt = new Date().toISOString();

    console.log("📡 서울시 문화행사 Open API 호출 중...");

    if (usesPublicDataFallback) {
      console.log("ℹ️ SEOUL_OPEN_DATA_API_KEY가 없어 PUBLIC_DATA_API_KEY 값을 사용합니다.");
    }

    const firstPayload = await fetchEvents(1, pageSize);
    const availableCount = Number(firstPayload.list_total_count || 0);
    const rows = [...(firstPayload.row || [])];

    if (!sampleMode) {
      for (let startIndex = pageSize + 1; startIndex <= availableCount; startIndex += pageSize) {
        const endIndex = Math.min(startIndex + pageSize - 1, availableCount);
        const payload = await fetchEvents(startIndex, endIndex);
        rows.push(...(payload.row || []));
      }
    }

    const normalizedEvents = rows
      .map((row) => normalizeEvent(row, collectedAt))
      .filter(isAfterStartDateFilter)
      .sort(sortEvents);

    const existingIndex = loadExistingIndex();
    const summaries = normalizedEvents.map(buildSummaryRecord);
    const existingItems = Array.isArray(existingIndex?.items) ? existingIndex.items : [];
    const isSameDataset =
      existingItems.length === summaries.length &&
      JSON.stringify(existingItems) === JSON.stringify(summaries) &&
      existingIndex?.source?.startDateFilter === START_DATE_FILTER;

    if (isSameDataset) {
      console.log(`ℹ️ ${START_DATE_FILTER} 이후 기준으로 새 행사가 없어 기존 데이터를 유지합니다.`);
      console.log(`- 필터 통과 건수: ${normalizedEvents.length}`);
      console.log(`- 현재 저장 총건수: ${existingItems.length}`);
      return;
    }

    fs.mkdirSync(ITEMS_DIR, { recursive: true });
    const currentItemFiles = fs
      .readdirSync(ITEMS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name);
    const nextItemFiles = new Set(normalizedEvents.map((event) => `${event.id}.json`));

    for (const fileName of currentItemFiles) {
      if (!nextItemFiles.has(fileName)) {
        fs.unlinkSync(path.join(ITEMS_DIR, fileName));
      }
    }

    const indexPayload = {
      source: {
        provider: "서울 열린데이터광장",
        dataset: "서울시 문화행사 정보",
        service: SERVICE_NAME,
        region: "서울특별시",
        officialUrl: OFFICIAL_URL,
        apiBase: API_BASE,
        collectedAt,
        availableCount,
        fetchedCount: summaries.length,
        sampleMode,
        startDateFilter: START_DATE_FILTER,
      },
      items: summaries,
    };

    fs.writeFileSync(path.join(EVENTS_DIR, "index.json"), JSON.stringify(indexPayload, null, 2), "utf8");

    for (const event of normalizedEvents) {
      const filePath = path.join(ITEMS_DIR, `${event.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(event, null, 2), "utf8");
    }

    console.log(`✅ 서울시 행사 데이터 저장 완료`);
    console.log(`- 전체 제공 건수: ${availableCount}`);
    console.log(`- ${START_DATE_FILTER} 이후 필터 통과 건수: ${normalizedEvents.length}`);
    console.log(`- 현재 저장 총건수: ${summaries.length}`);
    console.log(`- 샘플 모드: ${sampleMode ? "예" : "아니오"}`);
  } catch (error) {
    console.error("❌ 서울시 행사 데이터 수집 실패:", error.message);
    process.exit(1);
  }
}

main();
