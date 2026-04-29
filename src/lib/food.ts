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
  name: string;
  district: string;
  area: string;
  category: string;
  mainMenu: string;
  address: string;
  roadAddress: string;
  phone: string;
  status: "영업" | "폐업" | "정보 없음";
  licenseDate: string;
  sourceLabel: string;
  sourceUrl: string;
  collectedAt: string;
}

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

export function getAllFoodIntents(): FoodIntent[] {
  return [...foodIntents];
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
