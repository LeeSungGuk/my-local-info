/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const API_BASE = "http://openapi.seoul.go.kr:8088";
const SERVICE_NAME = "LOCALDATA_072404";
const FOOD_DIR = path.join(__dirname, "..", "public", "data", "food");
const ITEMS_DIR = path.join(FOOD_DIR, "items");
const REPORT_PATH = path.join(FOOD_DIR, "report.json");
const OFFICIAL_URL = "https://data.seoul.go.kr/dataList/OA-16094/S/1/datasetView.do";
const ENV_FILE_PATH = path.join(__dirname, "..", ".env.local");
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
const MEAL_CATEGORY_KEYWORDS = ["한식", "중국식", "일식", "경양식", "분식", "냉면", "식육", "회집"];
const LOWER_PRIORITY_CATEGORY_KEYWORDS = [
  "기타",
  "감성주점",
  "호프/통닭",
  "정종/대포집/소주방",
  "라이브카페",
  "출장조리",
];
const TEMPORARY_PLACE_PATTERN = /(한시|한시적|임시|팝업|행사|일일|시식)/;
const LOW_CONFIDENCE_LOCATION_PATTERN = /(백화점|식품관|푸드코트|행사장|팝업|컨벤션|전시장)/;
const CORPORATE_NAME_PATTERN = /(\(주\)|주식회사|유한회사|재단|위원회|협회|조합|센터|사업단)/;

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

function normalizeFoodDataMode(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function resolveFoodApiConfig(env = process.env) {
  const mode = normalizeFoodDataMode(env.FOOD_DATA_MODE);
  const seoulOpenDataApiKey = String(env.SEOUL_OPEN_DATA_API_KEY || "").trim();
  const sampleMode = mode === "sample" || seoulOpenDataApiKey === "sample";
  const skipMode = mode === "skip" && !seoulOpenDataApiKey;

  return {
    apiKey: sampleMode ? "sample" : seoulOpenDataApiKey,
    mode,
    sampleMode,
    skipMode,
    hasSeoulOpenDataApiKey: Boolean(seoulOpenDataApiKey && seoulOpenDataApiKey !== "sample"),
  };
}

const API_CONFIG = resolveFoodApiConfig(process.env);
const API_KEY = API_CONFIG.apiKey;
const SAMPLE_MODE = API_CONFIG.sampleMode;
const SKIP_MODE = API_CONFIG.skipMode;
const PAGE_SIZE = Number(process.env.FOOD_PAGE_SIZE || (SAMPLE_MODE ? 5 : 1000));
const MAX_PAGES = Number(process.env.FOOD_MAX_PAGES || 0);
const MAX_PLACES_PER_DISTRICT = Number(process.env.FOOD_MAX_PLACES_PER_DISTRICT || 12);
const MAX_PLACES_PER_AREA = Number(process.env.FOOD_MAX_PLACES_PER_AREA || 3);
const MAX_PLACES_PER_CATEGORY = Number(process.env.FOOD_MAX_PLACES_PER_CATEGORY || 4);
const REQUEST_TIMEOUT_MS = Number(process.env.FOOD_REQUEST_TIMEOUT_MS || 30000);
const REQUEST_RETRY_COUNT = Number(process.env.FOOD_REQUEST_RETRY_COUNT || 2);

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).replace(/\s+/g, " ").trim();
}

function toDateOnly(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return "";
  }

  if (/^\d{8}$/.test(normalized)) {
    return `${normalized.slice(0, 4)}-${normalized.slice(4, 6)}-${normalized.slice(6, 8)}`;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(normalized)) {
    return normalized.slice(0, 10);
  }

  return normalized.slice(0, 10);
}

