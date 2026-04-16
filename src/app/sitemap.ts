import fs from "fs";
import path from "path";
import type { MetadataRoute } from "next";
import { getAllSituations } from "@/lib/situations";

const siteUrl = "https://my-local-info-6ny.pages.dev";
const postsDirectory = path.join(process.cwd(), "src/content/posts");
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
    },
  ];
  const situationRoutes: MetadataRoute.Sitemap = getAllSituations().map((situation) => ({
    url: `${siteUrl}${situation.href}`,
    lastModified: new Date(),
  }));

  if (!fs.existsSync(postsDirectory)) {
    return [...staticRoutes, ...situationRoutes];
  }

  const blogRoutes: MetadataRoute.Sitemap = fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const fullPath = path.join(postsDirectory, fileName);
      const stats = fs.statSync(fullPath);
      const slug = fileName.replace(/\.md$/, "");

      return {
        url: `${siteUrl}/blog/${slug}`,
        lastModified: stats.mtime,
      };
    });

  return [...staticRoutes, ...situationRoutes, ...blogRoutes];
}
