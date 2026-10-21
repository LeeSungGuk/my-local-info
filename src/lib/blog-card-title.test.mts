import assert from "node:assert/strict";
import test from "node:test";
import { getBlogCardTitle } from "./blog-card-title.ts";

test("cards use a short editorial title while the full article title stays intact", () => {
  const post = {
    sourceId: "seoul-vinyl-listening-bars",
    title: "턴테이블 위에서 퍼지는 감성, 음악에 온전히 몰입하는 서울 LP & 리스닝 바",
  };
  const original = post.title;
  assert.equal(getBlogCardTitle(post), "음악에 머무는 밤, 서울 LP바");
  assert.equal(post.title, original);
});

test("an explicit frontmatter cardTitle takes priority", () => {
  assert.equal(getBlogCardTitle({
    sourceId: "seoul-vinyl-listening-bars", title: "원래 글 제목", cardTitle: "  카드 전용 제목  ",
  }), "카드 전용 제목");
});

test("new posts fall back to their core Seoul phrase", () => {
  assert.equal(getBlogCardTitle({
    sourceId: "future-topic", title: "마음을 채우는 느긋한 오후, 서울 동네 책방 산책",
  }), "서울 동네 책방 산책");
  assert.equal(getBlogCardTitle({
    sourceId: "future-topic", title: "서울의 밤", cardTitle: "   ",
  }), "서울의 밤");
});

test("a long fallback is bounded and keeps a visible ellipsis", () => {
  const title = getBlogCardTitle({
    sourceId: "future-topic", title: "서울에서 따뜻한 차 한 잔과 함께 여유로운 시간을 보내기 좋은 조용한 한옥 공간을 만나는 하루",
  });
  assert.ok(Array.from(title).length <= 28);
  assert.ok(title.endsWith("…"));
});

test("unknown ids do not read inherited object keys", () => {
  assert.equal(getBlogCardTitle({ sourceId: "constructor", title: "서울 산책" }), "서울 산책");
});
