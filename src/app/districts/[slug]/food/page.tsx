import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FoodGuideCover from "@/components/design/FoodGuideCover";
import FoodIntentCard from "@/components/food/FoodIntentCard";
import FoodPlaceCard from "@/components/food/FoodPlaceCard";
import FoodSourceNotice from "@/components/food/FoodSourceNotice";
import {
  getAllDistricts,
  getDistrictBySlug,
  getDistrictSlugs,
} from "@/lib/districts";
import {
  getFoodDistrictEditorialBySlug,
  getFoodIndex,
  getFoodIntentsByDistrict,
  getFoodPlacesByDistrictSlug,
} from "@/lib/food";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getDistrictSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const district = getDistrictBySlug(slug);

  if (!district) {
    return {};
  }

  return {
    title: `${district.name} 먹거리 가이드 | 서울시티`,
    description: `${district.name} 나들이 동선에 맞는 식사 권역과 카카오맵 검색 링크를 확인하세요.`,
  };
}

export default async function DistrictFoodPage({ params }: PageProps) {
  const { slug } = await params;
  const district = getDistrictBySlug(slug);

  if (!district) {
    notFound();
  }

  const intents = getFoodIntentsByDistrict(slug);
  const editorial = getFoodDistrictEditorialBySlug(slug);
  const foodIndex = await getFoodIndex();
  const places = await getFoodPlacesByDistrictSlug(slug);
  const otherDistricts = getAllDistricts()
    .filter((item) => item.slug !== district.slug)
    .slice(0, 4);

  return (
    <div className="site-page min-h-screen">
      <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-6">
        <nav aria-label="먹거리 가이드 탐색" className="flex flex-wrap items-center gap-x-5">
          <Link href="/food" className="section-link"><span aria-hidden="true">←</span> 전체 먹거리 가이드</Link>
          <Link href={`/districts/${district.slug}`} className="section-link">{district.name} 나들이 가이드 <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>

      <section className="food-district-hero" aria-labelledby="district-food-title">
        <div>
          <p className="eyebrow">Seoul table · {district.name}</p>
          <h1 id="district-food-title" className="food-district-title">
            {district.name}에서,<br /><span className="hero-gradient">산책과 한 끼.</span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-8 text-slate-600 sm:text-base">{district.summary}</p>
          <p className="mt-2 max-w-xl text-sm leading-8 text-slate-500">
            나들이 동선에 맞는 식사 권역을 살펴보고,{" "}<br className="hidden sm:block" />
            카카오맵에서 가게 정보를 확인해 보세요.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#district-food-places" className="button-primary">음식점 후보 보기 <span aria-hidden="true">↓</span></a>
            <a href="#district-food-intents" className="button-secondary">동선별 식사 검색</a>
          </div>
        </div>
        <div className="food-district-cover">
          <FoodGuideCover districtSlug={district.slug} districtName={district.name} area={editorial?.routeHints[0] || district.nearbyAreas.join(" · ")} />
        </div>
      </section>

      {editorial ? (
        <section className="home-section" aria-labelledby="district-editorial-title">
          <div className="food-editorial-note">
            <div>
              <p className="eyebrow">A note for your walk</p>
              <p className="mt-3 text-lg font-bold tracking-tight">식사 동선 메모</p>
            </div>
            <div>
              <h2 id="district-editorial-title" className="text-xl font-bold leading-8 tracking-tight text-slate-950 sm:text-2xl">{editorial.title}</h2>
              <p className="mt-5 text-sm leading-8 text-slate-600 sm:text-base">{editorial.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {editorial.routeHints.map((hint) => <span key={hint} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600">{hint}</span>)}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section id="district-food-places" className="home-section" aria-labelledby="district-places-title">
        <div className="home-section-top">
          <div>
            <p className="eyebrow">From open data</p>
            <h2 id="district-places-title" className="section-heading">{district.name} 음식점 후보</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              서울 열린데이터 일반음식점 인허가 정보에서 영업 상태로 확인된 가게입니다.
              맛집 순위가 아니라 동네와 업태가 한쪽으로 몰리지 않도록 정리한 동선 검토용 후보로 봐 주세요.
            </p>
          </div>
          {places.length > 0 ? <span className="food-count">{places.length.toLocaleString("ko-KR")}곳</span> : null}
        </div>
        {places.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {places.map((place) => <FoodPlaceCard key={place.id} place={place} />)}
          </div>
        ) : (
          <div className="food-empty-state">
            <h3 className="text-xl font-bold text-slate-950">아직 수집된 음식점 후보가 없습니다.</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">오전 7시 30분 자동 동기화 후 서울 열린데이터 기반 후보가 표시됩니다.</p>
          </div>
        )}
      </section>

      <section id="district-food-intents" className="home-section" aria-labelledby="district-intents-title">
        <div className="home-section-top">
          <div>
            <p className="eyebrow">Follow your day</p>
            <h2 id="district-intents-title" className="section-heading">동선별 식사 검색</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">나들이 일정에 맞는 식사 권역을 카카오맵에서 살펴보세요.</p>
          </div>
        </div>
        {intents.length > 0 ? (
          <div className="grid gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
            {intents.map((intent) => <FoodIntentCard key={intent.id} intent={intent} />)}
          </div>
        ) : (
          <div className="food-empty-state">
            <h3 className="text-xl font-bold text-slate-950">아직 연결된 먹거리 검색이 없습니다.</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">먼저 서울 주요 10개 구부터 채우고, 이후 25개 구로 확장합니다.</p>
          </div>
        )}
      </section>

      <div className="home-section"><FoodSourceNotice source={foodIndex.source} /></div>

      <section className="home-section" aria-labelledby="other-food-districts-title">
        <div className="home-section-top">
          <div>
            <p className="eyebrow">Your next neighborhood</p>
            <h2 id="other-food-districts-title" className="section-heading">다른 구 먹거리 보기</h2>
          </div>
          <Link href="/food#district-guides" className="section-link">전체 가이드 <span aria-hidden="true">→</span></Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {otherDistricts.map((item) => (
            <Link key={item.slug} href={`/districts/${item.slug}/food`} className="editorial-card group">
              <FoodGuideCover districtSlug={item.slug} districtName={item.name} area={item.nearbyAreas[0]} />
              <div className="mt-4 flex min-h-11 items-center justify-between text-sm font-bold text-slate-700 group-hover:text-sky-800">
                {item.name}<span aria-hidden="true">↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
