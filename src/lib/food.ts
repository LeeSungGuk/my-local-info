import { promises as fs } from "fs";
import path from "path";
import {
  getAllDistricts,
  type DistrictGuide,
  type DistrictSlug,
} from "@/lib/districts";

export interface FoodIntent {
  id: string;
  districtSlug: DistrictSlug;
  districtName: string;
  title: string;
  area: string;
  category: string;
  searchQuery: string;
  description: string;
  bestFor: string[];
}

export interface FoodPlace {
  id: string;
  sourceId?: string;
  name: string;
  district: string;
  area: string;
  category: string;
  mainMenu: string;
  address: string;
  roadAddress: string;
  phone: string;
  status: "영업" | "폐업" | "정보 없음";
  detailStatus?: string;
  licenseDate: string;
  closedDate?: string;
  updatedAt?: string;
  summary?: string;
  mapSearchQuery?: string;
  sourceLabel: string;
  sourceUrl: string;
  collectedAt: string;
}

export interface FoodSource {
  provider: string;
  dataset: string;
  service: string;
  region: string;
  officialUrl: string;
  apiBase: string;
  collectedAt: string;
  syncSchedule: string;
  availableCount: number;
  fetchedCount: number;
  activeCount: number;
  selectedCount: number;
  sampleMode: boolean;
  maxPlacesPerDistrict: number;
  maxPlacesPerArea?: number;
  maxPlacesPerCategory?: number;
  pageSize: number;
  maxPages: number;
  filterMode: string;
  dataDelayNotice: string;
}

export interface FoodIndex {
  source: FoodSource;
  items: FoodPlace[];
}

export interface FoodDistrictOverview {
  name: string;
  slug?: DistrictSlug;
  href: string;
  linkType: "guide" | "map";
  hasGuide: boolean;
  placeCount: number;
  editorialSummary?: string;
}

export interface FoodDistrictEditorial {
  districtSlug: DistrictSlug;
  districtName: string;
  title: string;
  description: string;
  routeHints: string[];
}

const foodDataDir = path.join(process.cwd(), "public", "data", "food");

