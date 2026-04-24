import assert from "node:assert/strict";
import test from "node:test";
import { SITE_URL } from "./site-config.ts";

test("site url uses the production domain", () => {
  assert.equal(SITE_URL, "https://seoulcities.net");
});
