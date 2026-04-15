import assert from "node:assert/strict";
import test from "node:test";
import {
  getNormalizedAdSenseId,
  isAdSenseEnabled,
  shouldRenderAdSenseBanner,
  shouldRenderAdSenseScript,
} from "./adsense-config.ts";

test("adsense stays disabled by default even with a configured publisher id", () => {
  assert.equal(isAdSenseEnabled(undefined), false);
  assert.equal(isAdSenseEnabled(""), false);
  assert.equal(isAdSenseEnabled("false"), false);
  assert.equal(
    shouldRenderAdSenseScript({
      adSenseId: "ca-pub-4296656876262026",
      enabledFlag: undefined,
    }),
    false
  );
});

test("adsense enables only when the flag is explicitly true and id is valid", () => {
  assert.equal(isAdSenseEnabled("true"), true);
  assert.equal(
    shouldRenderAdSenseScript({
      adSenseId: "ca-pub-4296656876262026",
      enabledFlag: "true",
    }),
    true
  );
});

test("adsense banner requires the feature flag, a valid publisher id, and a valid slot", () => {
  assert.equal(
    shouldRenderAdSenseBanner({
      adSenseId: "ca-pub-4296656876262026",
      enabledFlag: "true",
      slot: "1234567890",
    }),
    true
  );
  assert.equal(
    shouldRenderAdSenseBanner({
      adSenseId: "ca-pub-4296656876262026",
      enabledFlag: undefined,
      slot: "1234567890",
    }),
    false
  );
  assert.equal(
    shouldRenderAdSenseBanner({
      adSenseId: "ca-pub-4296656876262026",
      enabledFlag: "true",
      slot: "나중에_입력",
    }),
    false
  );
});

test("normalization treats placeholders as empty values", () => {
  assert.equal(getNormalizedAdSenseId(" 나중에_입력 "), "");
  assert.equal(getNormalizedAdSenseId(" ca-pub-4296656876262026 "), "ca-pub-4296656876262026");
});
