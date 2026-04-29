import assert from "node:assert/strict";
import test from "node:test";
import {
  buildKakaoMapSearchUrl,
  getAllFoodIntents,
  getAllFoodDistrictEditorials,
  getFoodDistrictOverviews,
  getDistrictFoodHref,
  getFoodDistrictEditorialBySlug,
  getFoodIntentsByDistrict,
  getFoodPlaceQualityScore,
} from "./food.ts";

test("builds no-key Kakao map search links", () => {
  assert.equal(
    buildKakaoMapSearchUrl("성동구 서울숲 식당"),
    "https://map.kakao.com/link/search/%EC%84%B1%EB%8F%99%EA%B5%AC%20%EC%84%9C%EC%9A%B8%EC%88%B2%20%EC%8B%9D%EB%8B%B9"
  );
});

test("returns food intents by district slug", () => {
  const mapoIntents = getFoodIntentsByDistrict("mapo");

  assert.equal(mapoIntents.length, 1);
  assert.equal(mapoIntents[0]?.districtName, "마포구");
});

test("getAllFoodIntents returns a copy", () => {
  const intents = getAllFoodIntents();
  intents.pop();

  assert.ok(getAllFoodIntents().length >= 10);
});

test("builds district food route href", () => {
  assert.equal(getDistrictFoodHref({ slug: "jongno" }), "/districts/jongno/food");
});

test("returns district food editorials for guided districts", () => {
  const editorials = getAllFoodDistrictEditorials();
  const jongnoEditorial = getFoodDistrictEditorialBySlug("jongno");

  assert.equal(editorials.length, 10);
  assert.equal(jongnoEditorial?.districtSlug, "jongno");
  assert.ok((jongnoEditorial?.description.length || 0) > 80);
  assert.ok((jongnoEditorial?.routeHints.length || 0) >= 3);
});

test("builds food district overviews for every Seoul district", async () => {
  const districts = await getFoodDistrictOverviews();

  assert.equal(districts.length, 25);
  assert.equal(districts.filter((district) => district.hasGuide).length, 10);

  const jongno = districts.find((district) => district.name === "종로구");
  assert.equal(jongno?.href, "/districts/jongno/food");
  assert.equal(jongno?.linkType, "guide");
  assert.ok((jongno?.editorialSummary?.length || 0) > 20);
  assert.ok((jongno?.placeCount || 0) > 0);

  const gangbuk = districts.find((district) => district.name === "강북구");
  assert.equal(gangbuk?.href, buildKakaoMapSearchUrl("강북구 음식점"));
  assert.equal(gangbuk?.linkType, "map");
  assert.ok((gangbuk?.placeCount || 0) > 0);
});

test("scores stable dining candidates above temporary or unclear food places", () => {
  const stableMeal = getFoodPlaceQualityScore({
    id: "stable",
    name: "연희면옥",
    district: "서대문구",
    area: "연희동",
    category: "한식",
    mainMenu: "한식",
    address: "",
    roadAddress: "서울특별시 서대문구 연희로 1",
    phone: "",
    status: "영업",
    licenseDate: "2022-01-01",
    sourceLabel: "서울 열린데이터광장 일반음식점 인허가 정보",
    sourceUrl: "https://data.seoul.go.kr/dataList/OA-16094/S/1/datasetView.do",
    collectedAt: "2026-04-29T00:00:00.000Z",
  });
  const temporaryPlace = getFoodPlaceQualityScore({
    id: "temporary",
    name: "바다앤장어 한시적영업",
    district: "강동구",
    area: "천호동",
    category: "기타",
    mainMenu: "기타",
    address: "",
    roadAddress: "서울특별시 강동구 천호대로 1 백화점 식품관",
    phone: "",
    status: "영업",
    licenseDate: "2026-04-27",
    sourceLabel: "서울 열린데이터광장 일반음식점 인허가 정보",
    sourceUrl: "https://data.seoul.go.kr/dataList/OA-16094/S/1/datasetView.do",
    collectedAt: "2026-04-29T00:00:00.000Z",
  });

  assert.ok(stableMeal > temporaryPlace);
});
