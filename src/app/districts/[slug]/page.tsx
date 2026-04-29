import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DistrictMiniBenefitCard from "@/components/districts/DistrictMiniBenefitCard";
import DistrictMiniEventCard from "@/components/districts/DistrictMiniEventCard";
import DistrictSourceNotice from "@/components/districts/DistrictSourceNotice";
import {
  getAllDistricts,
  getDistrictBySlug,
  getDistrictSlugs,
  type DistrictGuide,
} from "@/lib/districts";
import { filterVisibleEvents, getTodayInSeoul, sortEventsByStartDate } from "@/lib/event-visibility";
import { sortBenefits } from "@/lib/benefit-utils";
import { getAllPosts, type Post } from "@/lib/posts";
import { SITE_URL } from "@/lib/site-config";
import { getEventsIndex, type SeoulEventSummary } from "@/lib/seoul-events";
import { getBenefitsIndex, type PublicBenefitSummary } from "@/lib/public-benefits";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getDistrictSlugs().map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const district = getDistrictBySlug(slug);

  if (!district) {
    return {};
  }

  return {
    title: `${district.name} 가이드 | 서울시티`,
    description: `${district.name}의 주요 권역, 상황별 코스, 서울 행사와 공공 혜택을 한 페이지에서 확인하세요. ${district.summary}`,
    openGraph: {
      title: `${district.name} 가이드 | 서울시티`,
      description: district.summary,
      type: "website",
    },
  };
}

