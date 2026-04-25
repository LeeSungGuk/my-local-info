/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT_DIR = path.join(__dirname, "..");
const POSTS_DIR = path.join(ROOT_DIR, "src", "content", "posts");
const SEARCH_INDEX_PATH = path.join(ROOT_DIR, "public", "data", "search-index.json");

function stripMarkdown(value) {
  return String(value || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[\s>*-]*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[*_~>#|]/g, "")
    .replace(/-{3,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMarkdownFiles() {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(POSTS_DIR)
    .filter((fileName) => fileName.endsWith(".md"))
    .sort();
}

function buildSearchIndex() {
  return getMarkdownFiles().map((fileName) => {
    const filePath = path.join(POSTS_DIR, fileName);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);
    const slug = fileName.replace(/\.md$/, "");

    return {
      slug,
      title: stripMarkdown(data.title),
      summary: stripMarkdown(data.summary),
      content: stripMarkdown(content).slice(0, 500),
    };
  });
}

function main() {
  const searchIndex = buildSearchIndex();

  fs.mkdirSync(path.dirname(SEARCH_INDEX_PATH), { recursive: true });
  fs.writeFileSync(
    SEARCH_INDEX_PATH,
    `${JSON.stringify(searchIndex, null, 2)}\n`,
    "utf8",
  );

  console.log(`Search index built: ${searchIndex.length} entries`);
}

main();
