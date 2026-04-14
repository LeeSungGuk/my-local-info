import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "src/content/posts");

export interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  content: string;
  region: string;
  sourceType: string;
  sourceId: string;
  sourceUrl: string;
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

function toPost(fileName: string): Post {
  const slug = fileName.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title || "",
    date: normalizeDate(data.date),
    summary: data.summary || "",
    category: data.category || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    content,
    region: typeof data.region === "string" ? data.region : "",
    sourceType: typeof data.sourceType === "string" ? data.sourceType : "",
    sourceId: typeof data.sourceId === "string" ? data.sourceId : "",
    sourceUrl: typeof data.sourceUrl === "string" ? data.sourceUrl : "",
    coverImage: typeof data.coverImage === "string" ? data.coverImage : "",
    coverAlt: typeof data.coverAlt === "string" ? data.coverAlt : "",
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
