import assert from "node:assert/strict";
import test from "node:test";
import {
  buildKakaoMapSearchUrl,
  getAllFoodIntents,
  getDistrictFoodHref,
  getFoodIntentsByDistrict,
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
