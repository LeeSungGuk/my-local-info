/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const API_BASE = "https://api.odcloud.kr/api/gov24/v3";
const BENEFITS_DIR = path.join(__dirname, "..", "public", "data", "benefits");
const ITEMS_DIR = path.join(BENEFITS_DIR, "items");
const OFFICIAL_URL = "https://www.data.go.kr/data/15113968/openapi.do";
const ENV_FILE_PATH = path.join(__dirname, "..", ".env.local");
const PAGE_SIZE = 1000;
const DISTRICT_NAMES = [
  "종로구",
  "중구",
  "용산구",
  "성동구",
  "광진구",
  "동대문구",
  "중랑구",
  "성북구",
  "강북구",
  "도봉구",
  "노원구",
  "은평구",
  "서대문구",
  "마포구",
  "양천구",
  "강서구",
  "구로구",
  "금천구",
  "영등포구",
  "동작구",
  "관악구",
  "서초구",
  "강남구",
  "송파구",
  "강동구",
];
const SEOUL_DISTRICT_ORG_PATTERN = new RegExp(
  `^(?:재단법인)?(?:${DISTRICT_NAMES.join("|")})(?:도시관리공단|시설관리공단|미래교육재단|장학재단|문화재단)$`
);

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

const API_KEY = process.env.PUBLIC_DATA_API_KEY || "";

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).replace(/\r\n/g, "\n").trim();
}

function getTodayInSeoul() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function toDateOnly(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return "";
  }

  if (/^\d{14}$/.test(normalized)) {
    return `${normalized.slice(0, 4)}-${normalized.slice(4, 6)}-${normalized.slice(6, 8)}`;
  }

  if (/^\d{8}$/.test(normalized)) {
    return `${normalized.slice(0, 4)}-${normalized.slice(4, 6)}-${normalized.slice(6, 8)}`;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(normalized)) {
    return normalized.slice(0, 10);
  }

  return normalized;
}

function splitMultiValue(value) {
  return normalizeText(value)
    .split("||")
    .map((part) => part.trim())
    .filter(Boolean);
}

function truncateText(value, maxLength = 160) {
  const normalized = normalizeText(value);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function extractDateList(value) {
  const normalized = normalizeText(value);
  const matches = normalized.match(/\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}/g) || [];

  return matches.map((match) => {
    const [year, month, day] = match.replace(/[./]/g, "-").split("-");
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  });
}

function isSeoulProvider(provider) {
  const normalized = normalizeText(provider);

  if (!normalized) {
    return false;
  }

  return normalized.includes("서울") || SEOUL_DISTRICT_ORG_PATTERN.test(normalized);
}

function extractDistrict(provider) {
  const normalized = normalizeText(provider);

  const explicitDistrictMatch = normalized.match(/^서울특별시\s+([가-힣]+구)$/);

  if (explicitDistrictMatch) {
    return explicitDistrictMatch[1];
  }

  const districtMatch = normalized.match(
    /(종로구|중구|용산구|성동구|광진구|동대문구|중랑구|성북구|강북구|도봉구|노원구|은평구|서대문구|마포구|양천구|강서구|구로구|금천구|영등포구|동작구|관악구|서초구|강남구|송파구|강동구)/
  );

  if (districtMatch) {
    return districtMatch[1];
  }

  return "서울특별시";
}

