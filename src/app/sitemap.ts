import type { MetadataRoute } from "next";
import { getAllDistricts } from "@/lib/districts";
import { getAllSituations } from "@/lib/situations";
import { getAllPosts } from "@/lib/posts";
import { getBenefitsIndex } from "@/lib/public-benefits";
import { getEventById, getEventsIndex } from "@/lib/seoul-events";
import { SITE_URL } from "@/lib/site-config";

export const dynamic = "force-static";

interface SitemapPage {
  path: string;
  lastModified?: string;
}

// next.config.ts의 trailingSlash: true와 같은 주소여야 308 없이 canonical과 일치한다
function toSitemapEntry({ path, lastModified }: SitemapPage): MetadataRoute.Sitemap[number] {
  const url = `${SITE_URL}${path.endsWith("/") ? path : `${path}/`}`;
  return lastModified ? { url, lastModified } : { url };
}

function getLatestDate(values: Array<string | undefined>) {
  return values.filter((value): value is string => Boolean(value)).sort().at(-1);
}

// lastmod는 실제 콘텐츠 날짜만 쓰고, 근거 날짜가 없는 페이지는 생략한다.
// 혜택 상세는 공공데이터 원문 위주라 noindex로 두고 사이트맵에서 뺀다 (docs/works/seo_indexing_fixes/plan.md).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [eventsIndex, benefitsIndex] = await Promise.all([
    getEventsIndex(),
    getBenefitsIndex(),
  ]);
  const posts = getAllPosts();
  const events = await Promise.all(
    eventsIndex.items.map(async (event) => ({
      id: event.id,
      registeredAt: (await getEventById(event.id))?.registeredAt,
    })),
  );

  const blogLastModified = getLatestDate(posts.map((post) => post.updatedAt || post.date));
  const eventsLastModified = getLatestDate(events.map((event) => event.registeredAt));
  const benefitsLastModified = getLatestDate(
    benefitsIndex.items.map((benefit) => benefit.updatedAt || benefit.registeredAt),
  );

  const pages: SitemapPage[] = [
    {
      path: "/",
      lastModified: getLatestDate([blogLastModified, eventsLastModified, benefitsLastModified]),
    },
    { path: "/blog", lastModified: blogLastModified },
    { path: "/events", lastModified: eventsLastModified },
    { path: "/benefits", lastModified: benefitsLastModified },
    { path: "/districts" },
    { path: "/food" },
    ...getAllDistricts().map((district) => ({ path: `/districts/${district.slug}` })),
    ...getAllDistricts().map((district) => ({ path: `/districts/${district.slug}/food` })),
    ...getAllSituations().map((situation) => ({ path: situation.href })),
    ...events.map((event) => ({
      path: `/events/${event.id}`,
      lastModified: event.registeredAt,
    })),
    ...posts.map((post) => ({
      path: `/blog/${post.slug}`,
      lastModified: post.updatedAt || post.date,
    })),
  ];

  return pages.map(toSitemapEntry);
}
