import type { MetadataRoute } from "next";
import { getAllSituations } from "@/lib/situations";
import { getAllPosts } from "@/lib/posts";

const siteUrl = "https://my-local-info-6ny.pages.dev";
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

  const blogRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.date || new Date(),
  }));

  return [...staticRoutes, ...situationRoutes, ...blogRoutes];
}
