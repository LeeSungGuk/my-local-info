export interface EventDateRange {
  startDate: string;
  endDate: string;
}

const SEOUL_TIME_ZONE = "Asia/Seoul";

function getDatePart(formatter: Intl.DateTimeFormat, date: Date, type: Intl.DateTimeFormatPartTypes) {
  return formatter.formatToParts(date).find((part) => part.type === type)?.value || "";
}

export function getTodayInSeoul(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: SEOUL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const year = getDatePart(formatter, date, "year");
  const month = getDatePart(formatter, date, "month");
  const day = getDatePart(formatter, date, "day");

  return `${year}-${month}-${day}`;
}

export function isVisibleEvent(event: EventDateRange, today = getTodayInSeoul()) {
  const effectiveStartDate = event.startDate || event.endDate;
  const effectiveEndDate = event.endDate || event.startDate;

  if (!effectiveStartDate && !effectiveEndDate) {
    return false;
  }

  return (effectiveEndDate || effectiveStartDate) >= today;
}

export function filterVisibleEvents<T extends EventDateRange>(events: T[], today = getTodayInSeoul()) {
  return events.filter((event) => isVisibleEvent(event, today));
}

export function sortEventsByStartDate<T extends EventDateRange & { district?: string; title?: string }>(
  events: T[]
) {
  return [...events].sort((a, b) => {
    const aStart = a.startDate || a.endDate || "9999-12-31";
    const bStart = b.startDate || b.endDate || "9999-12-31";
    const byStartDate = aStart.localeCompare(bStart);

    if (byStartDate !== 0) {
      return byStartDate;
    }

    const aEnd = a.endDate || a.startDate || "9999-12-31";
    const bEnd = b.endDate || b.startDate || "9999-12-31";
    const byEndDate = aEnd.localeCompare(bEnd);

    if (byEndDate !== 0) {
      return byEndDate;
    }

    const byDistrict = (a.district || "").localeCompare(b.district || "", "ko");

    if (byDistrict !== 0) {
      return byDistrict;
    }

    return (a.title || "").localeCompare(b.title || "", "ko");
  });
}
