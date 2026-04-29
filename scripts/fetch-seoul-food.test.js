/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildFoodCollectionReport,
  extractDistrict,
  getFoodPlaceQualityScore,
  isActiveFoodPlace,
  limitFoodPlacesByDistrict,
  normalizeFoodPlace,
  resolveFoodApiConfig,
  sortFoodPlaces,
} = require("./fetch-seoul-food.js");

test("does not reuse the public data API key as a Seoul food API key", () => {
  const config = resolveFoodApiConfig({
    PUBLIC_DATA_API_KEY: "public-data-key",
  });

  assert.equal(config.apiKey, "");
  assert.equal(config.sampleMode, false);
  assert.equal(config.skipMode, false);
  assert.equal(config.hasSeoulOpenDataApiKey, false);
});

test("supports explicit sample and skip modes when the Seoul food API key is missing", () => {
  const sampleConfig = resolveFoodApiConfig({
    FOOD_DATA_MODE: "sample",
    PUBLIC_DATA_API_KEY: "public-data-key",
  });
  const skipConfig = resolveFoodApiConfig({
    FOOD_DATA_MODE: "skip",
    PUBLIC_DATA_API_KEY: "public-data-key",
  });

  assert.equal(sampleConfig.apiKey, "sample");
  assert.equal(sampleConfig.sampleMode, true);
  assert.equal(skipConfig.apiKey, "");
  assert.equal(skipConfig.skipMode, true);
});

test("normalizes an active Seoul Open Data food row", () => {
  const place = normalizeFoodPlace(
    {
      MGTNO: "3000000-101-2007-00202",
      APVPERMYMD: "2007-08-27              ",
      TRDSTATENM: "영업/정상",
      DTLSTATENM: "영업",
      SITETEL: "02-739-3345",
      SITEWHLADDR: "서울특별시 종로구 내수동 72 경희궁의아침3단지 지하115~119호",
      RDNWHLADDR: "서울특별시 종로구 사직로8길 34 (내수동,경희궁의아침3단지 지하115~119호)",
      BPLCNM: "플루토",
      LASTMODTS: "2022-10-04 17:42:47",
      UPDATEDT: "2026-01-14 14:27:38",
      UPTAENM: "경양식",
      X: "197465.223921125    ",
      Y: "452366.613899898    ",
      SNTUPTAENM: "경양식",
    },
    "2026-04-29T22:00:00.000Z"
  );

  assert.equal(place.id, "seoul-food-3000000-101-2007-00202");
  assert.equal(place.name, "플루토");
  assert.equal(place.district, "종로구");
  assert.equal(place.area, "내수동");
  assert.equal(place.category, "경양식");
  assert.equal(place.status, "영업");
  assert.equal(place.licenseDate, "2007-08-27");
  assert.equal(place.updatedAt, "2026-01-14");
  assert.equal(place.sourceLabel, "서울 열린데이터광장 일반음식점 인허가 정보");
  assert.equal(place.mapSearchQuery, "서울특별시 종로구 사직로8길 34");
});

test("detects active and closed food places", () => {
  assert.equal(isActiveFoodPlace({ status: "영업", name: "가게", district: "마포구" }), true);
  assert.equal(isActiveFoodPlace({ status: "폐업", name: "가게", district: "마포구" }), false);
  assert.equal(
    isActiveFoodPlace({ status: "영업", name: "가게", district: "마포구", closedDate: "2026-04-01" }),
    false
  );
  assert.equal(isActiveFoodPlace({ status: "영업", name: "", district: "마포구" }), false);
  assert.equal(isActiveFoodPlace({ status: "영업", name: "가게", district: "서울특별시" }), false);
});

test("extracts Seoul district names from addresses", () => {
  assert.equal(extractDistrict("서울특별시 영등포구 여의대방로 1"), "영등포구");
  assert.equal(extractDistrict("서울특별시 서대문구 연희로 1"), "서대문구");
  assert.equal(extractDistrict("주소 정보 없음"), "서울특별시");
});

