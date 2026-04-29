export type DistrictSlug =
  | "jongno"
  | "jung"
  | "mapo"
  | "seongdong"
  | "yongsan"
  | "gangnam"
  | "songpa"
  | "yeongdeungpo"
  | "seodaemun"
  | "gwangjin";

export interface DistrictSituation {
  label: string;
  href: string;
  reason: string;
}

export interface DistrictRoute {
  title: string;
  stops: string[];
  description: string;
}

export interface DistrictOfficialLink {
  label: string;
  url: string;
}

export interface DistrictGuide {
  slug: DistrictSlug;
  name: string;
  headline: string;
  summary: string;
  bestFor: string[];
  keywords: string[];
  nearbyAreas: string[];
  editorialIntro: string;
  recommendedSituations: DistrictSituation[];
  halfDayRoutes: DistrictRoute[];
  officialLinks: DistrictOfficialLink[];
}

const districts: DistrictGuide[] = [
  {
    slug: "jongno",
    name: "종로구",
    headline: "궁궐, 전시, 골목 산책을 한 번에 고르기 좋은 도심 구",
    summary:
      "경복궁과 창덕궁, 서촌, 인사동, 대학로처럼 역사와 문화가 가까운 권역입니다.",
    bestFor: ["궁궐 산책", "부모님과", "비 오는 날 실내", "무료 코스"],
    keywords: ["종로구 가볼만한 곳", "종로구 아이와", "종로구 무료 행사"],
    nearbyAreas: ["광화문", "서촌", "인사동", "대학로"],
    editorialIntro:
      "종로구는 서울 초행자에게도 설명하기 쉬운 구입니다. 역사 공간, 미술관, 공연장, 오래된 골목이 가까워서 한 번에 많은 장소를 찍기보다 한 권역을 정해 천천히 걷는 일정에 잘 맞습니다.",
    recommendedSituations: [
      {
        label: "부모님과",
        href: "/search?q=%EC%84%9C%EC%9A%B8%20%EB%B6%80%EB%AA%A8%EB%8B%98%20%EC%82%B0%EC%B1%85",
        reason: "이동 거리를 짧게 잡고 궁궐, 골목, 카페를 묶기 좋습니다.",
      },
      {
        label: "비 오는 날",
        href: "/situations/rainy-day",
        reason: "박물관, 미술관, 실내 전시 대안이 많아 일정이 덜 흔들립니다.",
      },
      {
        label: "무료·저비용",
        href: "/situations/free",
        reason: "궁 주변 산책과 공공 전시를 활용하면 비용 부담이 낮습니다.",
      },
    ],
    halfDayRoutes: [
      {
        title: "광화문과 서촌을 묶는 도심 산책",
        stops: ["광화문", "경복궁", "서촌"],
        description:
          "서울 중심부를 처음 걷는 사람에게 무난합니다. 궁궐 관람 여부에 따라 시간을 조절하고, 서촌 골목에서 쉬어가면 반나절 코스로 안정적입니다.",
      },
      {
        title: "인사동과 운현궁 주변 짧은 문화 코스",
        stops: ["인사동", "운현궁", "익선동"],
        description:
          "걷는 거리가 길지 않고 실내외를 섞기 쉽습니다. 날씨가 좋지 않은 날에도 전시, 찻집, 골목 구경을 대안으로 잡을 수 있습니다.",
      },
      {
        title: "대학로와 낙산공원 연결 코스",
        stops: ["대학로", "마로니에공원", "낙산공원"],
        description:
          "공연이나 전시 전후로 걷기 좋은 코스입니다. 언덕길이 있으므로 부모님이나 아이와 갈 때는 체력과 날씨를 먼저 보세요.",
      },
    ],
    officialLinks: [{ label: "종로구청", url: "https://www.jongno.go.kr" }],
  },
  {
    slug: "jung",
    name: "중구",
    headline: "명동, 남산, 덕수궁을 묶어 도심 이동을 줄이기 좋은 구",
    summary:
      "서울역, 명동, 정동, 남산이 가까워 짧은 시간 안에 도심형 코스를 만들기 좋습니다.",
    bestFor: ["도심 산책", "퇴근 후", "부모님과", "야경"],
    keywords: ["중구 가볼만한 곳", "중구 데이트", "중구 야경"],
    nearbyAreas: ["명동", "정동", "남산", "서울역"],
    editorialIntro:
      "중구는 서울의 업무지, 관광지, 오래된 산책로가 섞인 구입니다. 대중교통 접근성이 좋아 이동 피로를 줄이기 좋고, 남산과 정동길처럼 날씨에 따라 분위기가 크게 달라지는 장소가 많습니다.",
    recommendedSituations: [
      {
        label: "퇴근 후",
        href: "/search?q=%EC%84%9C%EC%9A%B8%20%ED%87%B4%EA%B7%BC%20%ED%9B%84",
        reason: "을지로, 정동, 남산을 짧게 묶어 저녁 산책으로 쓰기 좋습니다.",
      },
      {
        label: "무료·저비용",
        href: "/situations/free",
        reason: "정동길과 남산 산책은 입장료 부담 없이 코스를 만들기 쉽습니다.",
      },
      {
        label: "부모님과",
        href: "/search?q=%EC%84%9C%EC%9A%B8%20%EB%B6%80%EB%AA%A8%EB%8B%98%20%EC%82%B0%EC%B1%85",
        reason: "덕수궁과 정동길은 걷는 속도를 조절하기 좋습니다.",
      },
    ],
    halfDayRoutes: [
      {
        title: "덕수궁과 정동길 중심 코스",
        stops: ["덕수궁", "정동길", "서울시립미술관"],
        description:
          "도심 한복판이지만 걷는 리듬이 느린 편입니다. 실내 전시와 야외 산책을 섞기 좋아 날씨 변화에도 대응하기 쉽습니다.",
      },
      {
        title: "명동과 남산 저녁 코스",
        stops: ["명동", "남산공원", "남산서울타워"],
        description:
          "쇼핑보다 산책과 전망을 중심으로 잡으면 과하게 붐비는 시간을 피할 수 있습니다. 야경 목적이라면 해가 지는 시간을 기준으로 이동하세요.",
      },
    ],
    officialLinks: [{ label: "중구청", url: "https://www.junggu.seoul.kr" }],
  },
  {
    slug: "mapo",
    name: "마포구",
    headline: "한강, 시장, 골목 상권을 함께 고르기 좋은 서북권 구",
    summary:
      "망원, 연남, 홍대, 상암, 한강공원이 가까워 취향별로 분위기가 달라집니다.",
    bestFor: ["데이트", "시장", "한강", "혼자 걷기"],
    keywords: ["마포구 무료 행사", "마포구 데이트", "마포구 한강"],
    nearbyAreas: ["망원", "연남", "홍대", "상암"],
    editorialIntro:
      "마포구는 한강과 골목 상권을 함께 쓰기 좋은 구입니다. 북적이는 홍대권, 비교적 생활감 있는 망원권, 조용한 산책을 붙이기 쉬운 상암권처럼 목적에 따라 전혀 다른 하루를 만들 수 있습니다.",
    recommendedSituations: [
      {
        label: "무료·저비용",
        href: "/situations/free",
        reason: "망원한강공원과 시장을 묶으면 비용을 낮추면서 체류 시간을 확보할 수 있습니다.",
      },
      {
        label: "혼자",
        href: "/search?q=%EC%84%9C%EC%9A%B8%20%ED%98%BC%EC%9E%90%20%EC%A3%BC%EB%A7%90",
        reason: "책방, 카페, 한강 산책을 느슨하게 연결하기 좋습니다.",
      },
      {
        label: "데이트",
        href: "/search?q=%EC%84%9C%EC%9A%B8%20%EB%8D%B0%EC%9D%B4%ED%8A%B8%20%EC%BD%94%EC%8A%A4",
        reason: "식사, 카페, 산책 선택지가 많아 날씨에 따라 코스를 바꾸기 쉽습니다.",
      },
    ],
    halfDayRoutes: [
      {
        title: "망원시장과 한강을 잇는 저비용 코스",
        stops: ["망원시장", "망원동 골목", "망원한강공원"],
        description:
          "먹거리와 산책을 같이 잡기 좋습니다. 시장 혼잡도가 높은 시간에는 한강을 먼저 걷고 돌아오는 식으로 순서를 바꾸세요.",
      },
      {
        title: "연남동과 홍대 사이 골목 산책",
        stops: ["연남동", "경의선숲길", "홍대입구"],
        description:
          "카페와 식사를 중심으로 움직이는 코스입니다. 조용한 시간을 원하면 주말 오후보다 평일 낮이나 이른 저녁이 낫습니다.",
      },
    ],
    officialLinks: [{ label: "마포구청", url: "https://www.mapo.go.kr" }],
  },
  {
    slug: "seongdong",
    name: "성동구",
    headline: "서울숲과 성수동을 중심으로 산책과 전시를 섞기 좋은 구",
    summary:
      "서울숲, 성수동, 왕십리, 뚝섬 권역을 활용해 짧은 산책과 실내 일정을 만들기 좋습니다.",
    bestFor: ["서울숲", "성수동", "데이트", "전시"],
    keywords: ["성동구 가볼만한 곳", "성수동 데이트", "서울숲 산책"],
    nearbyAreas: ["서울숲", "성수", "뚝섬", "왕십리"],
    editorialIntro:
      "성동구는 서울숲 같은 큰 야외 공간과 성수동의 실내 상권을 함께 쓸 수 있는 점이 강점입니다. 날씨가 좋으면 걷고, 흐리면 전시나 카페로 방향을 바꾸기 쉬운 구입니다.",
    recommendedSituations: [
      {
        label: "데이트",
        href: "/search?q=%EC%84%9C%EC%9A%B8%20%EC%A0%80%EB%B9%84%EC%9A%A9%20%EB%8D%B0%EC%9D%B4%ED%8A%B8",
        reason: "서울숲 산책과 성수동 실내 공간을 자연스럽게 연결할 수 있습니다.",
      },
      {
        label: "무료·저비용",
        href: "/situations/free",
        reason: "공원 체류 시간을 길게 잡으면 지출을 조절하기 쉽습니다.",
      },
      {
        label: "비 오는 날",
        href: "/situations/rainy-day",
        reason: "성수동 실내 전시와 카페를 대안으로 잡기 좋습니다.",
      },
    ],
    halfDayRoutes: [
      {
        title: "서울숲과 성수동 기본 코스",
        stops: ["서울숲", "뚝섬역", "성수동"],
        description:
          "야외 산책과 실내 휴식을 함께 넣기 좋습니다. 서울숲을 길게 걷고 성수동에서 쉬면 반나절 밀도가 적당합니다.",
      },
      {
        title: "왕십리와 서울숲을 잇는 교통 편한 코스",
        stops: ["왕십리", "서울숲", "성수"],
        description:
          "환승 접근성이 중요한 사람에게 무난합니다. 아이나 부모님과 이동할 때는 역에서 목적지까지의 도보 거리를 먼저 확인하세요.",
      },
    ],
    officialLinks: [{ label: "성동구청", url: "https://www.sd.go.kr" }],
  },
  {
    slug: "yongsan",
    name: "용산구",
    headline: "박물관, 한강, 남산권을 함께 고르기 좋은 중앙권 구",
    summary:
      "국립중앙박물관, 용산가족공원, 이태원, 한남, 한강 접근성이 강한 구입니다.",
    bestFor: ["박물관", "가족", "비 오는 날", "한강"],
    keywords: ["용산구 박물관", "용산구 아이와", "용산구 실내"],
    nearbyAreas: ["용산", "이촌", "한남", "이태원"],
    editorialIntro:
      "용산구는 실내 문화시설과 큰 공원을 함께 쓸 수 있어 가족 나들이와 비 오는 날 대안에 강합니다. 이동 동선만 잘 줄이면 박물관, 공원, 한강을 반나절 안에 조합할 수 있습니다.",
    recommendedSituations: [
      {
        label: "아이와",
        href: "/situations/kids",
        reason: "박물관과 공원을 함께 잡아 교육과 휴식을 나누기 좋습니다.",
      },
      {
        label: "비 오는 날",
        href: "/situations/rainy-day",
        reason: "국립중앙박물관 같은 큰 실내 대안이 있어 일정이 안정적입니다.",
      },
      {
        label: "무료·저비용",
        href: "/situations/free",
        reason: "공공 문화시설과 공원 중심으로 비용 부담을 줄일 수 있습니다.",
      },
    ],
    halfDayRoutes: [
      {
        title: "국립중앙박물관과 용산가족공원 코스",
        stops: ["국립중앙박물관", "용산가족공원", "이촌"],
        description:
          "아이와 부모님 모두에게 무난한 코스입니다. 박물관 체류 시간이 길어질 수 있으므로 식사와 휴식 위치를 먼저 정하세요.",
      },
      {
        title: "한남과 이태원 분위기 산책",
        stops: ["한남동", "이태원", "녹사평"],
        description:
          "골목과 식사를 중심으로 움직이는 코스입니다. 언덕과 계단이 있는 구간이 있어 편한 신발이 좋습니다.",
      },
    ],
    officialLinks: [{ label: "용산구청", url: "https://www.yongsan.go.kr" }],
  },
  {
    slug: "gangnam",
    name: "강남구",
    headline: "실내, 쇼핑, 전시, 교통 접근성을 우선할 때 보기 좋은 구",
    summary:
      "코엑스, 압구정, 신사, 역삼 권역을 중심으로 날씨 영향을 덜 받는 일정을 만들기 쉽습니다.",
    bestFor: ["실내", "쇼핑", "전시", "데이트"],
    keywords: ["강남구 실내 데이트", "강남구 전시", "강남구 가볼만한 곳"],
    nearbyAreas: ["삼성", "신사", "압구정", "역삼"],
    editorialIntro:
      "강남구는 대중교통과 실내 선택지가 강한 구입니다. 자연 산책보다 실내 체류, 쇼핑, 전시, 식사를 안정적으로 묶고 싶을 때 적합합니다.",
    recommendedSituations: [
      {
        label: "비 오는 날",
        href: "/situations/rainy-day",
        reason: "대형 실내 공간과 지하 연결 동선이 있어 날씨 영향을 줄이기 쉽습니다.",
      },
      {
        label: "데이트",
        href: "/search?q=%EA%B0%95%EB%82%A8%EA%B5%AC%20%EB%8D%B0%EC%9D%B4%ED%8A%B8",
        reason: "식사, 전시, 쇼핑을 짧은 이동 안에서 묶기 좋습니다.",
      },
      {
        label: "작업 공간",
        href: "/search?q=%EC%84%9C%EC%9A%B8%20%EC%9E%91%EC%97%85%20%EA%B3%B5%EA%B0%84",
        reason: "카페와 공공·민간 실내 공간 선택지가 많습니다.",
      },
    ],
    halfDayRoutes: [
      {
        title: "삼성역 실내 중심 코스",
        stops: ["삼성역", "코엑스", "봉은사"],
        description:
          "날씨가 나쁜 날에 안정적입니다. 실내 체류가 길어질 수 있으므로 식사 시간대 혼잡을 피해 움직이면 좋습니다.",
      },
      {
        title: "신사와 압구정 가벼운 산책",
        stops: ["신사", "가로수길", "압구정"],
        description:
          "카페와 쇼핑을 중심으로 하는 코스입니다. 걷는 목적보다 쉬어가는 장소를 미리 잡는 편이 만족도가 높습니다.",
      },
    ],
    officialLinks: [{ label: "강남구청", url: "https://www.gangnam.go.kr" }],
  },
  {
    slug: "songpa",
    name: "송파구",
    headline: "석촌호수, 잠실, 올림픽공원을 중심으로 가족 나들이에 강한 구",
    summary:
      "잠실, 석촌호수, 방이, 올림픽공원 권역을 활용해 산책과 실내 대안을 같이 잡기 좋습니다.",
    bestFor: ["가족", "호수 산책", "주말", "야경"],
    keywords: ["송파구 아이와", "송파구 주말 나들이", "석촌호수 산책"],
    nearbyAreas: ["잠실", "석촌", "방이", "올림픽공원"],
    editorialIntro:
      "송파구는 가족 단위가 일정을 짜기 편한 구입니다. 넓은 공원과 호수, 대형 실내 시설이 가까워 아이와 갈 때도 날씨 대안을 마련하기 쉽습니다.",
    recommendedSituations: [
      {
        label: "아이와",
        href: "/situations/kids",
        reason: "석촌호수, 공원, 실내 시설을 상황에 맞게 조합하기 좋습니다.",
      },
      {
        label: "무료·저비용",
        href: "/situations/free",
        reason: "호수와 공원 산책만으로도 체류 시간이 충분합니다.",
      },
      {
        label: "야경",
        href: "/search?q=%EC%84%9C%EC%9A%B8%20%EC%95%BC%EA%B2%BD%20%EC%82%B0%EC%B1%85",
        reason: "석촌호수와 잠실권은 저녁 산책 수요가 큽니다.",
      },
    ],
    halfDayRoutes: [
      {
        title: "석촌호수와 잠실을 묶는 기본 코스",
        stops: ["잠실역", "석촌호수", "방이동"],
        description:
          "호수 산책과 식사를 함께 잡기 좋습니다. 주말에는 혼잡하므로 아이와 갈 때는 오전이나 늦은 오후를 고려하세요.",
      },
      {
        title: "올림픽공원 넓은 산책 코스",
        stops: ["올림픽공원", "몽촌토성", "방이"],
        description:
          "걷는 시간이 긴 코스입니다. 부모님과 함께라면 중간 휴식 지점을 정하고 무리하지 않는 동선으로 잡는 편이 좋습니다.",
      },
    ],
    officialLinks: [{ label: "송파구청", url: "https://www.songpa.go.kr" }],
  },
  {
    slug: "yeongdeungpo",
    name: "영등포구",
    headline: "여의도, 한강, 실내 쇼핑을 함께 보기 좋은 서남권 구",
    summary:
      "여의도공원, 한강공원, 문래, 타임스퀘어 권역을 상황별로 나눠 쓰기 좋습니다.",
    bestFor: ["한강", "실내", "직장인", "전시"],
    keywords: ["영등포구 한강", "영등포구 실내", "여의도 산책"],
    nearbyAreas: ["여의도", "문래", "영등포", "당산"],
    editorialIntro:
      "영등포구는 업무지와 한강, 실내 상권이 가까운 구입니다. 평일 퇴근 후 짧게 걷거나 비 오는 날 실내로 전환하기 쉬워 반복 방문형 코스에 적합합니다.",
    recommendedSituations: [
      {
        label: "퇴근 후",
        href: "/search?q=%EC%84%9C%EC%9A%B8%20%ED%87%B4%EA%B7%BC%20%ED%9B%84",
        reason: "여의도와 문래 권역은 짧은 저녁 코스를 만들기 좋습니다.",
      },
      {
        label: "비 오는 날",
        href: "/situations/rainy-day",
        reason: "대형 실내 공간과 전시, 식사 대안이 많습니다.",
      },
      {
        label: "무료·저비용",
        href: "/situations/free",
        reason: "여의도공원과 한강 산책은 비용을 낮추기 쉽습니다.",
      },
    ],
    halfDayRoutes: [
      {
        title: "여의도공원과 한강 짧은 산책",
        stops: ["여의도역", "여의도공원", "여의도한강공원"],
        description:
          "퇴근 후나 주말 오전에 가볍게 걷기 좋습니다. 한강까지 이동할 때 날씨와 바람을 먼저 확인하세요.",
      },
      {
        title: "문래 창작촌과 영등포 실내 대안",
        stops: ["문래", "영등포", "타임스퀘어"],
        description:
          "골목 구경과 실내 체류를 함께 잡는 코스입니다. 비가 오면 실내 비중을 늘리면 됩니다.",
      },
    ],
    officialLinks: [{ label: "영등포구청", url: "https://www.ydp.go.kr" }],
  },
  {
    slug: "seodaemun",
    name: "서대문구",
    headline: "신촌, 연희, 안산 자락을 묶어 가볍게 걷기 좋은 구",
    summary:
      "신촌, 연희동, 홍제, 안산 권역을 통해 대학가와 숲길 분위기를 함께 고를 수 있습니다.",
    bestFor: ["대학가", "혼자 걷기", "카페", "가벼운 산책"],
    keywords: ["서대문구 산책", "신촌 가볼만한 곳", "연희동 카페"],
    nearbyAreas: ["신촌", "연희", "홍제", "안산"],
    editorialIntro:
      "서대문구는 번화한 대학가와 조용한 동네 산책을 함께 가진 구입니다. 신촌처럼 접근성이 좋은 곳과 연희동처럼 느린 시간을 보내기 좋은 곳이 가까워 목적에 따라 밀도를 조절할 수 있습니다.",
    recommendedSituations: [
      {
        label: "혼자",
        href: "/search?q=%EC%84%9C%EC%9A%B8%20%ED%98%BC%EC%9E%90%20%EC%A3%BC%EB%A7%90",
        reason: "책방, 카페, 동네 산책을 부담 없이 조합하기 좋습니다.",
      },
      {
        label: "무료·저비용",
        href: "/situations/free",
        reason: "동네 산책과 공원형 코스를 활용하면 지출을 줄일 수 있습니다.",
      },
      {
        label: "부모님과",
        href: "/search?q=%EC%84%9C%EC%9A%B8%20%EB%B6%80%EB%AA%A8%EB%8B%98%20%EC%82%B0%EC%B1%85",
        reason: "무리하지 않는 동네 산책으로 코스를 만들 수 있습니다.",
      },
    ],
    halfDayRoutes: [
      {
        title: "연희동 카페와 골목 산책",
        stops: ["연희동", "홍제천", "신촌"],
        description:
          "조용히 걷고 쉬기 좋은 코스입니다. 대중교통 이동과 도보 이동이 섞이므로 동선을 너무 길게 잡지 않는 편이 좋습니다.",
      },
      {
        title: "신촌과 이대 주변 대학가 코스",
        stops: ["신촌", "이대", "연세로"],
        description:
          "식사와 카페 선택지가 많아 가볍게 움직이기 좋습니다. 붐비는 시간에는 메인 거리보다 주변 골목을 활용하세요.",
      },
    ],
    officialLinks: [{ label: "서대문구청", url: "https://www.sdm.go.kr" }],
  },
  {
    slug: "gwangjin",
    name: "광진구",
    headline: "어린이대공원, 한강, 건대입구를 함께 고르기 좋은 동북권 구",
    summary:
      "어린이대공원, 아차산, 뚝섬한강공원, 건대입구가 가까워 가족과 젊은 방문자 모두에게 선택지가 있습니다.",
    bestFor: ["아이와", "공원", "한강", "주말"],
    keywords: ["광진구 아이와", "광진구 주말 나들이", "어린이대공원"],
    nearbyAreas: ["어린이대공원", "건대입구", "아차산", "뚝섬"],
    editorialIntro:
      "광진구는 아이와 함께 움직일 때 특히 쓰임이 좋은 구입니다. 어린이대공원과 서울상상나라, 한강 접근성이 있어 야외와 실내를 나눠 준비하기 쉽습니다.",
    recommendedSituations: [
      {
        label: "아이와",
        href: "/situations/kids",
        reason: "어린이대공원과 실내 체험 공간을 함께 고려하기 좋습니다.",
      },
      {
        label: "무료·저비용",
        href: "/situations/free",
        reason: "공원과 한강을 활용하면 비용 부담 없이 시간을 보내기 좋습니다.",
      },
      {
        label: "주말",
        href: "/search?q=%EC%84%9C%EC%9A%B8%20%EC%A3%BC%EB%A7%90%20%EC%BD%94%EC%8A%A4",
        reason: "가족, 산책, 식사 코스를 모두 만들 수 있습니다.",
      },
    ],
    halfDayRoutes: [
      {
        title: "어린이대공원 중심 가족 코스",
        stops: ["어린이대공원", "서울상상나라", "건대입구"],
        description:
          "아이와 갈 때 가장 안정적인 조합입니다. 체류 시간이 길어질 수 있으므로 식사와 휴식 위치를 먼저 확인하세요.",
      },
      {
        title: "아차산과 한강을 나누는 산책 코스",
        stops: ["아차산", "광나루", "뚝섬한강공원"],
        description:
          "걷는 목적이 분명한 날에 좋습니다. 산길과 강변 산책은 피로도가 다르므로 한 번에 모두 넣기보다 날씨와 체력에 맞게 줄이세요.",
      },
    ],
    officialLinks: [{ label: "광진구청", url: "https://www.gwangjin.go.kr" }],
  },
];

export function getAllDistricts(): DistrictGuide[] {
  return [...districts];
}

export function getDistrictBySlug(slug: string): DistrictGuide | null {
  return districts.find((district) => district.slug === slug) ?? null;
}

export function getDistrictSlugs(): DistrictSlug[] {
  return districts.map((district) => district.slug);
}