export default async function DistrictDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const district = getDistrictBySlug(slug);

  if (!district) {
    notFound();
  }

  const [eventsIndex, benefitsIndex, posts] = await Promise.all([
    getEventsIndex(),
    getBenefitsIndex(),
    Promise.resolve(getAllPosts()),
  ]);
  const today = getTodayInSeoul();
  const visibleEvents = sortEventsByStartDate(
    filterVisibleEvents(eventsIndex.items, today)
  );
  const districtEvents = visibleEvents
    .filter((event) => matchesDistrictEvent(district, event))
    .slice(0, 6);
  const freeEvents = districtEvents.filter((event) => event.isFree).slice(0, 3);
  const districtBenefits = sortBenefits(
    benefitsIndex.items.filter((benefit) => matchesDistrictBenefit(district, benefit))
  ).slice(0, 4);
  const relatedPosts = getRelatedPosts(district, posts);
  const otherDistricts = getAllDistricts()
    .filter((item) => item.slug !== district.slug)
    .slice(0, 4);
  const structuredData = getStructuredData(district);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_32%,#f8fbff_100%)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/districts"
          className="inline-flex min-h-11 items-center text-sm font-bold text-slate-500 transition-colors hover:text-sky-700"
        >
          <span aria-hidden="true" className="mr-1">
            ←
          </span>
          구별 가이드로 돌아가기
        </Link>

        <section className="mt-6 grid gap-8 rounded-3xl border border-sky-100 bg-white p-6 shadow-soft sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
              {district.name} 로컬 가이드
            </span>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              {district.headline}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              {district.editorialIntro}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {district.bestFor.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <HeroStat label="진행 예정 행사" value={`${districtEvents.length}건`} />
            <HeroStat label="무료 행사" value={`${freeEvents.length}건`} />
            <HeroStat label="연결 혜택" value={`${districtBenefits.length}건`} />
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
                  Live Events
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                  {district.name}에서 볼 만한 최신 행사
                </h2>
              </div>
              <Link
                href={`/events?district=${encodeURIComponent(district.name)}`}
                className="inline-flex min-h-11 items-center rounded-xl border border-sky-200 px-4 text-sm font-bold text-sky-700 transition-colors hover:bg-sky-50"
              >
                전체 행사에서 찾기
              </Link>
            </div>

            {districtEvents.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {districtEvents.map((event) => (
                  <DistrictMiniEventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="현재 연결된 구별 행사가 없습니다."
                text="서울 전체 행사 데이터가 갱신되면 이 영역도 함께 바뀝니다."
              />
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                Areas
              </p>
              <h2 className="mt-2 text-xl font-extrabold text-slate-950">
                함께 묶기 좋은 권역
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {district.nearbyAreas.map((area) => (
                  <Link
                    key={area}
                    href={`/search?q=${encodeURIComponent(`서울 ${area}`)}`}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                  >
                    {area}
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                Situations
              </p>
              <h2 className="mt-2 text-xl font-extrabold text-slate-950">
                상황별로 바로 보기
              </h2>
              <div className="mt-4 space-y-3">
                {district.recommendedSituations.map((situation) => (
                  <Link
                    key={situation.label}
                    href={situation.href}
                    className="block rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-sky-200 hover:bg-sky-50"
                  >
                    <p className="font-bold text-slate-950">{situation.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {situation.reason}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-600">
              Half-Day Routes
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
              반나절 코스 예시
            </h2>
            <div className="mt-6 space-y-4">
              {district.halfDayRoutes.map((route) => (
                <article
                  key={route.title}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5"
                >
                  <h3 className="font-bold text-slate-950">{route.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-emerald-700">
                    {route.stops.join(" → ")}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {route.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
                  Benefits
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                  서울 생활 혜택 같이 보기
                </h2>
              </div>
              <Link
                href="/benefits"
                className="inline-flex min-h-11 items-center rounded-xl border border-blue-200 px-4 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50"
              >
                전체 혜택 보기
              </Link>
            </div>

            {districtBenefits.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {districtBenefits.map((benefit) => (
                  <DistrictMiniBenefitCard key={benefit.id} benefit={benefit} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="현재 연결된 혜택이 없습니다."
                text="공공데이터포털 혜택 데이터가 갱신되면 이 영역도 함께 바뀝니다."
              />
            )}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-soft sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
              Articles
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
              같이 읽기 좋은 서울 정보글
            </h2>
            {relatedPosts.length > 0 ? (
              <div className="mt-6 grid gap-4">
                {relatedPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="rounded-2xl border border-sky-100 bg-sky-50/40 p-5 transition-colors hover:border-sky-200 hover:bg-sky-50"
                  >
                    <p className="text-xs font-bold text-sky-700">{post.category}</p>
                    <h3 className="mt-2 line-clamp-2 text-lg font-bold text-slate-950">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {post.summary}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="아직 직접 연결된 정보글이 없습니다."
                text="서울 동네별 정보글이 늘어나면 이 영역에 자동으로 연결됩니다."
              />
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
              <h2 className="text-xl font-extrabold text-slate-950">
                공식 확인 링크
              </h2>
              <div className="mt-4 space-y-3">
                {district.officialLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                  >
                    {link.label}
                    <span aria-hidden="true" className="ml-1">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </section>

            <DistrictSourceNotice
              eventCollectedAt={eventsIndex.source.collectedAt}
              benefitCollectedAt={benefitsIndex.source.collectedAt}
            />
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                More Districts
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                다른 구도 이어서 보기
              </h2>
            </div>
            <Link
              href="/districts"
              className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              전체 구 보기
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {otherDistricts.map((item) => (
              <Link
                key={item.slug}
                href={`/districts/${item.slug}`}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-sky-200 hover:bg-sky-50"
              >
                <p className="font-bold text-slate-950">{item.name}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                  {item.summary}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-slate-950">{value}</p>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <p className="font-bold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function matchesDistrictEvent(district: DistrictGuide, event: SeoulEventSummary) {
  const haystack = normalizeText(
    [event.district, event.venue, event.title, event.summary].join(" ")
  );
  return getDistrictTerms(district).some((term) => haystack.includes(term));
}

function matchesDistrictBenefit(district: DistrictGuide, benefit: PublicBenefitSummary) {
  const haystack = normalizeText(
    [
      benefit.district,
      benefit.provider,
      benefit.receptionAgency,
      benefit.title,
      benefit.summary,
      benefit.targetSummary,
      benefit.supportSummary,
    ].join(" ")
  );
  const districtMatch = getDistrictTerms(district).some((term) =>
    haystack.includes(term)
  );
  const cityWideMatch =
    haystack.includes("서울특별시") ||
    haystack.includes("서울시") ||
    haystack.includes("서울");

  return districtMatch || cityWideMatch;
}

function getRelatedPosts(district: DistrictGuide, posts: Post[]) {
  const terms = [
    ...getDistrictTerms(district),
    ...district.bestFor.map(normalizeText),
    ...district.keywords.map(normalizeText),
  ];

  return posts
    .filter((post) => {
      const haystack = normalizeText(
        [post.title, post.summary, post.category, ...post.tags].join(" ")
      );
      return terms.some((term) => haystack.includes(term));
    })
    .slice(0, 3);
}

function getDistrictTerms(district: DistrictGuide) {
  return [district.name, district.name.replace(/구$/, ""), ...district.nearbyAreas]
    .map(normalizeText)
    .filter(Boolean);
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

function getStructuredData(district: DistrictGuide) {
  const url = `${SITE_URL}/districts/${district.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: `${district.name} 가이드`,
        url,
        description: district.summary,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "홈",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "구별 가이드",
            item: `${SITE_URL}/districts`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: district.name,
            item: url,
          },
        ],
      },
    ],
  };
}
