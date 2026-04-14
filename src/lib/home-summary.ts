import type { PublicBenefitSummary } from "@/lib/public-benefits";
import type { SeoulEventSummary } from "@/lib/seoul-events";
import { filterVisibleEvents, getTodayInSeoul } from "@/lib/event-visibility";

const INDOOR_KEYWORDS = [
  "미술관",
  "박물관",
  "도서관",
  "센터",
  "극장",
  "아트홀",
  "전시실",
  "공연장",
  "실내",
  "갤러리",
  "문화회관",
  "과학관",
  "자료실",
];

export interface HomeSummaryMetrics {
  today: string;
  weekEnd: string;
  ongoingEventsCount: number;
  closingBenefitsThisWeekCount: number;
  freeEventsCount: number;
  indoorRecommendationsCount: number;
}

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getEndOfWeekInSeoul(today = getTodayInSeoul()) {
  const date = new Date(`${today}T00:00:00Z`);
  const dayOfWeek = date.getUTCDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7;
  return addDays(today, daysUntilSunday);
}

export function isOngoingEvent(event: Pick<SeoulEventSummary, "startDate" | "endDate">, today = getTodayInSeoul()) {
  const effectiveStartDate = event.startDate || event.endDate;
  const effectiveEndDate = event.endDate || event.startDate;

  if (!effectiveStartDate || !effectiveEndDate) {
    return false;
  }

  return effectiveStartDate <= today && effectiveEndDate >= today;
}

export function isIndoorEvent(
  event: Pick<SeoulEventSummary, "title" | "category" | "venue" | "summary">
) {
  const haystack = [event.title, event.category, event.venue, event.summary]
    .filter(Boolean)
    .join(" ");

  return INDOOR_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

export function getHomeSummaryMetrics(
  events: SeoulEventSummary[],
  benefits: PublicBenefitSummary[],
  today = getTodayInSeoul()
): HomeSummaryMetrics {
  const visibleEvents = filterVisibleEvents(events, today);
  const weekEnd = getEndOfWeekInSeoul(today);

  return {
    today,
    weekEnd,
    ongoingEventsCount: events.filter((event) => isOngoingEvent(event, today)).length,
    closingBenefitsThisWeekCount: benefits.filter((benefit) => {
      if (benefit.isAlwaysOpen) {
        return false;
      }

      if (!benefit.deadlineSortKey || benefit.deadlineSortKey === "9999-12-31") {
        return false;
      }

      return benefit.deadlineSortKey >= today && benefit.deadlineSortKey <= weekEnd;
    }).length,
    freeEventsCount: visibleEvents.filter((event) => event.isFree).length,
    indoorRecommendationsCount: visibleEvents.filter((event) => isIndoorEvent(event)).length,
  };
}
