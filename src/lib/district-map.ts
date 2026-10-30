import type { DistrictGuide, DistrictSlug } from "./districts.ts";
import type { FoodDistrictOverview } from "./food.ts";
import type { PublicBenefitSummary } from "./public-benefits.ts";
import type { SeoulEventSummary } from "./seoul-events.ts";
import { filterVisibleEvents, sortEventsByStartDate } from "./event-visibility.ts";

export type DistrictMapMetric = "benefits" | "events" | "free";
export type MetricStep = 0 | 1 | 2 | 3 | 4;

export interface DistrictTile {
  name: string;
  row: number;
  col: number;
}

// 구 중심점과 칸 사이 거리 합이 가장 작은 5×5 배치 (docs/works/home_district_tile_map/spec.md 4절)
export const SEOUL_DISTRICT_TILES: readonly DistrictTile[] = [
  { name: "은평구", row: 1, col: 1 },
  { name: "종로구", row: 1, col: 2 },
  { name: "강북구", row: 1, col: 3 },
  { name: "도봉구", row: 1, col: 4 },
  { name: "노원구", row: 1, col: 5 },
  { name: "강서구", row: 2, col: 1 },
  { name: "서대문구", row: 2, col: 2 },
  { name: "성북구", row: 2, col: 3 },
  { name: "동대문구", row: 2, col: 4 },
  { name: "중랑구", row: 2, col: 5 },
  { name: "양천구", row: 3, col: 1 },
  { name: "마포구", row: 3, col: 2 },
  { name: "중구", row: 3, col: 3 },
  { name: "성동구", row: 3, col: 4 },
  { name: "강동구", row: 3, col: 5 },
  { name: "구로구", row: 4, col: 1 },
  { name: "영등포구", row: 4, col: 2 },
  { name: "용산구", row: 4, col: 3 },
  { name: "강남구", row: 4, col: 4 },
  { name: "광진구", row: 4, col: 5 },
  { name: "금천구", row: 5, col: 1 },
  { name: "관악구", row: 5, col: 2 },
  { name: "동작구", row: 5, col: 3 },
  { name: "서초구", row: 5, col: 4 },
  { name: "송파구", row: 5, col: 5 },
];

type StepLowerBounds = readonly [0, number, number, number, number];

export const DISTRICT_MAP_METRICS: Record<DistrictMapMetric, { label: string; lowerBounds: StepLowerBounds }> = {
  benefits: { label: "혜택", lowerBounds: [0, 25, 35, 45, 60] },
  events: { label: "행사", lowerBounds: [0, 1, 3, 5, 8] },
  free: { label: "무료 행사", lowerBounds: [0, 1, 2, 4, 6] },
};

export function getMetricStep(metric: DistrictMapMetric, value: number): MetricStep {
  const bounds = DISTRICT_MAP_METRICS[metric].lowerBounds;
  let step: MetricStep = 0;

  bounds.forEach((bound, index) => {
    if (value >= bound) {
      step = index as MetricStep;
    }
  });

  return step;
}

export function getMetricLegend(metric: DistrictMapMetric): string[] {
  const bounds = DISTRICT_MAP_METRICS[metric].lowerBounds;

  return bounds.map((bound, index) => {
    const next = bounds[index + 1];

    if (next === undefined) {
      return `${bound}+`;
    }

    return next - 1 === bound ? `${bound}` : `${bound}–${next - 1}`;
  });
}

export interface DistrictMapEntry {
  name: string;
  row: number;
  col: number;
  guideSlug: DistrictSlug | null;
  benefitCount: number;
  food: { href: string; isExternal: boolean; placeCount: number };
}

export function buildDistrictMapEntries({
  guides,
  benefits,
  foodOverviews,
}: {
  guides: Pick<DistrictGuide, "name" | "slug">[];
  benefits: Pick<PublicBenefitSummary, "district">[];
  foodOverviews: Pick<FoodDistrictOverview, "name" | "href" | "linkType" | "placeCount">[];
}): DistrictMapEntry[] {
  const guideSlugs = new Map(guides.map((guide) => [guide.name, guide.slug]));
  const foodByName = new Map(foodOverviews.map((overview) => [overview.name, overview]));
  const benefitCounts = new Map<string, number>();

  for (const benefit of benefits) {
    benefitCounts.set(benefit.district, (benefitCounts.get(benefit.district) ?? 0) + 1);
  }

  return SEOUL_DISTRICT_TILES.map((tile) => {
    const food = foodByName.get(tile.name);

    if (!food) {
      throw new Error(`먹거리 개요에 ${tile.name} 항목이 없습니다.`);
    }

    return {
      ...tile,
      guideSlug: guideSlugs.get(tile.name) ?? null,
      benefitCount: benefitCounts.get(tile.name) ?? 0,
      food: { href: food.href, isExternal: food.linkType === "map", placeCount: food.placeCount },
    };
  });
}

export type DistrictMapEvent = Pick<
  SeoulEventSummary,
  "id" | "title" | "district" | "venue" | "startDate" | "endDate" | "isFree"
>;

export interface DistrictEventSummary {
  visibleCount: number;
  ongoingCount: number;
  freeCount: number;
  featured: (DistrictMapEvent & { isOngoing: boolean })[];
}

const FEATURED_EVENT_LIMIT = 3;

export function summarizeEventsByDistrict(
  events: DistrictMapEvent[],
  today: string,
): Map<string, DistrictEventSummary> {
  const summaries = new Map<string, DistrictEventSummary>();

  for (const event of sortEventsByStartDate(filterVisibleEvents(events, today))) {
    const summary = summaries.get(event.district) ?? { visibleCount: 0, ongoingCount: 0, freeCount: 0, featured: [] };
    // 볼 수 있는 행사는 이미 끝나지 않았으므로, 시작일만 확인하면 진행 중 여부가 된다
    const isOngoing = (event.startDate || event.endDate) <= today;

    summary.visibleCount += 1;
    summary.ongoingCount += isOngoing ? 1 : 0;
    summary.freeCount += event.isFree ? 1 : 0;
    summary.featured.push({ ...event, isOngoing });
    summaries.set(event.district, summary);
  }

  for (const summary of summaries.values()) {
    summary.featured = [
      ...summary.featured.filter((event) => event.isOngoing),
      ...summary.featured.filter((event) => !event.isOngoing),
    ].slice(0, FEATURED_EVENT_LIMIT);
  }

  return summaries;
}

export interface DistrictLinks {
  primary: { kind: "guide" | "events" | "benefits"; href: string };
  events: string | null;
  benefits: string;
  food: { href: string; isExternal: boolean };
}

export function getDistrictLinks(entry: DistrictMapEntry, visibleEventCount: number): DistrictLinks {
  const district = encodeURIComponent(entry.name);
  const events = visibleEventCount > 0 ? `/events?district=${district}` : null;
  const benefits = `/benefits?district=${district}`;
  const primary: DistrictLinks["primary"] = entry.guideSlug
    ? { kind: "guide", href: `/districts/${entry.guideSlug}` }
    : events
      ? { kind: "events", href: events }
      : { kind: "benefits", href: benefits };

  return {
    primary,
    events,
    benefits,
    food: { href: entry.food.href, isExternal: entry.food.isExternal },
  };
}
