import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDistrictMapEntries,
  getDistrictLinks,
  getMetricStep,
  SEOUL_DISTRICT_TILES,
  summarizeEventsByDistrict,
  type DistrictMapEntry,
  type DistrictMapEvent,
} from "./district-map.ts";
import { getFoodDistrictOverviews } from "./food.ts";

function makeEvent(overrides: Partial<DistrictMapEvent>): DistrictMapEvent {
  return {
    id: overrides.id ?? "event",
    title: overrides.title ?? "행사",
    district: overrides.district ?? "종로구",
    venue: overrides.venue ?? "장소",
    startDate: overrides.startDate ?? "2026-10-30",
    endDate: overrides.endDate ?? "2026-10-30",
    isFree: overrides.isFree ?? false,
  };
}

function makeEntry(overrides: Partial<DistrictMapEntry>): DistrictMapEntry {
  return {
    name: overrides.name ?? "종로구",
    row: overrides.row ?? 2,
    col: overrides.col ?? 3,
    guideSlug: overrides.guideSlug ?? null,
    benefitCount: overrides.benefitCount ?? 0,
    food: overrides.food ?? { href: "/districts/jongno/food", isExternal: false, placeCount: 12 },
  };
}

test("tile map fills a 5x5 square with every Seoul district food overview, one per cell", async () => {
  const overviews = await getFoodDistrictOverviews();
  const tileNames = SEOUL_DISTRICT_TILES.map((tile) => tile.name);
  const cells = SEOUL_DISTRICT_TILES.map((tile) => `${tile.row}:${tile.col}`);

  assert.equal(SEOUL_DISTRICT_TILES.length, 25);
  assert.deepEqual([...tileNames].sort(), overviews.map((overview) => overview.name).sort());
  assert.equal(new Set(cells).size, 25);
  for (const tile of SEOUL_DISTRICT_TILES) {
    assert.ok(tile.row >= 1 && tile.row <= 5, `${tile.name} row in range`);
    assert.ok(tile.col >= 1 && tile.col <= 5, `${tile.name} col in range`);
  }
});

test("tile map keeps the spec layout for corner districts", () => {
  const positionOf = (name: string) => {
    const tile = SEOUL_DISTRICT_TILES.find((candidate) => candidate.name === name);
    return tile ? [tile.row, tile.col] : null;
  };

  assert.deepEqual(positionOf("은평구"), [1, 1]);
  assert.deepEqual(positionOf("노원구"), [1, 5]);
  assert.deepEqual(positionOf("금천구"), [5, 1]);
  assert.deepEqual(positionOf("송파구"), [5, 5]);
  assert.deepEqual(positionOf("중구"), [3, 3]);
});

test("district entries count district benefits only and keep food links", () => {
  const entries = buildDistrictMapEntries({
    guides: [{ name: "종로구", slug: "jongno" }],
    benefits: [
      { district: "종로구" },
      { district: "종로구" },
      { district: "서울특별시" },
      { district: "관악구" },
    ],
    foodOverviews: SEOUL_DISTRICT_TILES.map((tile) => ({
      name: tile.name,
      href: tile.name === "종로구" ? "/districts/jongno/food" : `https://map.kakao.com/?q=${tile.name}`,
      linkType: tile.name === "종로구" ? ("guide" as const) : ("map" as const),
      placeCount: 12,
    })),
  });
  const byName = new Map(entries.map((entry) => [entry.name, entry]));

  assert.equal(entries.length, 25);
  assert.equal(byName.get("종로구")?.benefitCount, 2);
  assert.equal(byName.get("종로구")?.guideSlug, "jongno");
  assert.deepEqual(byName.get("종로구")?.food, { href: "/districts/jongno/food", isExternal: false, placeCount: 12 });
  assert.equal(byName.get("관악구")?.benefitCount, 1);
  assert.equal(byName.get("관악구")?.guideSlug, null);
  assert.equal(byName.get("관악구")?.food.isExternal, true);
  assert.equal(byName.get("강남구")?.benefitCount, 0);
});

test("district entries fail when a district has no food overview", () => {
  assert.throws(() =>
    buildDistrictMapEntries({ guides: [], benefits: [], foodOverviews: [] }),
  );
});

