// 더미 데이터 - 나중에 공공데이터 API로 교체할 예정

// 행사/축제 타입
export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  category: string;
  image: string;
}

// 지원금/혜택 타입
export interface Benefit {
  id: number;
  title: string;
  target: string;
  deadline: string;
  amount: string;
  description: string;
  howToApply: string;
  category: string;
}

// 블로그 글 타입
export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: string;
}

// ======= 행사/축제 더미 데이터 =======
export const events: Event[] = [
  {
    id: 1,
    title: "2026 벚꽃축제",
    date: "2026-04-05 ~ 2026-04-13",
    location: "여의도 한강공원",
    description:
      "봄을 맞아 여의도 한강공원에서 열리는 벚꽃축제입니다. 아름다운 벚꽃길을 따라 산책하며 다양한 먹거리와 공연을 즐길 수 있습니다. 가족, 연인, 친구와 함께 봄의 정취를 만끽해보세요.",
    category: "축제",
    image: "/images/cherry-blossom.jpg",
  },
  {
    id: 2,
    title: "동네 플리마켓",
    date: "2026-03-22 ~ 2026-03-23",
    location: "성동구 서울숲 광장",
    description:
      "주민들이 직접 참여하는 플리마켓입니다. 수공예품, 빈티지 의류, 수제 먹거리 등 다양한 물건을 사고팔 수 있습니다. 누구나 참여 가능하며 부스 신청은 사전 접수 필요합니다.",
    category: "마켓",
    image: "/images/flea-market.jpg",
  },
  {
    id: 3,
    title: "무료 영화 상영회",
    date: "2026-03-28",
    location: "마포구 문화센터 대강당",
    description:
      "지역 주민을 위한 무료 영화 상영회입니다. 이번 달에는 가족이 함께 볼 수 있는 애니메이션 영화를 상영합니다. 사전 예약 없이 선착순 입장 가능합니다.",
    category: "문화",
    image: "/images/movie.jpg",
  },
  {
    id: 4,
    title: "주민 건강 걷기 대회",
    date: "2026-04-01",
    location: "송파구 올림픽공원",
    description:
      "건강한 봄을 위한 걷기 대회입니다. 5km, 10km 코스 중 선택 가능하며, 완주자 전원에게 기념품이 제공됩니다. 참가비 무료이며 사전 신청이 필요합니다.",
    category: "건강",
    image: "/images/walking.jpg",
  },
];

// ======= 지원금/혜택 더미 데이터 =======
export const benefits: Benefit[] = [
  {
    id: 1,
    title: "청년 월세 지원금",
    target: "만 19~34세, 무주택 청년",
    deadline: "2026-03-31",
    amount: "월 최대 20만원 (최대 12개월)",
    description:
      "무주택 청년의 주거비 부담을 줄이기 위한 월세 지원 사업입니다. 소득 기준을 충족하는 청년이라면 누구나 신청 가능합니다.",
    howToApply: "복지로(bokjiro.go.kr) 또는 주민센터 방문 신청",
    category: "주거",
  },
  {
    id: 2,
    title: "출산 축하금",
    target: "관내 출생 신고한 가정",
    deadline: "출생 후 90일 이내",
    amount: "첫째 50만원, 둘째 100만원, 셋째 이상 200만원",
    description:
      "출산 가정을 축하하고 양육비 부담을 줄이기 위한 축하금입니다. 출생 신고 시 자동 안내됩니다.",
    howToApply: "주민센터 출생 신고 시 함께 신청",
    category: "출산/육아",
  },
  {
    id: 3,
    title: "소상공인 에너지 지원",
    target: "연매출 3억 이하 소상공인",
    deadline: "2026-04-30",
    amount: "전기요금 최대 20만원 지원",
    description:
      "에너지 비용 상승으로 어려움을 겪는 소상공인을 위한 전기요금 지원 사업입니다.",
    howToApply: "소상공인마당(sbiz.or.kr) 온라인 신청",
    category: "사업",
  },
  {
    id: 4,
    title: "어르신 교통비 지원",
    target: "만 65세 이상 어르신",
    deadline: "상시 신청",
    amount: "월 5만원 교통카드 충전",
    description:
      "어르신들의 이동 편의를 위한 교통비 지원 사업입니다. 대중교통 이용 시 사용 가능한 교통카드에 매월 자동 충전됩니다.",
    howToApply: "주민센터 방문 신청 (신분증 지참)",
    category: "복지",
  },
];

