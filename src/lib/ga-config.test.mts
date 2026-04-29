import assert from "node:assert/strict";
import test from "node:test";
import {
  getNormalizedGaId,
  shouldRenderGaScript,
} from "./ga-config.ts";

test("ga script stays disabled when the id is empty or a placeholder", () => {
  assert.equal(getNormalizedGaId(undefined), "");
  assert.equal(getNormalizedGaId(""), "");
  assert.equal(getNormalizedGaId(" 나중에_입력 "), "");
  assert.equal(shouldRenderGaScript(undefined), false);
  assert.equal(shouldRenderGaScript(""), false);
  assert.equal(shouldRenderGaScript("나중에_입력"), false);
});

test("ga script renders when a GA4 measurement id is configured", () => {
  assert.equal(getNormalizedGaId(" G-ABC123XYZ "), "G-ABC123XYZ");
  assert.equal(shouldRenderGaScript("G-ABC123XYZ"), true);
});