function deriveProviderType(provider) {
  const normalized = normalizeText(provider);

  if (/^서울특별시\s+[가-힣]+구$/.test(normalized) || SEOUL_DISTRICT_ORG_PATTERN.test(normalized)) {
    return "자치구";
  }

  if (normalized.includes("서울특별시") || normalized.includes("서울시")) {
    return "서울시";
  }

  return "서울 공공기관";
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function createBenefitId(serviceId) {
  return `gov-benefit-${serviceId}`;
}

function buildSummaryText(listRow, detailRow) {
  const provider = normalizeText(listRow["소관기관명"]) || "서울 공공기관";
  const field = normalizeText(listRow["서비스분야"]) || "지원 서비스";
  const purpose = normalizeText(detailRow["서비스목적"] || listRow["서비스목적요약"]);
  const summary = purpose || normalizeText(listRow["지원내용"]);

  return truncateText(`${provider}에서 제공하는 ${field} 혜택입니다. ${summary}`, 180);
}

function buildDeadlineSortKey(deadlineText, isAlwaysOpen) {
  if (isAlwaysOpen) {
    return "9999-12-31";
  }

  const dateList = extractDateList(deadlineText);

  if (dateList.length === 0) {
    return "9999-12-31";
  }

  return dateList[dateList.length - 1];
}

function normalizeBenefit(listRow, detailRow, conditionsRow, collectedAt) {
  const sourceId = normalizeText(listRow["서비스ID"]);
  const title = normalizeText(listRow["서비스명"]);
  const provider = normalizeText(listRow["소관기관명"]);
  const detailUrl = normalizeText(listRow["상세조회URL"]);
  const onlineUrl = normalizeText(detailRow["온라인신청사이트URL"]);
  const deadlineText = normalizeText(detailRow["신청기한"] || listRow["신청기한"]);
  const isAlwaysOpen = deadlineText.includes("상시");
  const inquiry = splitMultiValue(detailRow["문의처"] || listRow["전화문의"]);
  const applicationMethodTypes = splitMultiValue(listRow["신청방법"]);
  const ageMin = toNumber(conditionsRow?.JA0110);
  const ageMax = toNumber(conditionsRow?.JA0111);

  return {
    id: createBenefitId(sourceId),
    sourceId,
    title,
    field: normalizeText(listRow["서비스분야"]) || "지원 서비스",
    provider,
    providerType: deriveProviderType(provider),
    district: extractDistrict(provider),
    userType: normalizeText(listRow["사용자구분"]) || "정보 없음",
    deadlineText: deadlineText || "상세페이지 확인",
    deadlineSortKey: buildDeadlineSortKey(deadlineText, isAlwaysOpen),
    isAlwaysOpen,
    targetSummary: truncateText(detailRow["지원대상"] || listRow["지원대상"], 150),
    summary: buildSummaryText(listRow, detailRow),
    supportType: normalizeText(listRow["지원유형"]) || "지원유형 정보 없음",
    supportSummary: truncateText(detailRow["지원내용"] || listRow["지원내용"], 150),
    receptionAgency: normalizeText(detailRow["접수기관명"] || listRow["접수기관"]) || "접수기관 정보 없음",
    applicationMethodTypes,
    detailUrl,
    onlineUrl,
    inquiry,
    updatedAt: toDateOnly(detailRow["수정일시"] || listRow["수정일시"]),
    registeredAt: toDateOnly(listRow["등록일시"]),
    viewCount: toNumber(listRow["조회수"]) || 0,
    collectedAt,
    purpose: normalizeText(detailRow["서비스목적"] || listRow["서비스목적요약"]),
    target: normalizeText(detailRow["지원대상"] || listRow["지원대상"]),
    selectionCriteria: normalizeText(detailRow["선정기준"] || listRow["선정기준"]),
    supportContent: normalizeText(detailRow["지원내용"] || listRow["지원내용"]),
    applicationMethod: normalizeText(detailRow["신청방법"]),
    documents: normalizeText(detailRow["구비서류"]),
    officialDocuments: normalizeText(detailRow["공무원확인구비서류"]),
    identityDocuments: normalizeText(detailRow["본인확인필요구비서류"]),
    legalBasis: splitMultiValue(detailRow["법령"]),
    ordinance: normalizeText(detailRow["자치법규"]),
    inquiryText: normalizeText(detailRow["문의처"] || listRow["전화문의"]),
    ageMin,
    ageMax,
  };
}

function buildSummaryRecord(benefit) {
  return {
    id: benefit.id,
    sourceId: benefit.sourceId,
    title: benefit.title,
    field: benefit.field,
    provider: benefit.provider,
    providerType: benefit.providerType,
    district: benefit.district,
    userType: benefit.userType,
    deadlineText: benefit.deadlineText,
    deadlineSortKey: benefit.deadlineSortKey,
    isAlwaysOpen: benefit.isAlwaysOpen,
    targetSummary: benefit.targetSummary,
    summary: benefit.summary,
    supportType: benefit.supportType,
    supportSummary: benefit.supportSummary,
    receptionAgency: benefit.receptionAgency,
    applicationMethodTypes: benefit.applicationMethodTypes,
    detailUrl: benefit.detailUrl,
    onlineUrl: benefit.onlineUrl,
    inquiry: benefit.inquiry,
    updatedAt: benefit.updatedAt,
    registeredAt: benefit.registeredAt,
  };
}

function dedupeBenefits(benefits) {
  const benefitMap = new Map();

  for (const benefit of benefits) {
    const existing = benefitMap.get(benefit.sourceId);

    if (!existing) {
      benefitMap.set(benefit.sourceId, benefit);
      continue;
    }

    const existingFreshness = existing.updatedAt || existing.registeredAt || "";
    const nextFreshness = benefit.updatedAt || benefit.registeredAt || "";

    if (nextFreshness.localeCompare(existingFreshness) > 0) {
      benefitMap.set(benefit.sourceId, benefit);
    }
  }

  return Array.from(benefitMap.values());
}

function isExpiredBenefit(benefit, today) {
  if (benefit.isAlwaysOpen) {
    return false;
  }

  if (!benefit.deadlineSortKey || benefit.deadlineSortKey === "9999-12-31") {
    return false;
  }

  return benefit.deadlineSortKey < today;
}

function sortBenefits(a, b) {
  const byUpdatedAt = (b.updatedAt || "").localeCompare(a.updatedAt || "");

  if (byUpdatedAt !== 0) {
    return byUpdatedAt;
  }

  const byDistrict = (a.district || "").localeCompare(b.district || "", "ko");

  if (byDistrict !== 0) {
    return byDistrict;
  }

  const byField = (a.field || "").localeCompare(b.field || "", "ko");

  if (byField !== 0) {
    return byField;
  }

  return (a.title || "").localeCompare(b.title || "", "ko");
}

function loadExistingIndex() {
  try {
    const filePath = path.join(BENEFITS_DIR, "index.json");
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function fetchPagedDataset(endpoint) {
  let page = 1;
  let totalCount = 0;
  const rows = [];

  while (true) {
    const url = new URL(`${API_BASE}/${endpoint}`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("perPage", String(PAGE_SIZE));
    url.searchParams.set("returnType", "JSON");
    url.searchParams.set("serviceKey", API_KEY);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`공공데이터포털 ${endpoint} 오류: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    if (page === 1) {
      totalCount = Number(json.totalCount || 0);
    }

    const items = Array.isArray(json.data) ? json.data : [];
    rows.push(...items);

    if (items.length < PAGE_SIZE || rows.length >= totalCount) {
      break;
    }

    page += 1;
  }

  return {
    totalCount,
    rows,
  };
}

async function main() {
  try {
    if (!API_KEY) {
      throw new Error("환경변수 PUBLIC_DATA_API_KEY가 설정되지 않았습니다.");
    }

    const collectedAt = new Date().toISOString();
    const todayInSeoul = getTodayInSeoul();

    console.log("📡 공공데이터포털 대한민국 공공서비스(혜택) 정보 수집 중...");

    const [listPayload, detailPayload, conditionsPayload] = await Promise.all([
      fetchPagedDataset("serviceList"),
      fetchPagedDataset("serviceDetail"),
      fetchPagedDataset("supportConditions"),
    ]);

    const detailMap = new Map(
      detailPayload.rows.map((row) => [normalizeText(row["서비스ID"]), row])
    );
    const conditionsMap = new Map(
      conditionsPayload.rows.map((row) => [normalizeText(row["서비스ID"]), row])
    );

    const normalizedBenefits = listPayload.rows
      .filter((row) => isSeoulProvider(row["소관기관명"]))
      .map((row) =>
        normalizeBenefit(
          row,
          detailMap.get(normalizeText(row["서비스ID"])) || {},
          conditionsMap.get(normalizeText(row["서비스ID"])) || {},
          collectedAt
        )
      );

    const deduplicatedBenefits = dedupeBenefits(normalizedBenefits);
    const activeBenefits = deduplicatedBenefits
      .filter((benefit) => !isExpiredBenefit(benefit, todayInSeoul))
      .sort(sortBenefits);
    const expiredCount = deduplicatedBenefits.length - activeBenefits.length;
    const deduplicatedCount = normalizedBenefits.length - deduplicatedBenefits.length;

    const summaries = activeBenefits.map(buildSummaryRecord);
    const existingIndex = loadExistingIndex();
    const existingItems = Array.isArray(existingIndex?.items) ? existingIndex.items : [];
    const isSameDataset =
      existingItems.length === summaries.length &&
      JSON.stringify(existingItems) === JSON.stringify(summaries);

    if (isSameDataset) {
      console.log("ℹ️ 새 혜택 변경 사항이 없어 기존 데이터를 유지합니다.");
      console.log(`- 전체 공공서비스 건수: ${listPayload.totalCount}`);
      console.log(`- 서울 소관기관 필터 통과 건수: ${normalizedBenefits.length}`);
      console.log(`- 중복 제거 건수: ${deduplicatedCount}`);
      console.log(`- 만료 제거 건수: ${expiredCount}`);
      console.log(`- 현재 노출 대상 건수: ${summaries.length}`);
      return;
    }

    fs.mkdirSync(ITEMS_DIR, { recursive: true });
    const currentItemFiles = fs
      .readdirSync(ITEMS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name);
    const nextItemFiles = new Set(activeBenefits.map((benefit) => `${benefit.id}.json`));

    for (const fileName of currentItemFiles) {
      if (!nextItemFiles.has(fileName)) {
        fs.unlinkSync(path.join(ITEMS_DIR, fileName));
      }
    }

    const indexPayload = {
      source: {
        provider: "공공데이터포털",
        dataset: "대한민국 공공서비스(혜택) 정보",
        services: ["serviceList", "serviceDetail", "supportConditions"],
        region: "서울특별시",
        officialUrl: OFFICIAL_URL,
        apiBase: API_BASE,
        collectedAt,
        syncSchedule: "매일 오전 7시 30분",
        availableCount: listPayload.totalCount,
        fetchedCount: normalizedBenefits.length,
        activeCount: summaries.length,
        expiredCount,
        deduplicatedCount,
        filterMode: "서울 소관기관",
        pageSize: PAGE_SIZE,
      },
      items: summaries,
    };

    fs.writeFileSync(path.join(BENEFITS_DIR, "index.json"), JSON.stringify(indexPayload, null, 2), "utf8");

    for (const benefit of activeBenefits) {
      fs.writeFileSync(
        path.join(ITEMS_DIR, `${benefit.id}.json`),
        JSON.stringify(benefit, null, 2),
        "utf8"
      );
    }

    console.log("✅ 공공 혜택 데이터 저장 완료");
    console.log(`- 전체 공공서비스 건수: ${listPayload.totalCount}`);
    console.log(`- serviceDetail 건수: ${detailPayload.totalCount}`);
    console.log(`- supportConditions 건수: ${conditionsPayload.totalCount}`);
    console.log(`- 서울 소관기관 필터 통과 건수: ${normalizedBenefits.length}`);
    console.log(`- 중복 제거 건수: ${deduplicatedCount}`);
    console.log(`- 만료 제거 건수: ${expiredCount}`);
    console.log(`- 현재 노출 대상 건수: ${summaries.length}`);
  } catch (error) {
    console.error("❌ 공공 혜택 데이터 수집 실패:", error.message);
    process.exit(1);
  }
}

main();
