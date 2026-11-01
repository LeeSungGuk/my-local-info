import assert from "node:assert/strict";
import test from "node:test";
import { buildGoogleCalendarUrl, formatKstDateTime, isMeaningfulFactValue } from "./detail-facts.ts";

test("hides empty, placeholder, and 기타 fact values", () => {
  assert.equal(isMeaningfulFactValue(""), false);
  assert.equal(isMeaningfulFactValue("  "), false);
  assert.equal(isMeaningfulFactValue(undefined), false);
  assert.equal(isMeaningfulFactValue("기타"), false);
  assert.equal(isMeaningfulFactValue("접수기관 정보 없음"), false);
  assert.equal(isMeaningfulFactValue("운영 시간 정보 없음"), false);
  assert.equal(isMeaningfulFactValue("홈페이지 참고"), true);
  assert.equal(isMeaningfulFactValue("마포구청 문화체육과"), true);
});

test("formats collected timestamps in Seoul time for people", () => {
  assert.equal(formatKstDateTime("2026-11-01T01:23:39.411Z"), "2026년 11월 1일 10:23");
  assert.equal(formatKstDateTime("2026-10-31T15:05:00Z"), "2026년 11월 1일 00:05");
  assert.equal(formatKstDateTime(""), "");
  assert.equal(formatKstDateTime("not a date"), "not a date");
});

test("builds an all-day Google Calendar link that ends the day after the last date", () => {
  const url = new URL(
    buildGoogleCalendarUrl({
      title: "서울 가을 음악회",
      startDate: "2026-11-07",
      endDate: "2026-11-08",
      location: "마포아트센터",
    }) ?? ""
  );

  assert.equal(url.origin + url.pathname, "https://calendar.google.com/calendar/render");
  assert.equal(url.searchParams.get("action"), "TEMPLATE");
  assert.equal(url.searchParams.get("text"), "서울 가을 음악회");
  assert.equal(url.searchParams.get("dates"), "20261107/20261109");
  assert.equal(url.searchParams.get("location"), "마포아트센터");
});

test("uses the start date when the end date is missing and skips events without dates", () => {
  const url = new URL(buildGoogleCalendarUrl({ title: "행사", startDate: "2026-12-31", endDate: "", location: "" }) ?? "");

  assert.equal(url.searchParams.get("dates"), "20261231/20270101");
  assert.equal(url.searchParams.has("location"), false);
  assert.equal(buildGoogleCalendarUrl({ title: "행사", startDate: "", endDate: "", location: "" }), null);
});
