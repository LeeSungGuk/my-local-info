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
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      let dateStr = "";
      if (data.date instanceof Date) {
        dateStr = data.date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else if (typeof data.date === "string") {
        dateStr = data.date;
      }

      return {
        slug,
        title: data.title || "",
        date: dateStr,
        summary: data.summary || "",
        category: data.category || "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        content,
      };
    });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) return null;

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    let dateStr = "";
    if (data.date instanceof Date) {
      dateStr = data.date.toISOString().split("T")[0];
    } else if (typeof data.date === "string") {
      dateStr = data.date;
    }

    return {
      slug,
      title: data.title || "",
      date: dateStr,
      summary: data.summary || "",
      category: data.category || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      content,
    };
  } catch (error) {
    return null;
  }
}
