/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const test = require("node:test");

const {
  detectIsFree,
  normalizeEvent,
  parseEventsPayload,
  parseSeoulOpenApiErrorText,
  resolveEventsApiConfig,
} = require("./fetch-seoul-events.js");

test("does not reuse the public data API key as a Seoul events API key", () => {
  const config = resolveEventsApiConfig({
    PUBLIC_DATA_API_KEY: "public-data-key",
  });

  assert.equal(config.apiKey, "");
  assert.equal(config.fetchFailureMode, "fail");
  assert.equal(config.sampleMode, false);
  assert.equal(config.skipMode, false);
  assert.equal(config.hasSeoulOpenDataApiKey, false);
});

test("supports explicit sample and skip modes for Seoul events", () => {
  const sampleConfig = resolveEventsApiConfig({
    EVENTS_DATA_MODE: "sample",
    PUBLIC_DATA_API_KEY: "public-data-key",
  });
  const skipConfig = resolveEventsApiConfig({
    EVENTS_DATA_MODE: "skip",
    PUBLIC_DATA_API_KEY: "public-data-key",
  });
  const keepExistingConfig = resolveEventsApiConfig({
    SEOUL_OPEN_DATA_API_KEY: "seoul-open-data-key",
    EVENTS_FETCH_FAILURE_MODE: "keep-existing",
  });

  assert.equal(sampleConfig.apiKey, "sample");
  assert.equal(sampleConfig.sampleMode, true);
  assert.equal(skipConfig.apiKey, "");
  assert.equal(skipConfig.skipMode, true);
  assert.equal(keepExistingConfig.fetchFailureMode, "keep-existing");
});

test("extracts Seoul Open API XML error details", () => {
  const parsed = parseSeoulOpenApiErrorText(
    "<RESULT><CODE>INFO-100</CODE><MESSAGE><![CDATA[인증키가 유효하지 않습니다.]]></MESSAGE></RESULT>"
  );

  assert.equal(parsed.code, "INFO-100");
  assert.equal(parsed.message, "인증키가 유효하지 않습니다.");
});

test("parseEventsPayload rejects XML Open API errors with actionable messages", () => {
  assert.throws(
    () =>
      parseEventsPayload(
        "<RESULT><CODE>INFO-100</CODE><MESSAGE><![CDATA[인증키가 유효하지 않습니다.]]></MESSAGE></RESULT>"
      ),
    /서울 Open API 응답 오류: INFO-100 인증키가 유효하지 않습니다./
  );
});

test("normalizes a Seoul cultural event row", () => {
  const event = normalizeEvent(
    {
      CODENAME: "전시/미술",
      GUNAME: "강남구",
      TITLE: "2026 핸드아티코리아",
      DATE: "2026-08-13~2026-08-16",
      PLACE: "코엑스전시장 B홀",
      ORG_NAME: "기타",
      USE_TRGT: "누구나",
      USE_FEE: "정가 15,000원",
      INQUIRY: "02-6121-6233",
      MAIN_IMG: "https://culture.seoul.go.kr/image.jpg",
      STRTDATE: "2026-08-13 00:00:00",
      END_DATE: "2026-08-16 00:00:00",
      HMPG_ADDR: "https://culture.seoul.go.kr/culture/culture/cultureEvent/view.do?cultcode=158000",
      PRO_TIME: "10:00~18:00",
      LAT: "37.511",
      LOT: "127.059",
    },
    "2026-05-12T00:00:00.000Z"
  );

  assert.equal(event.id, "seoul-event-158000");
  assert.equal(event.sourceId, "158000");
  assert.equal(event.title, "2026 핸드아티코리아");
  assert.equal(event.district, "강남구");
  assert.equal(event.startDate, "2026-08-13");
  assert.equal(event.endDate, "2026-08-16");
  assert.equal(event.isFree, false);
  assert.equal(event.latitude, 37.511);
  assert.equal(event.longitude, 127.059);
});

test("detects paid event fee text even when the source flag says free", () => {
  assert.equal(detectIsFree({ IS_FREE: "무료", USE_FEE: "정가 15,000원" }), false);
  assert.equal(detectIsFree({ IS_FREE: "", USE_FEE: "무료" }), true);
});