// ======= 블로그 더미 데이터 =======
export const blogPosts: BlogPost[] = [
  {
    slug: "spring-festivals-2026",
    title: "2026년 봄, 우리 동네에서 열리는 축제 총정리",
    summary:
      "올봄 서울 곳곳에서 열리는 축제 정보를 한눈에 정리했습니다. 벚꽃축제부터 플리마켓까지!",
    content: `따뜻한 봄바람이 불어오면서, 서울 곳곳에서 다양한 축제가 열립니다.

## 🌸 여의도 벚꽃축제
4월 5일부터 13일까지 여의도 한강공원에서 벚꽃축제가 열립니다. 윤중로를 따라 펼쳐지는 벚꽃 터널은 매년 수십만 명의 방문객이 찾는 명소입니다.

## 🛍️ 서울숲 플리마켓
3월 22~23일 성동구 서울숲 광장에서 동네 플리마켓이 열립니다. 수공예품, 빈티지 의류, 수제 먹거리 등을 만나보세요.

## 🎬 무료 영화 상영회
마포구 문화센터에서 3월 28일 무료 영화 상영회가 진행됩니다. 온 가족이 함께 즐길 수 있는 애니메이션 영화를 상영합니다.

봄나들이 계획을 세우고 계시다면, 이 축제들을 놓치지 마세요!`,
    date: "2026-03-15",
    category: "축제",
  },
  {
    slug: "youth-benefits-guide",
    title: "2026년 청년이 받을 수 있는 지원금 총정리",
    summary:
      "청년 월세 지원부터 취업 지원금까지, 놓치면 아까운 청년 혜택을 정리했습니다.",
    content: `청년이라면 꼭 챙겨야 할 지원금과 혜택을 정리했습니다.

## 🏠 청년 월세 지원금
만 19~34세 무주택 청년을 대상으로 월 최대 20만원, 최대 12개월간 월세를 지원합니다. 3월 31일까지 신청 가능합니다.

## 💼 청년 내일채움공제
중소·중견기업에 취업한 청년에게 2년간 1,600만원을 적립해주는 제도입니다.

## 📚 국민취업지원제도
구직 청년에게 월 50만원씩 최대 6개월간 구직촉진수당을 지급합니다.

신청 기간을 놓치지 않도록 달력에 표시해두세요!`,
    date: "2026-03-10",
    category: "지원금",
  },
  {
    slug: "senior-benefits-2026",
    title: "어르신을 위한 2026년 복지 혜택 안내",
    summary:
      "교통비 지원, 건강검진, 문화 프로그램까지 어르신을 위한 혜택을 정리했습니다.",
    content: `만 65세 이상 어르신이 받을 수 있는 다양한 혜택을 안내합니다.

## 🚌 교통비 지원
월 5만원의 교통카드 충전 혜택이 제공됩니다. 주민센터에서 신분증을 가지고 신청하세요.

## 🏥 무료 건강검진
국민건강보험공단에서 제공하는 무료 건강검진을 받을 수 있습니다. 2년마다 한 번씩 제공됩니다.

## 🎭 문화 프로그램
각 구청에서 운영하는 무료 문화 프로그램(요가, 서예, 노래교실 등)에 참여할 수 있습니다.

자세한 내용은 주민센터나 구청 홈페이지를 확인해주세요!`,
    date: "2026-03-05",
    category: "복지",
  },
];