test("scores stable dining candidates above temporary or unclear places", () => {
  const stableMeal = getFoodPlaceQualityScore({
    name: "연희면옥",
    category: "한식",
    district: "서대문구",
    area: "연희동",
    roadAddress: "서울특별시 서대문구 연희로 1",
  });
  const temporaryPlace = getFoodPlaceQualityScore({
    name: "바다앤장어 한시적영업",
    category: "기타",
    district: "강동구",
    area: "천호동",
    roadAddress: "서울특별시 강동구 천호대로 1 백화점 식품관",
  });

  assert.ok(stableMeal > temporaryPlace);
});

test("sorts food places by quality before freshness", () => {
  const sorted = [
    {
      id: "temporary",
      name: "그리시노(한시적)",
      category: "기타",
      district: "강남구",
      roadAddress: "서울특별시 강남구 압구정로 165, 현대백화점본점 지하1층 식품관",
      updatedAt: "2026-04-28",
      licenseDate: "2026-04-27",
    },
    {
      id: "stable",
      name: "연희면옥",
      category: "한식",
      district: "서대문구",
      area: "연희동",
      roadAddress: "서울특별시 서대문구 연희로 1",
      updatedAt: "2026-03-01",
      licenseDate: "2022-01-01",
    },
  ].sort(sortFoodPlaces);

  assert.deepEqual(
    sorted.map((place) => place.id),
    ["stable", "temporary"]
  );
});

test("limits places by district after sorting by quality", () => {
  const limited = limitFoodPlacesByDistrict(
    [
      {
        id: "a",
        district: "마포구",
        category: "기타",
        roadAddress: "서울특별시 마포구 월드컵로 1 백화점 식품관",
        updatedAt: "2026-04-01",
        licenseDate: "2026-04-01",
        name: "가 한시적영업",
      },
      {
        id: "b",
        district: "마포구",
        category: "한식",
        roadAddress: "서울특별시 마포구 월드컵로 2",
        updatedAt: "2026-03-01",
        licenseDate: "2024-01-01",
        name: "나",
      },
      {
        id: "c",
        district: "마포구",
        category: "중국식",
        roadAddress: "서울특별시 마포구 월드컵로 3",
        updatedAt: "2026-02-01",
        licenseDate: "2026-02-01",
        name: "다",
      },
      {
        id: "d",
        district: "종로구",
        category: "한식",
        roadAddress: "서울특별시 종로구 사직로 1",
        updatedAt: "2026-02-01",
        licenseDate: "2024-01-01",
        name: "라",
      },
    ],
    2
  );

  assert.deepEqual(
    limited.map((place) => place.id),
    ["b", "c", "d"]
  );
});

test("diversifies selected places by area within each district", () => {
  const limited = limitFoodPlacesByDistrict(
    [
      {
        id: "a",
        district: "마포구",
        area: "망원동",
        category: "한식",
        roadAddress: "서울특별시 마포구 월드컵로 1",
        updatedAt: "2026-04-05",
        licenseDate: "2026-04-05",
        name: "가",
      },
      {
        id: "b",
        district: "마포구",
        area: "망원동",
        category: "한식",
        roadAddress: "서울특별시 마포구 월드컵로 2",
        updatedAt: "2026-04-04",
        licenseDate: "2026-04-04",
        name: "나",
      },
      {
        id: "c",
        district: "마포구",
        area: "망원동",
        category: "한식",
        roadAddress: "서울특별시 마포구 월드컵로 3",
        updatedAt: "2026-04-03",
        licenseDate: "2026-04-03",
        name: "다",
      },
      {
        id: "d",
        district: "마포구",
        area: "망원동",
        category: "한식",
        roadAddress: "서울특별시 마포구 월드컵로 4",
        updatedAt: "2026-04-02",
        licenseDate: "2026-04-02",
        name: "라",
      },
      {
        id: "e",
        district: "마포구",
        area: "연남동",
        category: "중국식",
        roadAddress: "서울특별시 마포구 성미산로 1",
        updatedAt: "2026-04-01",
        licenseDate: "2026-04-01",
        name: "마",
      },
    ],
    4
  );

  assert.deepEqual(
    limited.map((place) => place.id),
    ["a", "b", "c", "e"]
  );
});

