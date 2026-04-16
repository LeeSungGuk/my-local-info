import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "src/content/posts");
const publicDirectory = path.join(process.cwd(), "public");

export interface Post {
  slug: string;
  title: string;
  date: string;
  updatedAt: string;
  summary: string;
  category: string;
  tags: string[];
  content: string;
  region: string;
  sourceType: string;
  sourceId: string;
  sourceUrl: string;
  sourceNote: string;
  coverImage: string;
  coverAlt: string;
}

function normalizeDate(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

function getGeneratedCoverImage(sourceId: string) {
  const normalized = sourceId.trim();

  if (!/^[A-Za-z0-9_-]+$/.test(normalized)) {
    return "";
  }

  const filePath = path.join(publicDirectory, "blog-covers", `${normalized}.svg`);
  return fs.existsSync(filePath) ? `/blog-covers/${normalized}.svg` : "";
}

function toPost(fileName: string): Post {
  const slug = fileName.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const title = typeof data.title === "string" ? data.title : "";
  const sourceId = typeof data.sourceId === "string" ? data.sourceId : "";
  const configuredCoverImage = typeof data.coverImage === "string" ? data.coverImage : "";
  const generatedCoverImage = configuredCoverImage ? "" : getGeneratedCoverImage(sourceId);

  return {
    slug,
    title,
    date: normalizeDate(data.date),
    updatedAt: normalizeDate(data.updatedAt) || normalizeDate(data.date),
    summary: data.summary || "",
    category: data.category || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    content,
    region: typeof data.region === "string" ? data.region : "",
    sourceType: typeof data.sourceType === "string" ? data.sourceType : "",
    sourceId,
    sourceUrl: typeof data.sourceUrl === "string" ? data.sourceUrl : "",
    sourceNote: typeof data.sourceNote === "string" ? data.sourceNote : "",
    coverImage: configuredCoverImage || generatedCoverImage,
    coverAlt:
      typeof data.coverAlt === "string"
        ? data.coverAlt
        : generatedCoverImage
          ? `${title || sourceId}을 보여주는 서울 정보글 커버 이미지`
          : "",
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map(toPost)
    .filter((post) => post.region === "서울" && post.sourceType === "정보글");

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) return null;
    const post = toPost(`${slug}.md`);
    return post.region === "서울" && post.sourceType === "정보글" ? post : null;
  } catch {
    return null;
  }
}
