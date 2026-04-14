import type { MetadataRoute } from "next";

const siteUrl = "https://my-local-info-6ny.pages.dev";
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