test("diversifies selected places by category within each district", () => {
  const limited = limitFoodPlacesByDistrict(
    [
      {
        id: "a",
        district: "강서구",
        area: "마곡동",
        category: "한식",
        roadAddress: "서울특별시 강서구 마곡중앙로 1",
        updatedAt: "2026-04-06",
        licenseDate: "2026-04-06",
        name: "가",
      },
      {
        id: "b",
        district: "강서구",
        area: "마곡동",
        category: "한식",
        roadAddress: "서울특별시 강서구 마곡중앙로 2",
        updatedAt: "2026-04-05",
        licenseDate: "2026-04-05",
        name: "나",
      },
      {
        id: "c",
        district: "강서구",
        area: "마곡동",
        category: "한식",
        roadAddress: "서울특별시 강서구 마곡중앙로 3",
        updatedAt: "2026-04-04",
        licenseDate: "2026-04-04",
        name: "다",
      },
      {
        id: "d",
        district: "강서구",
        area: "발산동",
        category: "한식",
        roadAddress: "서울특별시 강서구 강서로 1",
        updatedAt: "2026-04-03",
        licenseDate: "2026-04-03",
        name: "라",
      },
      {
        id: "e",
        district: "강서구",
        area: "화곡동",
        category: "한식",
        roadAddress: "서울특별시 강서구 화곡로 1",
        updatedAt: "2026-04-02",
        licenseDate: "2026-04-02",
        name: "마",
      },
      {
        id: "f",
        district: "강서구",
        area: "등촌동",
        category: "중국식",
        roadAddress: "서울특별시 강서구 등촌로 1",
        updatedAt: "2026-04-01",
        licenseDate: "2026-04-01",
        name: "바",
      },
    ],
    5
  );

  assert.deepEqual(
    limited.map((place) => place.id),
    ["a", "b", "c", "d", "f"]
  );
});

test("builds a collection report with quality, district, and change metrics", () => {
  const selectedPlaces = [
    {
      id: "stable-1",
      district: "마포구",
      area: "망원동",
      category: "한식",
      roadAddress: "서울특별시 마포구 월드컵로 1",
      name: "망원식당",
    },
    {
      id: "stable-2",
      district: "마포구",
      area: "연남동",
      category: "중국식",
      roadAddress: "서울특별시 마포구 성미산로 1",
      name: "연남반점",
    },
    {
      id: "temporary-1",
      district: "강동구",
      area: "천호동",
      category: "기타",
      roadAddress: "서울특별시 강동구 천호대로 1 백화점 식품관",
      name: "한시적영업 매장",
    },
  ];

  const report = buildFoodCollectionReport({
    collectedAt: "2026-04-29T22:00:00.000Z",
    availableCount: 10,
    fetchedCount: 9,
    activeCount: 5,
    selectedPlaces,
    existingItems: [{ id: "stable-1" }, { id: "removed-1" }],
    sampleMode: false,
    pageSize: 1000,
    maxPages: 0,
    maxPlacesPerDistrict: 12,
    maxPlacesPerArea: 3,
    maxPlacesPerCategory: 4,
  });

  assert.equal(report.source.selectedCount, 3);
  assert.deepEqual(report.changes, {
    previousSelectedCount: 2,
    addedCount: 2,
    removedCount: 1,
    unchangedCount: 1,
  });
  assert.equal(report.quality.temporarySignalCount, 1);
  assert.equal(report.quality.lowerPriorityCategoryCount, 1);
  assert.equal(report.districts.find((district) => district.name === "마포구")?.areaCount, 2);
  assert.equal(report.districts.find((district) => district.name === "마포구")?.categoryCount, 2);
});
