import type { Post } from "./posts.ts";

export type SituationSlug = "kids" | "rainy-day" | "free";
export type SituationAccent = "sky" | "teal" | "amber";

export interface SituationGuideSection {
  title: string;
  body: string;
}

export interface SituationGuide {
  slug: SituationSlug;
  href: `/situations/${SituationSlug}`;
  eyebrow: string;
  title: string;
  cardTitle: string;
  summary: string;
  heroDescription: string;
  searchIntent: string;
  accent: SituationAccent;
  tags: string[];
  relatedSourceIds: string[];
  guideSections: SituationGuideSection[];
  checklist: string[];
}

function normalizeKeyword(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

const situations: SituationGuide[] = [
  {
    slug: "kids",
    href: "/situations/kids",
    eyebrow: "아이와",
    title: "아이와 서울 나들이",
    cardTitle: "아이와 갈만한 곳",
    summary:
      "이동 부담, 실내외 선택, 연령대별 주의점을 먼저 보고 주말 코스를 고를 수 있게 정리합니다.",
    heroDescription:
      "아이와 함께 움직일 때는 장소 자체보다 이동 동선, 휴식 공간, 날씨 대안이 더 중요합니다. 이 페이지는 부모가 빠르게 판단할 수 있는 기준과 관련 글을 연결합니다.",
    searchIntent: "서울 아이와 갈만한 곳",
    accent: "sky",
    tags: ["아이와", "가족", "주말", "실내", "공원"],
    relatedSourceIds: ["seoul-family-weekend-course"],
    guideSections: [
      {
        title: "먼저 이동 피로를 줄이세요",
        body:
          "아이와 가는 코스는 장소를 많이 넣는 것보다 이동 횟수를 줄이는 편이 만족도가 높습니다. 한 권역 안에서 실내와 야외 대안을 같이 잡는 방식이 안전합니다.",
      },
      {
        title: "실내와 야외를 동시에 준비하세요",
        body:
          "서울은 날씨와 혼잡도에 따라 체감 난도가 크게 달라집니다. 야외 중심 코스라도 근처 박물관, 도서관, 복합문화공간 같은 대체지를 같이 확인하는 것이 좋습니다.",
      },
      {
        title: "연령대별 체류 시간을 다르게 잡으세요",
        body:
          "미취학 아동은 짧은 이동과 휴식 공간이 중요하고, 초등학생은 체험 요소가 있는 장소가 좋습니다. 같은 장소라도 체류 시간을 다르게 잡아야 일정이 무너지지 않습니다.",
      },
    ],
    checklist: [
      "유모차나 아이 동반 이동이 가능한 동선인지 확인하기",
      "비가 올 때 대체할 실내 장소를 1곳 이상 정하기",
      "식사와 화장실 위치를 방문 전에 확인하기",
      "공식 홈페이지에서 휴관일과 예약 여부 확인하기",
    ],
  },
  {
    slug: "rainy-day",
    href: "/situations/rainy-day",
    eyebrow: "비 오는 날",
    title: "서울 비 오는 날 실내 코스",
    cardTitle: "비 오는 날 실내 코스",
    summary:
      "비가 와도 일정이 무너지지 않도록 실내 장소, 짧은 이동, 예약 여부를 기준으로 고릅니다.",
    heroDescription:
      "비 오는 날에는 좋은 장소보다 덜 젖고 덜 걷는 동선이 먼저입니다. 실내 중심 코스와 방문 전 확인할 기준을 한 번에 정리합니다.",
    searchIntent: "서울 비 오는 날 실내",
    accent: "teal",
    tags: ["비 오는 날", "실내", "박물관", "전시", "가족"],
    relatedSourceIds: ["seoul-rainy-day-indoor"],
    guideSections: [
      {
        title: "이동이 짧은 권역을 고르세요",
        body:
          "비 오는 날에는 지하철역과 가까운 장소, 한 건물 안에서 오래 머물 수 있는 장소가 유리합니다. 여러 장소를 찍는 코스보다 한두 곳을 깊게 보는 편이 낫습니다.",
      },
      {
        title: "예약과 휴관일을 먼저 확인하세요",
        body:
          "인기 실내 시설은 주말과 우천 시 혼잡도가 높습니다. 현장 대기 가능 여부, 사전 예약, 휴관일을 공식 페이지에서 먼저 확인해야 합니다.",
      },
      {
        title: "카페나 식사 공간을 동선 안에 넣으세요",
        body:
          "비 오는 날 일정은 중간 휴식지가 없으면 피로도가 빠르게 올라갑니다. 이동 중간에 앉을 수 있는 공간을 미리 정해두면 일정이 훨씬 안정적입니다.",
      },
    ],
    checklist: [
      "지하철역에서 도보 이동 시간이 긴 장소는 피하기",
      "우천 시 운영 변경이나 예약 필요 여부 확인하기",
      "혼잡 시간대를 피해 오전 또는 늦은 오후로 잡기",
      "우산 보관, 물품 보관, 유모차 이동 가능 여부 확인하기",
    ],
  },
  {
    slug: "free",
    href: "/situations/free",
    eyebrow: "무료·저비용",
    title: "서울 무료·저비용 나들이",
    cardTitle: "무료·저비용 코스",
    summary:
      "입장료 부담 없이 반나절 보내기 좋은 서울 장소를 비용, 체류 시간, 만족도 기준으로 고릅니다.",
    heroDescription:
      "무료 장소도 이동비, 식사비, 대기 시간까지 포함하면 만족도가 달라집니다. 돈을 많이 쓰지 않고도 반나절을 보내는 선택 기준을 정리합니다.",
    searchIntent: "서울 무료 나들이",
    accent: "amber",
    tags: ["무료", "저비용", "공원", "전시", "반나절"],
    relatedSourceIds: ["seoul-free-spot-guide"],
    guideSections: [
      {
        title: "무료보다 총비용을 보세요",
        body:
          "입장료가 없어도 이동비와 식사비가 커지면 저비용 코스가 아닙니다. 대중교통 접근성과 근처 식사 선택지를 같이 봐야 합니다.",
      },
      {
        title: "체류 시간이 충분한 장소를 고르세요",
        body:
          "무료 명소는 짧게 보고 끝나는 곳도 많습니다. 산책, 전시, 전망, 휴식 중 최소 두 가지 이상을 할 수 있는 장소가 반나절 코스로 적합합니다.",
      },
      {
        title: "계절과 날씨 영향을 확인하세요",
        body:
          "공원과 야외 명소는 계절에 따라 만족도가 크게 달라집니다. 미세먼지, 폭염, 한파가 있는 날에는 무료 실내 전시나 도서관형 공간을 대안으로 두세요.",
      },
    ],
    checklist: [
      "입장료 외 식사비와 이동비까지 예상하기",
      "무료 운영 시간과 휴관일 확인하기",
      "주말 혼잡도가 높은 시간대 피하기",
      "야외 장소라면 근처 실내 대체지 1곳 정하기",
    ],
  },
];

export function getAllSituations(): SituationGuide[] {
  return [...situations];
}

export function getSituationBySlug(slug: string): SituationGuide | null {
  return situations.find((situation) => situation.slug === slug) ?? null;
}

export function getRelatedPostsForSituation(
  situation: SituationGuide,
  posts: Post[]
): Post[] {
  const seenSourceIds = new Set<string>();
  const relatedPosts: Post[] = [];
  const normalizedTags = new Set(situation.tags.map(normalizeKeyword));

  for (const sourceId of situation.relatedSourceIds) {
    const post = posts.find((candidate) => candidate.sourceId === sourceId);

    if (post && !seenSourceIds.has(post.sourceId)) {
      seenSourceIds.add(post.sourceId);
      relatedPosts.push(post);
    }
  }

  for (const post of posts) {
    if (seenSourceIds.has(post.sourceId)) {
      continue;
    }

    const hasTagMatch = post.tags.some((tag) =>
      normalizedTags.has(normalizeKeyword(tag))
    );

    if (hasTagMatch) {
      seenSourceIds.add(post.sourceId);
      relatedPosts.push(post);
    }
  }

  return relatedPosts;
}