function toNumber(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function createFoodId(sourceId) {
  return `seoul-food-${normalizeText(sourceId).replace(/[^0-9A-Za-z-]/g, "-")}`;
}

function extractDistrict(address) {
  const normalized = normalizeText(address);
  const districtMatch = normalized.match(
    /(종로구|중구|용산구|성동구|광진구|동대문구|중랑구|성북구|강북구|도봉구|노원구|은평구|서대문구|마포구|양천구|강서구|구로구|금천구|영등포구|동작구|관악구|서초구|강남구|송파구|강동구)/
  );

  return districtMatch?.[1] || "서울특별시";
}

function extractArea(roadAddress, lotAddress) {
  const addresses = [roadAddress, lotAddress].map(normalizeText).filter(Boolean);

  for (const address of addresses) {
    const parentheticalMatch = address.match(/\(([가-힣0-9]+(?:동|가|읍|면))/);

    if (parentheticalMatch) {
      return parentheticalMatch[1];
    }
  }

  for (const address of addresses) {
    const district = extractDistrict(address);
    const afterDistrict = address.split(district)[1] || address;
    const areaMatch = afterDistrict.match(/([가-힣0-9]+(?:동|가|읍|면))/);

    if (areaMatch) {
      return areaMatch[1];
    }
  }

  return "";
}

function normalizeStatus(row) {
  const tradeStatus = normalizeText(row.TRDSTATENM);
  const detailStatus = normalizeText(row.DTLSTATENM);
  const statusText = `${tradeStatus} ${detailStatus}`;

  if (statusText.includes("폐업")) {
    return "폐업";
  }

  if (row.TRDSTATEGBN === "01" || statusText.includes("영업")) {
    return "영업";
  }

  return "정보 없음";
}

function buildMapSearchQuery(roadAddress, lotAddress, district) {
  const primaryAddress = normalizeText(roadAddress || lotAddress)
    .replace(/\s*\(.+$/, "")
    .split(",")[0]
    .trim();

  return primaryAddress || district;
}

function buildSummary(place) {
  const areaText = place.area ? `${place.district} ${place.area}` : place.district;
  return `${areaText}에 등록된 ${place.category} 일반음식점입니다. 영업시간, 휴무, 메뉴는 방문 전 지도 또는 공식 채널에서 다시 확인해 주세요.`;
}

function normalizeFoodPlace(row, collectedAt) {
  const roadAddress = normalizeText(row.RDNWHLADDR);
  const address = normalizeText(row.SITEWHLADDR);
  const district = extractDistrict(roadAddress || address);
  const name = normalizeText(row.BPLCNM);
  const category = normalizeText(row.SNTUPTAENM || row.UPTAENM) || "음식점";
  const status = normalizeStatus(row);
  const place = {
    id: createFoodId(row.MGTNO),
    sourceId: normalizeText(row.MGTNO),
    name,
    district,
    area: extractArea(roadAddress, address),
    category,
    mainMenu: category,
    address,
    roadAddress,
    phone: normalizeText(row.SITETEL),
    status,
    detailStatus: normalizeText(row.DTLSTATENM) || status,
    licenseDate: toDateOnly(row.APVPERMYMD),
    closedDate: toDateOnly(row.DCBYMD),
    updatedAt: toDateOnly(row.UPDATEDT || row.LASTMODTS),
    sourceLabel: "서울 열린데이터광장 일반음식점 인허가 정보",
    sourceUrl: OFFICIAL_URL,
    collectedAt,
    mapSearchQuery: buildMapSearchQuery(roadAddress, address, district),
    latitude: null,
    longitude: null,
    x: toNumber(row.X),
    y: toNumber(row.Y),
  };

  return {
    ...place,
    summary: buildSummary(place),
  };
}

function isActiveFoodPlace(place) {
  return (
    place.status === "영업" &&
    !place.closedDate &&
    Boolean(normalizeText(place.name)) &&
    DISTRICT_NAMES.includes(place.district)
  );
}

function includesAnyKeyword(value, keywords) {
  const normalized = normalizeText(value);
  return keywords.some((keyword) => normalized.includes(keyword));
}

function getFoodPlaceQualityScore(place) {
  const name = normalizeText(place.name);
  const category = normalizeText(place.category || place.mainMenu);
  const roadAddress = normalizeText(place.roadAddress);
  const address = normalizeText(place.address);
  const area = normalizeText(place.area);
  const combinedText = [name, category, roadAddress, address, area].join(" ");
  let score = 0;

  if (name) {
    score += 5;
  }

  if (DISTRICT_NAMES.includes(place.district)) {
    score += 8;
  }

  if (area) {
    score += 8;
  }

  if (roadAddress) {
    score += 18;
  } else if (address) {
    score += 8;
  } else {
    score -= 20;
  }

  if (includesAnyKeyword(category, MEAL_CATEGORY_KEYWORDS)) {
    score += 30;
  }

  if (includesAnyKeyword(category, LOWER_PRIORITY_CATEGORY_KEYWORDS)) {
    score -= category === "기타" ? 22 : 15;
  }

  if (TEMPORARY_PLACE_PATTERN.test(combinedText)) {
    score -= 50;
  }

  if (LOW_CONFIDENCE_LOCATION_PATTERN.test(`${roadAddress} ${address}`)) {
    score -= 22;
  }

  if (CORPORATE_NAME_PATTERN.test(name)) {
    score -= 12;
  }

  if (name.length > 30) {
    score -= 6;
  }

  return score;
}

function hasTemporarySignal(place) {
  const combinedText = [
    normalizeText(place.name),
    normalizeText(place.category || place.mainMenu),
    normalizeText(place.roadAddress),
    normalizeText(place.address),
    normalizeText(place.area),
  ].join(" ");

  return TEMPORARY_PLACE_PATTERN.test(combinedText);
}

function hasLowerPriorityCategory(place) {
  return includesAnyKeyword(place.category || place.mainMenu, LOWER_PRIORITY_CATEGORY_KEYWORDS);
}

function hasLowConfidenceLocation(place) {
  return LOW_CONFIDENCE_LOCATION_PATTERN.test(
    `${normalizeText(place.roadAddress)} ${normalizeText(place.address)}`
  );
}

function hasCorporateName(place) {
  return CORPORATE_NAME_PATTERN.test(normalizeText(place.name));
}

function sortFoodPlaces(a, b) {
  const byQuality = getFoodPlaceQualityScore(b) - getFoodPlaceQualityScore(a);

  if (byQuality !== 0) {
    return byQuality;
  }

  const byUpdatedAt = (b.updatedAt || "").localeCompare(a.updatedAt || "");

  if (byUpdatedAt !== 0) {
    return byUpdatedAt;
  }

  const byLicenseDate = (b.licenseDate || "").localeCompare(a.licenseDate || "");

  if (byLicenseDate !== 0) {
    return byLicenseDate;
  }

  const byDistrict = (a.district || "").localeCompare(b.district || "", "ko");

  if (byDistrict !== 0) {
    return byDistrict;
  }

  return (a.name || "").localeCompare(b.name || "", "ko");
}

function roundMetric(value) {
  return Math.round(value * 100) / 100;
}

function getQualityStats(places) {
  const scores = places.map(getFoodPlaceQualityScore);

  if (scores.length === 0) {
    return {
      averageScore: 0,
      minScore: 0,
      maxScore: 0,
      temporarySignalCount: 0,
      lowerPriorityCategoryCount: 0,
      lowConfidenceLocationCount: 0,
      corporateNameCount: 0,
    };
  }

  return {
    averageScore: roundMetric(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    minScore: Math.min(...scores),
    maxScore: Math.max(...scores),
    temporarySignalCount: places.filter(hasTemporarySignal).length,
    lowerPriorityCategoryCount: places.filter(hasLowerPriorityCategory).length,
    lowConfidenceLocationCount: places.filter(hasLowConfidenceLocation).length,
    corporateNameCount: places.filter(hasCorporateName).length,
  };
}

function buildCountEntries(places, keyGetter) {
  const counts = new Map();

  for (const place of places) {
    const key = getDiversityValue(keyGetter(place));
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ko"));
}

function buildDistrictReports(selectedPlaces) {
  return DISTRICT_NAMES.map((districtName) => {
    const districtPlaces = selectedPlaces.filter((place) => place.district === districtName);
    const areaEntries = buildCountEntries(districtPlaces, (place) => place.area);
    const categoryEntries = buildCountEntries(districtPlaces, (place) => place.category || place.mainMenu);
    const quality = getQualityStats(districtPlaces);

    return {
      name: districtName,
      selectedCount: districtPlaces.length,
      areaCount: areaEntries.length,
      categoryCount: categoryEntries.length,
      topAreas: areaEntries.slice(0, 5),
      topCategories: categoryEntries.slice(0, 5),
      quality: {
        averageScore: quality.averageScore,
        minScore: quality.minScore,
        maxScore: quality.maxScore,
      },
    };
  });
}

function buildChangeMetrics(selectedPlaces, existingItems) {
  const previousIds = new Set(existingItems.map((item) => item.id).filter(Boolean));
  const nextIds = new Set(selectedPlaces.map((place) => place.id).filter(Boolean));
  let unchangedCount = 0;

  for (const id of nextIds) {
    if (previousIds.has(id)) {
      unchangedCount += 1;
    }
  }

  return {
    previousSelectedCount: previousIds.size,
    addedCount: [...nextIds].filter((id) => !previousIds.has(id)).length,
    removedCount: [...previousIds].filter((id) => !nextIds.has(id)).length,
    unchangedCount,
  };
}

function buildFoodCollectionReport({
  collectedAt,
  availableCount,
  fetchedCount,
  activeCount,
  selectedPlaces,
  existingItems,
  sampleMode,
  pageSize,
  maxPages,
  maxPlacesPerDistrict,
  maxPlacesPerArea,
  maxPlacesPerCategory,
}) {
  return {
    generatedAt: collectedAt,
    source: {
      provider: "서울 열린데이터광장",
      dataset: "서울시 일반음식점 인허가 정보",
      service: SERVICE_NAME,
      officialUrl: OFFICIAL_URL,
      availableCount,
      fetchedCount,
      activeCount,
      selectedCount: selectedPlaces.length,
      sampleMode,
      pageSize,
      maxPages,
      maxPlacesPerDistrict,
      maxPlacesPerArea,
      maxPlacesPerCategory,
    },
    changes: buildChangeMetrics(selectedPlaces, existingItems),
    quality: getQualityStats(selectedPlaces),
    districts: buildDistrictReports(selectedPlaces),
  };
}

function getDiversityValue(value) {
  return normalizeText(value) || "정보 없음";
}

function createDistrictSelectionState() {
  return {
    total: 0,
    areaCounts: new Map(),
    categoryCounts: new Map(),
  };
}

function getDistrictSelectionState(states, district) {
  if (!states.has(district)) {
    states.set(district, createDistrictSelectionState());
  }

  return states.get(district);
}

function canSelectWithDiversity(place, state, limitPerDistrict) {
  if (state.total >= limitPerDistrict) {
    return false;
  }

  const area = getDiversityValue(place.area);
  const category = getDiversityValue(place.category || place.mainMenu);
  const areaCount = state.areaCounts.get(area) || 0;
  const categoryCount = state.categoryCounts.get(category) || 0;

  return areaCount < MAX_PLACES_PER_AREA && categoryCount < MAX_PLACES_PER_CATEGORY;
}

function selectFoodPlace(place, state, selected) {
  const area = getDiversityValue(place.area);
  const category = getDiversityValue(place.category || place.mainMenu);

  state.total += 1;
  state.areaCounts.set(area, (state.areaCounts.get(area) || 0) + 1);
  state.categoryCounts.set(category, (state.categoryCounts.get(category) || 0) + 1);
  selected.push(place);
}

function limitFoodPlacesByDistrict(places, limitPerDistrict) {
  const states = new Map();
  const limited = [];
  const deferred = [];

  for (const place of [...places].sort(sortFoodPlaces)) {
    const state = getDistrictSelectionState(states, place.district);

    if (state.total >= limitPerDistrict) {
      continue;
    }

    if (canSelectWithDiversity(place, state, limitPerDistrict)) {
      selectFoodPlace(place, state, limited);
    } else {
      deferred.push(place);
    }
  }

  for (const place of deferred) {
    const state = getDistrictSelectionState(states, place.district);

    if (state.total >= limitPerDistrict) {
      continue;
    }

    selectFoodPlace(place, state, limited);
  }

  return limited;
}

function buildSummaryRecord(place) {
  return {
    id: place.id,
    sourceId: place.sourceId,
    name: place.name,
    district: place.district,
    area: place.area,
    category: place.category,
    mainMenu: place.mainMenu,
    roadAddress: place.roadAddress,
    address: place.address,
    phone: place.phone,
    status: place.status,
    detailStatus: place.detailStatus,
    licenseDate: place.licenseDate,
    updatedAt: place.updatedAt,
    summary: place.summary,
    mapSearchQuery: place.mapSearchQuery,
    sourceLabel: place.sourceLabel,
    sourceUrl: place.sourceUrl,
    collectedAt: place.collectedAt,
  };
}

function loadExistingIndex() {
  try {
    const raw = fs.readFileSync(path.join(FOOD_DIR, "index.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function fetchFoodRowsOnce(startIndex, endIndex) {
  const endpoint = `${API_BASE}/${encodeURIComponent(API_KEY)}/json/${SERVICE_NAME}/${startIndex}/${endIndex}/`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;

  try {
    response = await fetch(endpoint, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }

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
    if (json.RESULT?.CODE) {
      throw new Error(`서울 Open API 응답 오류: ${json.RESULT.CODE} ${json.RESULT.MESSAGE}`);
    }

    throw new Error("서울 Open API 응답 형식이 예상과 다릅니다.");
  }

  if (payload.RESULT?.CODE && payload.RESULT.CODE !== "INFO-000") {
    throw new Error(`서울 Open API 응답 오류: ${payload.RESULT.CODE} ${payload.RESULT.MESSAGE}`);
  }

  return payload;
}

async function fetchFoodRows(startIndex, endIndex) {
  let lastError;

  for (let attempt = 1; attempt <= REQUEST_RETRY_COUNT + 1; attempt += 1) {
    try {
      return await fetchFoodRowsOnce(startIndex, endIndex);
    } catch (error) {
      lastError = error;

      if (attempt > REQUEST_RETRY_COUNT) {
        break;
      }

      console.warn(
        `⚠️ 서울 Open API 재시도 ${attempt}/${REQUEST_RETRY_COUNT}: ${startIndex}-${endIndex} (${error.message})`
      );
    }
  }

  throw lastError;
}

async function main() {
  try {
    if (SKIP_MODE) {
      console.log("ℹ️ 서울 먹거리 데이터 수집을 건너뜁니다. FOOD_DATA_MODE=skip");
      return;
    }

    if (!API_KEY) {
      console.error("❌ 서울시 먹거리 데이터 수집 실패: SEOUL_OPEN_DATA_API_KEY가 필요합니다.");
      console.error("   로컬 샘플 실행은 FOOD_DATA_MODE=sample npm run fetch:seoul-food 로 실행하세요.");
      process.exit(1);
    }

    const collectedAt = new Date().toISOString();
    const activePlaces = [];
    let availableCount = 0;
    let fetchedCount = 0;
    let pageCount = 0;

    console.log("📡 서울 열린데이터광장 일반음식점 인허가 정보 수집 중...");

    const firstPayload = await fetchFoodRows(1, PAGE_SIZE);
    availableCount = Number(firstPayload.list_total_count || 0);
    const firstRows = Array.isArray(firstPayload.row) ? firstPayload.row : [];

    for (const row of firstRows) {
      const place = normalizeFoodPlace(row, collectedAt);
      fetchedCount += 1;

      if (isActiveFoodPlace(place)) {
        activePlaces.push(place);
      }
    }

    pageCount += 1;

    if (!SAMPLE_MODE) {
      for (let startIndex = PAGE_SIZE + 1; startIndex <= availableCount; startIndex += PAGE_SIZE) {
        if (MAX_PAGES > 0 && pageCount >= MAX_PAGES) {
          break;
        }

        const endIndex = Math.min(startIndex + PAGE_SIZE - 1, availableCount);
        const payload = await fetchFoodRows(startIndex, endIndex);
        const rows = Array.isArray(payload.row) ? payload.row : [];

        for (const row of rows) {
          const place = normalizeFoodPlace(row, collectedAt);
          fetchedCount += 1;

          if (isActiveFoodPlace(place)) {
            activePlaces.push(place);
          }
        }

        pageCount += 1;

        if (pageCount % 50 === 0) {
          console.log(
            `- 진행: ${Math.min(endIndex, availableCount).toLocaleString("ko-KR")}/${availableCount.toLocaleString("ko-KR")}건 조회, 영업 후보 ${activePlaces.length.toLocaleString("ko-KR")}건`
          );
        }
      }
    }

    const selectedPlaces = limitFoodPlacesByDistrict(activePlaces, MAX_PLACES_PER_DISTRICT);
    const summaries = selectedPlaces.map(buildSummaryRecord);
    const existingIndex = loadExistingIndex();
    const existingItems = Array.isArray(existingIndex?.items) ? existingIndex.items : [];
    const collectionReport = buildFoodCollectionReport({
      collectedAt,
      availableCount,
      fetchedCount,
      activeCount: activePlaces.length,
      selectedPlaces,
      existingItems,
      sampleMode: SAMPLE_MODE,
      pageSize: PAGE_SIZE,
      maxPages: MAX_PAGES,
      maxPlacesPerDistrict: MAX_PLACES_PER_DISTRICT,
      maxPlacesPerArea: MAX_PLACES_PER_AREA,
      maxPlacesPerCategory: MAX_PLACES_PER_CATEGORY,
    });
    const isSameDataset =
      existingItems.length === summaries.length &&
      JSON.stringify(existingItems) === JSON.stringify(summaries);

    fs.mkdirSync(FOOD_DIR, { recursive: true });
    fs.writeFileSync(REPORT_PATH, JSON.stringify(collectionReport, null, 2), "utf8");

    if (isSameDataset) {
      console.log("ℹ️ 새 먹거리 변경 사항이 없어 기존 데이터를 유지합니다.");
      console.log(`- 전체 제공 건수: ${availableCount}`);
      console.log(`- 조회 건수: ${fetchedCount}`);
      console.log(`- 영업 필터 통과 건수: ${activePlaces.length}`);
      console.log(`- 현재 노출 대상 건수: ${summaries.length}`);
      console.log("- 수집 리포트: public/data/food/report.json");
      return;
    }

    fs.mkdirSync(ITEMS_DIR, { recursive: true });
    const currentItemFiles = fs
      .readdirSync(ITEMS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name);
    const nextItemFiles = new Set(selectedPlaces.map((place) => `${place.id}.json`));

    for (const fileName of currentItemFiles) {
      if (!nextItemFiles.has(fileName)) {
        fs.unlinkSync(path.join(ITEMS_DIR, fileName));
      }
    }

    const indexPayload = {
      source: {
        provider: "서울 열린데이터광장",
        dataset: "서울시 일반음식점 인허가 정보",
        service: SERVICE_NAME,
        region: "서울특별시",
        officialUrl: OFFICIAL_URL,
        apiBase: API_BASE,
        collectedAt,
        syncSchedule: "매일 오전 7시 30분",
        availableCount,
        fetchedCount,
        activeCount: activePlaces.length,
        selectedCount: summaries.length,
        sampleMode: SAMPLE_MODE,
        maxPlacesPerDistrict: MAX_PLACES_PER_DISTRICT,
        maxPlacesPerArea: MAX_PLACES_PER_AREA,
        maxPlacesPerCategory: MAX_PLACES_PER_CATEGORY,
        pageSize: PAGE_SIZE,
        maxPages: MAX_PAGES,
        filterMode: "영업 상태 일반음식점",
        dataDelayNotice: "서울 열린데이터광장 안내 기준 3일 전 자료",
      },
      items: summaries,
    };

    fs.writeFileSync(path.join(FOOD_DIR, "index.json"), JSON.stringify(indexPayload, null, 2), "utf8");

    for (const place of selectedPlaces) {
      fs.writeFileSync(
        path.join(ITEMS_DIR, `${place.id}.json`),
        JSON.stringify(place, null, 2),
        "utf8"
      );
    }

    console.log("✅ 서울시 먹거리 데이터 저장 완료");
    console.log(`- 전체 제공 건수: ${availableCount}`);
    console.log(`- 조회 건수: ${fetchedCount}`);
    console.log(`- 영업 필터 통과 건수: ${activePlaces.length}`);
    console.log(`- 현재 노출 대상 건수: ${summaries.length}`);
    console.log(`- 샘플 모드: ${SAMPLE_MODE ? "예" : "아니오"}`);
    console.log("- 수집 리포트: public/data/food/report.json");
  } catch (error) {
    console.error("❌ 서울시 먹거리 데이터 수집 실패:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildFoodCollectionReport,
  buildSummaryRecord,
  createFoodId,
  extractDistrict,
  getFoodPlaceQualityScore,
  isActiveFoodPlace,
  limitFoodPlacesByDistrict,
  normalizeFoodPlace,
  resolveFoodApiConfig,
  sortFoodPlaces,
  toDateOnly,
};
