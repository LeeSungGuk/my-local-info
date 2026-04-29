import type { MetadataRoute } from "next";
import { getAllDistricts } from "@/lib/districts";
import { getAllSituations } from "@/lib/situations";
import { getAllPosts } from "@/lib/posts";
import { getBenefitsIndex } from "@/lib/public-benefits";
import { getEventsIndex } from "@/lib/seoul-events";
import { SITE_URL } from "@/lib/site-config";

const siteUrl = SITE_URL;
export const dynamic = "force-static";

function getLatestLastModified(values: Array<string | Date | undefined>) {
  return (
    values
      .map((value) => {
        if (value instanceof Date) {
          return value.toISOString();
        }

        return value || "";
      })
      .filter(Boolean)
      .sort()
      .at(-1) || new Date().toISOString()
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [eventsIndex, benefitsIndex] = await Promise.all([
    getEventsIndex(),
    getBenefitsIndex(),
  ]);
  const posts = getAllPosts();
  const siteLastModified = getLatestLastModified([
    eventsIndex.source.collectedAt,
    benefitsIndex.source.collectedAt,
    ...posts.map((post) => post.updatedAt || post.date),
  ]);
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: siteLastModified,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: siteLastModified,
    },
    {
      url: `${siteUrl}/events`,
      lastModified: eventsIndex.source.collectedAt || siteLastModified,
    },
    {
      url: `${siteUrl}/benefits`,
      lastModified: benefitsIndex.source.collectedAt || siteLastModified,
    },
    {
      url: `${siteUrl}/districts`,
      lastModified: siteLastModified,
    },
    {
      url: `${siteUrl}/food`,
      lastModified: siteLastModified,
    },
  ];
  const districtRoutes: MetadataRoute.Sitemap = getAllDistricts().map((district) => ({
    url: `${siteUrl}/districts/${district.slug}`,
    lastModified: siteLastModified,
  }));
  const districtFoodRoutes: MetadataRoute.Sitemap = getAllDistricts().map((district) => ({
    url: `${siteUrl}/districts/${district.slug}/food`,
    lastModified: siteLastModified,
  }));

  const situationRoutes: MetadataRoute.Sitemap = getAllSituations().map((situation) => ({
    url: `${siteUrl}${situation.href}`,
    lastModified: siteLastModified,
  }));

  const eventRoutes: MetadataRoute.Sitemap = eventsIndex.items.map((event) => ({
    url: `${siteUrl}/events/${event.id}`,
    lastModified: eventsIndex.source.collectedAt || event.startDate || siteLastModified,
  }));

  const benefitRoutes: MetadataRoute.Sitemap = benefitsIndex.items.map((benefit) => ({
    url: `${siteUrl}/benefits/${benefit.id}`,
    lastModified:
      benefit.updatedAt ||
      benefit.registeredAt ||
      benefitsIndex.source.collectedAt ||
      siteLastModified,
  }));

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.date || siteLastModified,
  }));

  return [
    ...staticRoutes,
    ...districtRoutes,
    ...districtFoodRoutes,
    ...situationRoutes,
    ...eventRoutes,
    ...benefitRoutes,
    ...blogRoutes,
  ];
}