const seoulFoodDistrictNames = [
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
const mealCategoryKeywords = ["한식", "중국식", "일식", "경양식", "분식", "냉면", "식육", "회집"];
const lowerPriorityCategoryKeywords = [
  "기타",
  "감성주점",
  "호프/통닭",
  "정종/대포집/소주방",
  "라이브카페",
  "출장조리",
];
const temporaryPlacePattern = /(한시|한시적|임시|팝업|행사|일일|시식)/;
const lowConfidenceLocationPattern = /(백화점|식품관|푸드코트|행사장|팝업|컨벤션|전시장)/;
const corporateNamePattern = /(\(주\)|주식회사|유한회사|재단|위원회|협회|조합|센터|사업단)/;

const emptyFoodIndex: FoodIndex = {
  source: {
    provider: "서울 열린데이터광장",
    dataset: "서울시 일반음식점 인허가 정보",
    service: "LOCALDATA_072404",
    region: "서울특별시",
    officialUrl: "https://data.seoul.go.kr/dataList/OA-16094/S/1/datasetView.do",
    apiBase: "http://openapi.seoul.go.kr:8088",
    collectedAt: "",
    syncSchedule: "매일 오전 7시 30분",
    availableCount: 0,
    fetchedCount: 0,
    activeCount: 0,
    selectedCount: 0,
    sampleMode: false,
    maxPlacesPerDistrict: 12,
    maxPlacesPerArea: 3,
    maxPlacesPerCategory: 4,
    pageSize: 1000,
    maxPages: 0,
    filterMode: "영업 상태 일반음식점",
    dataDelayNotice: "서울 열린데이터광장 안내 기준 3일 전 자료",
  },
  items: [],
};

const foodDistrictEditorials: FoodDistrictEditorial[] = [
  {
    districtSlug: "jongno",
    districtName: "종로구",
    title: "궁궐과 골목 산책 전후 식사를 나누어 고르기 좋은 구",
    description:
      "종로구는 경복궁, 서촌, 인사동, 대학로처럼 걷는 권역이 넓게 퍼져 있어 식사 위치를 먼저 정하면 동선이 흔들리기 쉽습니다. 궁궐 산책 전후라면 광화문·서촌권을, 전시나 골목 산책을 붙인다면 인사동·익선동권을 먼저 보는 편이 안정적입니다.",
    routeHints: ["광화문·서촌권", "인사동·익선동권", "대학로·낙산권"],
  },
  {
    districtSlug: "jung",
    districtName: "중구",
    title: "명동, 정동, 남산을 짧은 이동으로 묶는 도심 식사권",
    description:
      "중구는 업무지와 관광지가 겹쳐 점심, 퇴근 후, 공연 전후 식사 목적이 분명한 편입니다. 명동·을지로권은 선택지가 많고, 정동·시청권은 산책 전후 이동이 편하며, 남산권은 야경 일정과 함께 식사 시간을 조절하기 좋습니다.",
    routeHints: ["명동·을지로권", "정동·시청권", "남산·서울역권"],
  },
  {
    districtSlug: "mapo",
    districtName: "마포구",
    title: "한강, 시장, 골목 상권을 목적별로 나누어 보기 좋은 구",
    description:
      "마포구는 망원, 합정, 연남, 상암처럼 분위기가 다른 권역이 많아 식사 기준이 동선에 따라 달라집니다. 한강 산책을 함께 넣는다면 망원·합정권이 편하고, 카페와 골목 상권을 함께 본다면 연남·홍대권을 먼저 보는 편이 좋습니다.",
    routeHints: ["망원·합정권", "연남·홍대권", "상암·월드컵공원권"],
  },
  {
    districtSlug: "seongdong",
    districtName: "성동구",
    title: "서울숲 산책과 성수 실내 일정을 식사와 연결하기 좋은 구",
    description:
      "성동구는 서울숲과 성수동을 함께 쓰는 일정이 많아 식사 장소를 산책 전후 어디에 붙일지 정하는 것이 중요합니다. 야외 시간이 길면 서울숲·뚝섬권을, 전시나 카페 일정을 중심에 두면 성수동 골목권을 먼저 확인하는 편이 좋습니다.",
    routeHints: ["서울숲·뚝섬권", "성수동 골목권", "왕십리 환승권"],
  },
  {
    districtSlug: "yongsan",
    districtName: "용산구",
    title: "박물관, 공원, 한강 일정을 가족 식사와 붙이기 좋은 구",
    description:
      "용산구는 국립중앙박물관, 용산가족공원, 한강, 한남동이 서로 다른 체류 시간을 만듭니다. 아이나 부모님과 움직인다면 이촌·박물관권처럼 이동이 단순한 곳을 먼저 보고, 저녁 일정은 한남·이태원권으로 분리해 보는 편이 안정적입니다.",
    routeHints: ["이촌·박물관권", "한남·이태원권", "용산역·삼각지권"],
  },
  {
    districtSlug: "gangnam",
    districtName: "강남구",
    title: "실내 일정과 쇼핑 동선을 기준으로 식사권을 나누기 좋은 구",
    description:
      "강남구는 권역이 넓고 유동 인구가 많아 막연히 찾으면 이동 시간이 늘기 쉽습니다. 코엑스나 전시 일정은 삼성권으로, 쇼핑과 카페 일정은 신사·압구정권으로, 업무 전후 식사는 역삼·강남역권으로 나누어 보는 편이 효율적입니다.",
    routeHints: ["삼성·코엑스권", "신사·압구정권", "역삼·강남역권"],
  },
  {
    districtSlug: "songpa",
    districtName: "송파구",
    title: "잠실, 석촌호수, 방이동 일정을 식사와 연결하기 좋은 구",
    description:
      "송파구는 잠실역 주변 실내 일정과 석촌호수 산책, 방이동 식사권을 함께 고려하면 동선이 편해집니다. 아이와 움직이면 잠실·롯데월드권을, 산책을 길게 잡으면 석촌호수권을, 저녁 식사는 방이동권을 따로 보는 편이 좋습니다.",
    routeHints: ["잠실·롯데월드권", "석촌호수권", "방이동 먹거리권"],
  },
  {
    districtSlug: "yeongdeungpo",
    districtName: "영등포구",
    title: "여의도 업무지와 문래 골목권을 분리해서 보기 좋은 구",
    description:
      "영등포구는 여의도, 문래, 영등포역권의 분위기가 분명히 다릅니다. 퇴근 후 한강 산책을 붙이면 여의도권을, 골목 산책과 카페를 함께 보면 문래권을, 교통 편의가 중요하면 영등포역권을 먼저 확인하는 편이 좋습니다.",
    routeHints: ["여의도·한강권", "문래 골목권", "영등포역권"],
  },
  {
    districtSlug: "seodaemun",
    districtName: "서대문구",
    title: "대학가와 동네 산책을 가벼운 식사와 연결하기 좋은 구",
    description:
      "서대문구는 신촌·이대의 대학가 분위기와 연희동의 동네 산책감이 다르게 움직입니다. 혼자 가볍게 먹거나 카페를 붙일 때는 신촌·이대권을, 조용한 골목 산책과 식사를 함께 보고 싶다면 연희동권을 먼저 보는 편이 좋습니다.",
    routeHints: ["신촌·이대권", "연희동권", "서대문·독립문권"],
  },
  {
    districtSlug: "gwangjin",
    districtName: "광진구",
    title: "어린이대공원, 건대입구, 아차산 동선을 나누어 보기 좋은 구",
    description:
      "광진구는 가족 나들이, 대학가 식사, 산책 일정이 권역별로 나뉩니다. 아이와 움직이면 어린이대공원권이 편하고, 식사 선택지를 넓게 보려면 건대입구권을, 걷는 시간을 길게 잡는다면 아차산권을 따로 확인하는 편이 좋습니다.",
    routeHints: ["어린이대공원권", "건대입구권", "아차산권"],
  },
];

const foodIntents: FoodIntent[] = [
  {
    id: "jongno-palace-meal",
    districtSlug: "jongno",
    districtName: "종로구",
    title: "궁궐 산책 전후 식사",
    area: "광화문 · 서촌 · 인사동",
    category: "한식",
    searchQuery: "종로구 광화문 서촌 한식",
    description: "경복궁, 광화문, 서촌 산책 전후로 찾기 좋은 한식권 검색입니다.",
    bestFor: ["부모님과", "궁궐 산책", "점심"],
  },
  {
    id: "jung-myeongdong-dinner",
    districtSlug: "jung",
    districtName: "중구",
    title: "명동·정동 도심 식사",
    area: "명동 · 정동 · 시청",
    category: "도심 식사",
    searchQuery: "중구 명동 정동 식당",
    description: "도심 산책이나 공연 전후에 빠르게 찾기 좋은 식사권 검색입니다.",
    bestFor: ["퇴근 후", "도심 산책", "공연 전후"],
  },
  {
    id: "mapo-hangang-market",
    districtSlug: "mapo",
    districtName: "마포구",
    title: "시장과 한강을 묶는 먹거리",
    area: "망원 · 합정 · 연남",
    category: "시장·골목",
    searchQuery: "마포구 망원 합정 연남 맛집",
    description: "망원시장, 한강, 골목 상권을 함께 볼 때 쓰기 좋은 검색입니다.",
    bestFor: ["데이트", "시장", "한강"],
  },
  {
    id: "seongdong-seoulforest",
    districtSlug: "seongdong",
    districtName: "성동구",
    title: "서울숲·성수 식사 선택지",
    area: "서울숲 · 성수 · 뚝섬",
    category: "카페·식사",
    searchQuery: "성동구 서울숲 성수 식당",
    description: "서울숲 산책과 성수동 실내 일정을 함께 잡을 때 쓰기 좋습니다.",
    bestFor: ["데이트", "전시", "카페"],
  },
  {
    id: "yongsan-museum-family",
    districtSlug: "yongsan",
    districtName: "용산구",
    title: "박물관·공원 전후 가족 식사",
    area: "이촌 · 용산 · 한남",
    category: "가족 식사",
    searchQuery: "용산구 이촌 용산 가족 식당",
    description: "국립중앙박물관과 용산가족공원 전후로 식사 장소를 찾는 검색입니다.",
    bestFor: ["아이와", "부모님과", "박물관"],
  },
  {
    id: "gangnam-indoor-meal",
    districtSlug: "gangnam",
    districtName: "강남구",
    title: "강남 실내 일정 전후 식사",
    area: "삼성 · 신사 · 역삼",
    category: "실내·쇼핑",
    searchQuery: "강남구 삼성 신사 역삼 식당",
    description: "비 오는 날이나 실내 일정을 중심으로 식사 선택지를 찾는 검색입니다.",
    bestFor: ["비 오는 날", "쇼핑", "전시"],
  },
  {
    id: "songpa-family-lake",
    districtSlug: "songpa",
    districtName: "송파구",
    title: "잠실·석촌호수 가족 식사",
    area: "잠실 · 석촌 · 방이",
    category: "가족 식사",
    searchQuery: "송파구 잠실 석촌 방이 식당",
    description: "석촌호수와 잠실권 나들이 전후로 식사 장소를 찾는 검색입니다.",
    bestFor: ["아이와", "주말", "호수 산책"],
  },
  {
    id: "yeongdeungpo-yeouido",
    districtSlug: "yeongdeungpo",
    districtName: "영등포구",
    title: "여의도·문래 식사 선택지",
    area: "여의도 · 문래 · 영등포",
    category: "직장인·실내",
    searchQuery: "영등포구 여의도 문래 식당",
    description: "퇴근 후, 한강 산책, 실내 일정에 맞춰 식사권을 찾는 검색입니다.",
    bestFor: ["퇴근 후", "한강", "실내"],
  },
  {
    id: "seodaemun-campus",
    districtSlug: "seodaemun",
    districtName: "서대문구",
    title: "신촌·연희 가벼운 식사",
    area: "신촌 · 연희 · 이대",
    category: "대학가·카페",
    searchQuery: "서대문구 신촌 연희 식당",
    description: "대학가, 카페, 동네 산책을 묶을 때 쓰기 좋은 검색입니다.",
    bestFor: ["혼자", "대학가", "카페"],
  },
  {
    id: "gwangjin-family-park",
    districtSlug: "gwangjin",
    districtName: "광진구",
    title: "어린이대공원 전후 식사",
    area: "어린이대공원 · 건대입구 · 아차산",
    category: "가족·주말",
    searchQuery: "광진구 어린이대공원 건대입구 식당",
    description: "아이와 공원 나들이 전후로 식사 선택지를 찾는 검색입니다.",
    bestFor: ["아이와", "공원", "주말"],
  },
];

export function buildKakaoMapSearchUrl(query: string) {
  return `https://map.kakao.com/link/search/${encodeURIComponent(query.trim())}`;
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const fileContents = await fs.readFile(filePath, "utf8");
    return JSON.parse(fileContents) as T;
  } catch {
    return null;
  }
}

