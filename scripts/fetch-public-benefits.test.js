/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const test = require("node:test");

const {
  fetchPagedDataset,
  formatFetchError,
  resolvePublicBenefitsApiConfig,
} = require("./fetch-public-benefits.js");

test("supports keep-existing mode for temporary public benefits fetch failures", () => {
  const defaultConfig = resolvePublicBenefitsApiConfig({
    PUBLIC_DATA_API_KEY: "public-data-key",
  });
  const keepExistingConfig = resolvePublicBenefitsApiConfig({
    PUBLIC_DATA_API_KEY: "public-data-key",
    PUBLIC_BENEFITS_FETCH_FAILURE_MODE: "keep-existing",
  });
  const invalidModeConfig = resolvePublicBenefitsApiConfig({
    PUBLIC_DATA_API_KEY: "public-data-key",
    PUBLIC_BENEFITS_FETCH_FAILURE_MODE: "ignore-everything",
  });

  assert.equal(defaultConfig.apiKey, "public-data-key");
  assert.equal(defaultConfig.fetchFailureMode, "fail");
  assert.equal(defaultConfig.hasPublicDataApiKey, true);
  assert.equal(keepExistingConfig.fetchFailureMode, "keep-existing");
  assert.equal(invalidModeConfig.fetchFailureMode, "fail");
});

test("formats public benefits fetch error causes without logging request secrets", () => {
  const error = new TypeError("fetch failed");
  error.cause = {
    code: "ENOTFOUND",
    syscall: "getaddrinfo",
    hostname: "api.odcloud.kr",
  };

  const formatted = formatFetchError(error);

  assert.match(formatted, /fetch failed/);
  assert.match(formatted, /code=ENOTFOUND/);
  assert.match(formatted, /syscall=getaddrinfo/);
  assert.match(formatted, /host=api\.odcloud\.kr/);
  assert.doesNotMatch(formatted, /serviceKey|public-data-key/);
});

test("retries transient public benefits network failures", async () => {
  let callCount = 0;

  const payload = await fetchPagedDataset("serviceList", {
    apiKey: "public-data-key",
    pageSize: 1,
    retryBaseDelayMs: 0,
    retryCount: 1,
    sleepImpl: async () => {},
    onRetry: () => {},
    fetchImpl: async (url) => {
      callCount += 1;

      assert.equal(url.searchParams.get("serviceKey"), "public-data-key");

      if (callCount === 1) {
        const error = new TypeError("fetch failed");
        error.cause = {
          code: "ECONNRESET",
          syscall: "read",
          hostname: "api.odcloud.kr",
        };
        throw error;
      }

      return {
        ok: true,
        json: async () => ({
          totalCount: 1,
          data: [{ 서비스ID: "SVC-1" }],
        }),
      };
    },
  });

  assert.equal(callCount, 2);
  assert.equal(payload.totalCount, 1);
  assert.deepEqual(payload.rows, [{ 서비스ID: "SVC-1" }]);
});