test("event summary counts visible, ongoing and free events per district for the given day", () => {
  const summaries = summarizeEventsByDistrict(
    [
      makeEvent({ id: "ended", startDate: "2026-10-01", endDate: "2026-10-29" }),
      makeEvent({ id: "ongoing-free", startDate: "2026-10-20", endDate: "2026-11-10", isFree: true }),
      makeEvent({ id: "today", startDate: "2026-10-30", endDate: "2026-10-30" }),
      makeEvent({ id: "upcoming-free", startDate: "2026-11-05", endDate: "2026-11-06", isFree: true }),
      makeEvent({ id: "mapo", district: "마포구", startDate: "2026-11-01", endDate: "2026-11-01" }),
    ],
    "2026-10-30",
  );

  assert.deepEqual(
    {
      visibleCount: summaries.get("종로구")?.visibleCount,
      ongoingCount: summaries.get("종로구")?.ongoingCount,
      freeCount: summaries.get("종로구")?.freeCount,
    },
    { visibleCount: 3, ongoingCount: 2, freeCount: 2 },
  );
  assert.equal(summaries.get("마포구")?.visibleCount, 1);
  assert.equal(summaries.get("마포구")?.ongoingCount, 0);
  assert.equal(summaries.get("관악구"), undefined);
});

test("featured events put ongoing events first, then upcoming by start date, at most three", () => {
  const summaries = summarizeEventsByDistrict(
    [
      makeEvent({ id: "upcoming-late", startDate: "2026-11-20", endDate: "2026-11-21" }),
      makeEvent({ id: "upcoming-soon", startDate: "2026-11-01", endDate: "2026-11-01" }),
      makeEvent({ id: "ongoing-recent", startDate: "2026-10-29", endDate: "2026-11-30" }),
      makeEvent({ id: "ongoing-old", startDate: "2026-09-01", endDate: "2026-12-31" }),
    ],
    "2026-10-30",
  );
  const featured = summaries.get("종로구")?.featured ?? [];

  assert.deepEqual(
    featured.map((event) => [event.id, event.isOngoing]),
    [
      ["ongoing-old", true],
      ["ongoing-recent", true],
      ["upcoming-soon", false],
    ],
  );
});

test("metric steps follow the spec ranges", () => {
  const steps = (metric: Parameters<typeof getMetricStep>[0], values: number[]) =>
    values.map((value) => getMetricStep(metric, value));

  assert.deepEqual(steps("benefits", [15, 24, 25, 34, 35, 44, 45, 59, 60, 108]), [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]);
  assert.deepEqual(steps("events", [0, 1, 2, 3, 4, 5, 7, 8, 11]), [0, 1, 1, 2, 2, 3, 3, 4, 4]);
  assert.deepEqual(steps("free", [0, 1, 2, 3, 4, 5, 6, 9]), [0, 1, 2, 2, 3, 3, 4, 4]);
});

test("guide districts link to their guide and filtered lists", () => {
  const links = getDistrictLinks(makeEntry({ name: "종로구", guideSlug: "jongno", benefitCount: 58 }), 11);

  assert.deepEqual(links.primary, { kind: "guide", href: "/districts/jongno" });
  assert.equal(links.events, `/events?district=${encodeURIComponent("종로구")}`);
  assert.equal(links.benefits, `/benefits?district=${encodeURIComponent("종로구")}`);
  assert.deepEqual(links.food, { href: "/districts/jongno/food", isExternal: false });
});

test("districts without a guide lead with the event list when they have events", () => {
  const links = getDistrictLinks(
    makeEntry({ name: "구로구", food: { href: "https://map.kakao.com/?q=구로구", isExternal: true, placeCount: 12 } }),
    5,
  );

  assert.deepEqual(links.primary, { kind: "events", href: `/events?district=${encodeURIComponent("구로구")}` });
  assert.equal(links.events, `/events?district=${encodeURIComponent("구로구")}`);
  assert.deepEqual(links.food, { href: "https://map.kakao.com/?q=구로구", isExternal: true });
});

test("districts without a guide or events lead with benefits and drop the event list link", () => {
  const links = getDistrictLinks(makeEntry({ name: "관악구" }), 0);

  assert.deepEqual(links.primary, { kind: "benefits", href: `/benefits?district=${encodeURIComponent("관악구")}` });
  assert.equal(links.events, null);
});
