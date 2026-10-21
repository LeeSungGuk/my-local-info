import type { Metadata } from "next";
import Link from "next/link";
import FoodGuideCover from "@/components/design/FoodGuideCover";
import FoodIntentCard from "@/components/food/FoodIntentCard";
import FoodPlaceCard from "@/components/food/FoodPlaceCard";
import FoodSourceNotice from "@/components/food/FoodSourceNotice";
import {
  getAllFoodIntents,
  getAllFoodDistrictEditorials,
  getFeaturedFoodPlaces,
  getFoodDistrictOverviews,
  getFoodIndex,
} from "@/lib/food";

export const metadata: Metadata = {
  title: "서울 구별 먹거리 가이드 | 서울시티",
  description:
    "서울 주요 구별로 식사하기 좋은 권역과 카카오맵 검색 링크를 정리합니다.",
};

export default async function FoodPage() {
  const intents = getAllFoodIntents();
  const editorials = getAllFoodDistrictEditorials();
  const districts = await getFoodDistrictOverviews();
  const guidedDistricts = districts.filter((district) => district.hasGuide);
  const foodIndex = await getFoodIndex();
  const places = await getFeaturedFoodPlaces(12);

  return (
    <div className="site-page min-h-screen">
      <section className="home-hero food-hero" aria-labelledby="food-title">
        <div className="hero-content">
          <p className="eyebrow">서울 구별 먹거리 가이드</p>
          <h1 id="food-title" className="hero-title">
            서울 나들이,<br /><span className="hero-gradient">한 끼도 함께.</span>
          </h1>
          <p className="hero-description">
            산책 끝에 만나는 한 끼, 전시 전의 여유로운 식사.{" "}<br className="hidden sm:block" />
            나들이 동선에 맞는 식사 권역을 찾아보세요.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#district-guides" className="button-primary">구별 가이드 고르기 <span aria-hidden="true">↓</span></a>
            <a href="#food-places" className="button-secondary">음식점 후보 보기</a>
          </div>
          <nav aria-label="먹거리 페이지 바로가기" className="hero-shortcuts">
            <a href="#food-districts">서울 25개 구</a>
            <a href="#food-intents">동선별 식사 검색 <span aria-hidden="true" className="ml-1">↘</span></a>
          </nav>
        </div>
        <div className="hero-flyers">
          {editorials.slice(0, 4).map((editorial) => (
            <Link
              key={editorial.districtSlug}
              href={`/districts/${editorial.districtSlug}/food`}
              className="hero-flyer"
              aria-label={`${editorial.districtName} 먹거리 가이드 보기`}
            >
              <FoodGuideCover districtSlug={editorial.districtSlug} districtName={editorial.districtName} area={editorial.routeHints[0]} />
            </Link>
          ))}
        </div>
      </section>

      <section id="district-guides" className="home-section" aria-labelledby="district-guides-title">
        <div className="home-section-top">
          <div>
            <p className="eyebrow">A table for every walk</p>
            <h2 id="district-guides-title" className="section-heading">어느 동네에서 먹을까요?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              구별 먹거리 해설에서 식사하기 좋은 권역부터 살펴보세요.{" "}<br className="hidden sm:block" />
              산책, 전시, 한강 나들이에 어울리는 동선을 정리했습니다.
            </p>
          </div>
          <span className="food-count">가이드 {guidedDistricts.length.toLocaleString("ko-KR")}</span>
        </div>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {editorials.map((editorial) => (
            <Link key={editorial.districtSlug} href={`/districts/${editorial.districtSlug}/food`} className="editorial-card food-editorial-card group">
              <FoodGuideCover districtSlug={editorial.districtSlug} districtName={editorial.districtName} area={editorial.routeHints[0]} />
              <p className="mt-5 text-xs font-semibold text-sky-700">{editorial.districtName}</p>
              <h3 className="mt-2 text-lg font-bold leading-7 tracking-tight text-slate-950 group-hover:text-sky-800">{editorial.title}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-500">{editorial.description}</p>
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 pb-5 text-xs leading-6 text-slate-600">
                {editorial.routeHints.map((hint) => <span key={hint}>{hint}</span>)}
              </div>
              <div className="mt-auto flex min-h-12 items-center justify-between border-t border-slate-200 pt-3 text-xs font-semibold text-slate-700">
                <span>동선과 식사 권역 보기</span><span aria-hidden="true">↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="food-districts" className="home-section" aria-labelledby="food-districts-title">
        <div className="home-section-top">
          <div>
            <p className="eyebrow">Across Seoul</p>
            <h2 id="food-districts-title" className="section-heading">서울 곳곳의 한 끼</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              서울 25개 구의 공공데이터 수집 현황입니다. 상세 가이드가 있는 구는 내부 페이지로,
              나머지 구는 카카오맵 검색으로 연결합니다.
            </p>
          </div>
          <span className="food-count">{districts.length.toLocaleString("ko-KR")}개 구</span>
        </div>
        <div className="grid grid-cols-2 border-t border-slate-200 sm:grid-cols-3 lg:grid-cols-5">
          {districts.map((district) => {
            const content = (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-950">{district.name}</span>
                  <span aria-hidden="true" className="text-slate-400">{district.hasGuide ? "→" : "↗"}</span>
                </div>
                <span className="mt-2 block text-xs text-slate-500">{district.placeCount.toLocaleString("ko-KR")}곳 수집</span>
                <span className={`mt-3 block text-xs ${district.hasGuide ? "font-semibold text-sky-700" : "text-slate-500"}`}>
                  {district.hasGuide ? "상세 가이드" : "카카오맵 검색"}
                </span>
              </>
            );
            return district.linkType === "guide" ? (
              <Link key={district.name} href={district.href} className="food-district-link">{content}</Link>
            ) : (
              <a key={district.name} href={district.href} target="_blank" rel="noopener noreferrer" className="food-district-link" aria-label={`${district.name} 카카오맵 검색 (새 창)`}>{content}</a>
            );
          })}
        </div>
      </section>

      <section id="food-places" className="home-section" aria-labelledby="food-places-title">
        <div className="home-section-top">
          <div>
            <p className="eyebrow">From open data</p>
            <h2 id="food-places-title" className="section-heading">공공데이터로 살펴보는 음식점</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              최근 인허가 음식점 중 영업 상태인 가게를 보여줍니다. 방문 추천 순위가 아니라
              품질 신호, 구별 분산, 동네·업태 다양성을 기준으로 정리한 후보 목록입니다.
            </p>
          </div>
          {foodIndex.source.selectedCount > 0 ? <span className="food-count">전체 {foodIndex.source.selectedCount.toLocaleString("ko-KR")}곳</span> : null}
        </div>
        {places.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {places.map((place) => <FoodPlaceCard key={place.id} place={place} />)}
          </div>
        ) : (
          <div className="food-empty-state">
            <h3 className="text-xl font-bold text-slate-950">아직 수집된 음식점 데이터가 없습니다.</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">오전 7시 30분 자동 동기화가 실행되면 서울 열린데이터 기반 음식점 후보가 이 영역에 표시됩니다.</p>
          </div>
        )}
      </section>

      <section id="food-intents" className="home-section" aria-labelledby="food-intents-title">
        <div className="home-section-top">
          <div>
            <p className="eyebrow">Follow your day</p>
            <h2 id="food-intents-title" className="section-heading">오늘의 동선에 한 끼 더하기</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">함께하는 사람과 나들이 일정에 맞춰 카카오맵에서 식사할 곳을 찾아보세요.</p>
          </div>
        </div>
        <div className="grid gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
          {intents.map((intent) => <FoodIntentCard key={intent.id} intent={intent} />)}
        </div>
      </section>
      <div className="home-section"><FoodSourceNotice source={foodIndex.source} /></div>
    </div>
  );
}
