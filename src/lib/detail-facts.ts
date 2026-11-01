const PLACEHOLDER_VALUES = new Set(["기타", "-", "없음"]);

export function isMeaningfulFactValue(value: string | null | undefined): value is string {
  const trimmed = value?.trim() ?? "";

  if (!trimmed || PLACEHOLDER_VALUES.has(trimmed)) {
    return false;
  }

  return !trimmed.endsWith("정보 없음");
}

export function formatKstDateTime(value: string) {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    return value;
  }

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value])
  );

  return `${parts.year}년 ${parts.month}월 ${parts.day}일 ${parts.hour}:${parts.minute}`;
}

function toCalendarDate(dateString: string, addDays = 0) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + addDays);
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

export function buildGoogleCalendarUrl({
  title,
  startDate,
  endDate,
  location,
}: {
  title: string;
  startDate: string;
  endDate: string;
  location: string;
}) {
  const start = startDate || endDate;
  const end = endDate || startDate;

  if (!start || Number.isNaN(new Date(`${start}T00:00:00Z`).getTime())) {
    return null;
  }

  // 종일 일정은 마지막 날의 다음 날을 끝으로 넘겨야 마지막 날까지 표시된다
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toCalendarDate(start)}/${toCalendarDate(end, 1)}`,
  });

  if (location.trim()) {
    params.set("location", location.trim());
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
