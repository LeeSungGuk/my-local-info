import assert from "node:assert/strict";
import test from "node:test";
import { serializeJsonLd } from "./json-ld.ts";

test("json-ld serialization never emits a closing script tag", () => {
  const output = serializeJsonLd({
    name: "</script><script>alert(1)</script>",
  });

  assert.equal(output.includes("<"), false);
  assert.equal(output.toLowerCase().includes("</script"), false);
});

test("json-ld serialization round-trips to the original data", () => {
  const data = {
    "@type": "Article",
    headline: "a < b </script> & 한글 제목",
    tags: ["서울", "<b>bold</b>"],
  };

  assert.deepEqual(JSON.parse(serializeJsonLd(data)), data);
});
