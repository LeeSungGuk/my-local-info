import Link from "next/link";
import Script from "next/script";
import AdBanner from "@/components/AdBanner";
import HomeSituationSection from "@/components/HomeSituationSection";
import HomeRecommendedPostsSection from "@/components/HomeRecommendedPostsSection";
import HomeEventsSection from "@/components/HomeEventsSection";
import HomeBenefitsSection from "@/components/HomeBenefitsSection";
import HomeSeoulSummary from "@/components/HomeSeoulSummary";
import HomeHero from "@/components/HomeHero";
import HomeDistrictMapSection from "@/components/HomeDistrictMapSection";
import { getAllPosts } from "@/lib/posts";
import { getAllDistricts } from "@/lib/districts";
import { buildDistrictMapEntries } from "@/lib/district-map";
import { getFoodDistrictOverviews } from "@/lib/food";
import { getAllSituations } from "@/lib/situations";
import { getBenefitsIndex, getAllBenefits } from "@/lib/public-benefits";
import { getAllEvents, getEventsIndex } from "@/lib/seoul-events";
import { getHomeSummaryMetrics } from "@/lib/home-summary";
import { filterVisibleEvents, getTodayInSeoul, sortEventsByStartDate } from "@/lib/event-visibility";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_URL } from "@/lib/site-config";

const siteUrl = SITE_URL;
const homeAdSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME?.trim() ?? "";

export default async function Home() {
  const [allEvents, allBenefits, eventsIndex, benefitsIndex, allPosts, foodOverviews] = await Promise.all([
    getAllEvents(),
    getAllBenefits(),
    getEventsIndex(),
    getBenefitsIndex(),
    Promise.resolve(getAllPosts()),
    getFoodDistrictOverviews(),
  ]);
  const districtMapEntries = buildDistrictMapEntries({
    guides: getAllDistricts(),
    benefits: allBenefits,
    foodOverviews,
  });
  const districtMapEvents = allEvents.map(({ id, title, district, venue, startDate, endDate, isFree }) => ({
    id,
    title,
    district,
    venue,
    startDate,
    endDate,
    isFree,
  }));
  const featuredEvents = sortEventsByStartDate(
    filterVisibleEvents(allEvents, getTodayInSeoul())
  ).slice(0, 6);
  const featuredBenefits = allBenefits.slice(0, 4);
  const summary = getHomeSummaryMetrics(allEvents, allBenefits);
  const situations = getAllSituations();
  const recommendedPosts = allPosts.slice(0, 3);
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      ...featuredEvents.map((event) => ({
        "@type": "Event",
        name: event.title,
        startDate: event.startDate,
        endDate: event.endDate || event.startDate,
        description: event.summary,
        url: `${siteUrl}/events/${event.id}`,
        location: {
          "@type": "Place",
          name: event.venue,
          address: {
            "@type": "PostalAddress",
            addressLocality: event.district,
            addressRegion: "서울특별시",
            addressCountry: "KR",
          },
        },
      })),
      ...featuredBenefits.map((benefit) => ({
        "@type": "GovernmentService",
        name: benefit.title,
        description: benefit.summary,
        url: `${siteUrl}/benefits/${benefit.id}`,
        provider: {
          "@type": "GovernmentOrganization",
          name: benefit.provider,
        },
      })),
    ],
  };

  return (
    <>
      <HomeHero situations={situations} />

      <HomeSituationSection situations={situations} />

      <HomeDistrictMapSection
        entries={districtMapEntries}
        events={districtMapEvents}
        totalBenefitCount={allBenefits.length}
        seoulWideBenefitCount={allBenefits.filter((benefit) => benefit.district === "서울특별시").length}
      />

      <HomeRecommendedPostsSection posts={recommendedPosts} />

      <HomeSeoulSummary summary={summary} />

      <section className="home-section">
        <div className="home-section-top">
          <div>
            <p className="eyebrow">WHAT’S ON IN SEOUL</p>
            <h2 className="section-heading">
              서울시 행사·축제
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
              서울 열린데이터광장의 서울시 문화행사 정보를 기준으로 보여드립니다.
            </p>
          </div>
          <Link
            href="/events"
            className="section-link hidden sm:inline-flex"
          >
            전체 행사 보기 <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <HomeEventsSection events={allEvents} />

        <div className="mt-6 sm:hidden">
          <Link
            href="/events"
            className="inline-flex min-h-11 items-center rounded-full border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100"
          >
            전체 행사 보기 <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 sm:pb-6">
        <AdBanner slot={homeAdSlot} />
      </section>

      <section className="border-t border-slate-200/70">
        <div className="home-section">
          <div className="home-section-top">
            <div>
              <p className="eyebrow">A LITTLE HELP FOR YOUR DAY</p>
              <h2 className="section-heading">
                놓치면 아쉬운 혜택
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                공공데이터포털 기준으로 서울 혜택 정보를 확인하세요
              </p>
            </div>
            <Link
              href="/benefits"
              className="section-link hidden sm:inline-flex"
            >
              전체 혜택 보기 <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <HomeBenefitsSection benefits={featuredBenefits} />

          <div className="mt-6 sm:hidden">
            <Link
              href="/benefits"
              className="inline-flex min-h-11 items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 text-sm font-semibold text-cyan-700 transition-colors hover:bg-cyan-100"
            >
              전체 혜택 보기 <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/70 py-10">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="mb-2 text-sm text-gray-500">
            행사 데이터는 서울 열린데이터광장{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-sky-700">서울시 문화행사 정보</code>,
            혜택 데이터는 공공데이터포털{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-cyan-700">대한민국 공공서비스(혜택) 정보</code>
            를 사용합니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              행사 수집 시각: {eventsIndex.source.collectedAt || "아직 수집되지 않음"}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              혜택 수집 시각: {benefitsIndex.source.collectedAt || "아직 수집되지 않음"}
            </div>
          </div>
        </div>
      </section>
      <Script
        id="home-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(homeStructuredData) }}
      />
    </>
  );
}
