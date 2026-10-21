import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { getVersionedBlogCoverUrl } from "./blog-cover-url.ts";
import { getAllPosts, getPostBySlug } from "./posts.ts";

function createFixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "blog-cover-url-"));
  const covers = path.join(directory, "blog-covers");
  fs.mkdirSync(covers);
  const file = path.join(covers, "sample.svg");
  fs.writeFileSync(file, "<svg>old cover</svg>");
  return { directory, covers, file };
}

test("cover URLs remain stable when only file timestamps change", (t) => {
  const { directory, file } = createFixture();
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const first = getVersionedBlogCoverUrl("/blog-covers/sample.svg", directory);
  fs.utimesSync(file, new Date("2020-01-01"), new Date("2020-01-01"));

  assert.match(first, /^\/blog-covers\/sample\.svg\?v=[a-f0-9]{12}$/);
  assert.equal(getVersionedBlogCoverUrl("/blog-covers/sample.svg", directory), first);
});

test("replacing a cover changes its URL even at the same size and timestamp", (t) => {
  const { directory, file } = createFixture();
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const first = getVersionedBlogCoverUrl("/blog-covers/sample.svg", directory);
  const before = fs.statSync(file);
  fs.writeFileSync(file, "<svg>new cover</svg>");
  fs.utimesSync(file, before.atime, before.mtime);

  assert.equal(fs.statSync(file).size, before.size);
  assert.notEqual(getVersionedBlogCoverUrl("/blog-covers/sample.svg", directory), first);
});

test("versioning preserves other query parameters and fragments without duplicating versions", (t) => {
  const { directory } = createFixture();
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const value = getVersionedBlogCoverUrl("/blog-covers/sample.svg?theme=cream&v=old&v=older#art", directory);
  const url = new URL(value, "https://example.test");
  assert.equal(url.pathname, "/blog-covers/sample.svg");
  assert.equal(url.searchParams.get("theme"), "cream");
  assert.equal(url.hash, "#art");
  assert.equal(url.searchParams.getAll("v").length, 1);
  assert.notEqual(url.searchParams.get("v"), "old");
  assert.equal(getVersionedBlogCoverUrl(value, directory), value);
});

test("external, custom, missing, and invalid image paths keep their original URLs", (t) => {
  const { directory } = createFixture();
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  for (const value of [
    "", "/custom/sample.svg", "https://example.test/blog-covers/sample.svg",
    "//example.test/blog-covers/sample.svg", "/blog-covers/missing.svg",
    "/blog-covers/../sample.svg", "/blog-covers/%2e%2e/sample.svg",
    "/blog-covers/nested/sample.svg", "/blog-covers/sample\\other.svg",
  ]) {
    assert.equal(getVersionedBlogCoverUrl(value, directory), value);
  }
  assert.equal(getVersionedBlogCoverUrl("/blog-covers/sample.svg", path.join(directory, "missing")), "/blog-covers/sample.svg");
});

test("versioning never follows a cover file or directory symlink", (t) => {
  const { directory, covers, file } = createFixture();
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const outside = path.join(directory, "outside.svg");
  fs.writeFileSync(outside, "private file");
  fs.unlinkSync(file);
  fs.symlinkSync(outside, file);
  assert.equal(getVersionedBlogCoverUrl("/blog-covers/sample.svg", directory), "/blog-covers/sample.svg");

  fs.rmSync(covers, { recursive: true });
  const outsideDirectory = path.join(directory, "outside");
  fs.mkdirSync(outsideDirectory);
  fs.writeFileSync(path.join(outsideDirectory, "sample.svg"), "private file");
  fs.symlinkSync(outsideDirectory, covers);
  assert.equal(getVersionedBlogCoverUrl("/blog-covers/sample.svg", directory), "/blog-covers/sample.svg");
});

test("list and detail loaders version both configured and fallback covers consistently", () => {
  const posts = getAllPosts();
  assert.ok(posts.length > 0);
  let fallbackCount = 0;

  for (const post of posts) {
    const markdown = fs.readFileSync(path.join(process.cwd(), "src/content/posts", `${post.slug}.md`), "utf8");
    if (!/^coverImage:/m.test(markdown)) fallbackCount += 1;
    assert.match(post.coverImage, /^\/blog-covers\/[A-Za-z0-9_-]+\.svg\?v=[a-f0-9]{12}$/);
    assert.equal(getPostBySlug(post.slug)?.coverImage, post.coverImage);
  }

  assert.ok(fallbackCount > 0, "the existing fallback cover must also be checked");
});