function includesAnyKeyword(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

export function getFoodPlaceQualityScore(place: FoodPlace) {
  const name = (place.name || "").trim();
  const category = (place.category || place.mainMenu || "").trim();
  const roadAddress = (place.roadAddress || "").trim();
  const address = (place.address || "").trim();
  const area = (place.area || "").trim();
  const combinedText = [name, category, roadAddress, address, area].join(" ");
  let score = 0;

  if (name) {
    score += 5;
  }

  if (seoulFoodDistrictNames.includes(place.district)) {
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

  if (includesAnyKeyword(category, mealCategoryKeywords)) {
    score += 30;
  }

  if (includesAnyKeyword(category, lowerPriorityCategoryKeywords)) {
    score -= category === "기타" ? 22 : 15;
  }

  if (temporaryPlacePattern.test(combinedText)) {
    score -= 50;
  }

  if (lowConfidenceLocationPattern.test(`${roadAddress} ${address}`)) {
    score -= 22;
  }

  if (corporateNamePattern.test(name)) {
    score -= 12;
  }

  if (name.length > 30) {
    score -= 6;
  }

  return score;
}

function sortFoodPlaces(a: FoodPlace, b: FoodPlace) {
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

  const byDistrict = a.district.localeCompare(b.district, "ko");

  if (byDistrict !== 0) {
    return byDistrict;
  }

  return a.name.localeCompare(b.name, "ko");
}

function getDiversityValue(value: string | undefined) {
  return value?.trim() || "정보 없음";
}

interface FoodSelectionOptions {
  limit: number;
  maxPerDistrict?: number;
  maxPerArea?: number;
  maxPerCategory?: number;
}

export function selectDiverseFoodPlaces(
  places: FoodPlace[],
  {
    limit,
    maxPerDistrict = Number.POSITIVE_INFINITY,
    maxPerArea = Number.POSITIVE_INFINITY,
    maxPerCategory = Number.POSITIVE_INFINITY,
  }: FoodSelectionOptions
) {
  const selected: FoodPlace[] = [];
  const deferred: FoodPlace[] = [];
  const districtCounts = new Map<string, number>();
  const areaCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  const canSelect = (place: FoodPlace) => {
    const district = getDiversityValue(place.district);
    const area = `${district}:${getDiversityValue(place.area)}`;
    const category = `${district}:${getDiversityValue(place.category || place.mainMenu)}`;

    return (
      (districtCounts.get(district) || 0) < maxPerDistrict &&
      (areaCounts.get(area) || 0) < maxPerArea &&
      (categoryCounts.get(category) || 0) < maxPerCategory
    );
  };

  const addPlace = (place: FoodPlace) => {
    const district = getDiversityValue(place.district);
    const area = `${district}:${getDiversityValue(place.area)}`;
    const category = `${district}:${getDiversityValue(place.category || place.mainMenu)}`;

    districtCounts.set(district, (districtCounts.get(district) || 0) + 1);
    areaCounts.set(area, (areaCounts.get(area) || 0) + 1);
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    selected.push(place);
  };

  for (const place of [...places].sort(sortFoodPlaces)) {
    if (selected.length >= limit) {
      break;
    }

    if (canSelect(place)) {
      addPlace(place);
    } else {
      deferred.push(place);
    }
  }

  for (const place of deferred) {
    if (selected.length >= limit) {
      break;
    }

    const district = getDiversityValue(place.district);

    if ((districtCounts.get(district) || 0) >= maxPerDistrict) {
      continue;
    }

    addPlace(place);
  }

  return selected;
}

function buildFoodPlaceSearchQuery(place: FoodPlace) {
  const address = place.roadAddress || place.address || place.district;
  const normalizedAddress = address
    .replace(/\s*\(.+$/, "")
    .split(",")[0]
    .trim();

  return normalizedAddress || place.district;
}

export async function getFoodIndex(): Promise<FoodIndex> {
  const indexPath = path.join(foodDataDir, "index.json");
  return (await readJsonFile<FoodIndex>(indexPath)) ?? emptyFoodIndex;
}

export async function getAllFoodPlaces(): Promise<FoodPlace[]> {
  const index = await getFoodIndex();
  return [...index.items].sort(sortFoodPlaces);
}

export async function getFeaturedFoodPlaces(limit = 12): Promise<FoodPlace[]> {
  const places = await getAllFoodPlaces();
  return selectDiverseFoodPlaces(places, {
    limit,
    maxPerDistrict: 1,
    maxPerArea: 2,
    maxPerCategory: 4,
  });
}

export async function getFoodPlacesByDistrictName(districtName: string): Promise<FoodPlace[]> {
  const places = await getAllFoodPlaces();
  const districtPlaces = places.filter((place) => place.district === districtName);
  return selectDiverseFoodPlaces(districtPlaces, {
    limit: districtPlaces.length,
    maxPerArea: 3,
    maxPerCategory: 4,
  });
}

export async function getFoodPlacesByDistrictSlug(slug: string): Promise<FoodPlace[]> {
  const district = getAllDistricts().find((item) => item.slug === slug);

  if (!district) {
    return [];
  }

  return getFoodPlacesByDistrictName(district.name);
}

export function getFoodPlaceMapSearchUrl(place: FoodPlace) {
  return buildKakaoMapSearchUrl(buildFoodPlaceSearchQuery(place));
}

export async function getFoodDistrictOverviews(): Promise<FoodDistrictOverview[]> {
  const index = await getFoodIndex();
  const placeCounts = new Map<string, number>();
  const districtGuidesByName = new Map(
    getAllDistricts().map((district) => [district.name, district])
  );
  const editorialsByName = new Map(
    foodDistrictEditorials.map((editorial) => [editorial.districtName, editorial])
  );

  for (const place of index.items) {
    placeCounts.set(place.district, (placeCounts.get(place.district) || 0) + 1);
  }

  return seoulFoodDistrictNames.map((name) => {
    const district = districtGuidesByName.get(name);
    const editorial = editorialsByName.get(name);

    if (district) {
      return {
        name,
        slug: district.slug,
        href: getDistrictFoodHref(district),
        linkType: "guide",
        hasGuide: true,
        placeCount: placeCounts.get(name) || 0,
        editorialSummary: editorial?.title,
      };
    }

    return {
      name,
      href: buildKakaoMapSearchUrl(`${name} 음식점`),
      linkType: "map",
      hasGuide: false,
      placeCount: placeCounts.get(name) || 0,
    };
  });
}

export function getAllFoodIntents(): FoodIntent[] {
  return [...foodIntents];
}

export function getAllFoodDistrictEditorials(): FoodDistrictEditorial[] {
  return [...foodDistrictEditorials];
}

export function getFoodDistrictEditorialBySlug(slug: string): FoodDistrictEditorial | undefined {
  return foodDistrictEditorials.find((editorial) => editorial.districtSlug === slug);
}

export function getFoodIntentsByDistrict(slug: string): FoodIntent[] {
  return foodIntents.filter((intent) => intent.districtSlug === slug);
}

export function getDistrictFoodHref(district: Pick<DistrictGuide, "slug">) {
  return `/districts/${district.slug}/food`;
}

export function getDistrictsWithFood() {
  const slugs = new Set(foodIntents.map((intent) => intent.districtSlug));
  return getAllDistricts().filter((district) => slugs.has(district.slug));
}
