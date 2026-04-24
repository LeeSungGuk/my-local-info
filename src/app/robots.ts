import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

const siteUrl = SITE_URL;
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
