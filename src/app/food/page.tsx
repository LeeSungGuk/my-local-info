import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#ecfdf5_0%,#ffffff_34%,#f8fbff_100%)]">
      <section className="border-b border-emerald-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            서울 구별 먹거리 가이드
          </span>
          <h1 className="mt-5 max-w-4xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            나들이 동선에 맞춰
            <br />
            식사할 권역을 같이 고릅니다
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            상세 가이드가 준비된 주요 구는 동선별 식사 검색으로 연결하고,
            나머지 구는 서울 열린데이터 기반 음식점 현황과 카카오맵 검색으로
            확인할 수 있게 정리합니다.
          </p>
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
            상세 가이드 제공 구
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {guidedDistricts.map((district) => (
              <Link
                key={district.name}
                href={district.href}
                className="inline-flex min-h-11 items-center rounded-xl border border-emerald-200 bg-white px-4 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                {district.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <section>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-600">
              Editorial Guide
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
              구별 먹거리 해설
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              음식점 후보를 보기 전에 각 구에서 식사를 어디에 붙이면 동선이
              자연스러운지 먼저 정리했습니다. 공공데이터 목록은 이 해설을 보조하는
              참고 자료로 사용합니다.
            </p>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {editorials.map((editorial) => (
              <Link
                key={editorial.districtSlug}
                href={`/districts/${editorial.districtSlug}/food`}
                className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50"
              >
                <p className="text-sm font-bold text-emerald-700">
                  {editorial.districtName}
                </p>
                <h3 className="mt-2 text-lg font-extrabold text-slate-950">
                  {editorial.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                  {editorial.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {editorial.routeHints.map((hint) => (
                    <span
                      key={hint}
                      className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"
                    >
                      {hint}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-600">
                District Coverage
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                공공데이터 수집 구 현황
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                음식점 인허가 데이터는 서울 25개 구를 기준으로 수집합니다. 상세
                가이드가 있는 구는 내부 페이지로, 아직 상세 가이드가 없는 구는
                카카오맵 구 단위 검색으로 연결합니다.
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              {districts.length.toLocaleString("ko-KR")}개 구
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {districts.map((district) => {
              const content = (
                <>
                  <span className="font-extrabold text-slate-950">
                    {district.name}
                  </span>
                  <span className="mt-2 text-xs font-semibold text-slate-500">
                    {district.placeCount.toLocaleString("ko-KR")}곳 수집
                  </span>
                  <span
                    className={
                      district.hasGuide
                        ? "mt-3 text-xs font-bold text-emerald-700"
                        : "mt-3 text-xs font-bold text-slate-500"
                    }
                  >
                    {district.hasGuide ? "상세 가이드" : "카카오맵 검색"}
                  </span>
                </>
              );

              if (district.linkType === "guide") {
                return (
                  <Link
                    key={district.name}
                    href={district.href}
                    className="flex min-h-28 flex-col rounded-2xl border border-emerald-100 bg-white p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <a
                  key={district.name}
                  href={district.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-28 flex-col rounded-2xl border border-slate-100 bg-white p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                >
                  {content}
                </a>
              );
            })}
          </div>
        </section>

        <section className="mt-14">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-600">
                Open Data
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                공공데이터 기반 최근 인허가 음식점
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                서울 열린데이터의 일반음식점 인허가 정보에서 영업 상태인 가게만
                추려 보여줍니다. 방문 추천 순위가 아니라 품질 신호, 구별 분산,
                동네·업태 다양성을 기준으로 정리한 후보 목록입니다.
              </p>
            </div>
            {foodIndex.source.selectedCount > 0 ? (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                {foodIndex.source.selectedCount.toLocaleString("ko-KR")}곳 표시
              </div>
            ) : null}
          </div>
          {places.length > 0 ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {places.map((place) => (
                <FoodPlaceCard key={place.id} place={place} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-emerald-200 bg-white p-10 text-center">
              <h3 className="text-xl font-bold text-slate-950">
                아직 수집된 음식점 데이터가 없습니다.
              </h3>
              <p className="mt-3 text-slate-600">
                오전 7시 30분 자동 동기화가 실행되면 서울 열린데이터 기반 음식점
                후보가 이 영역에 표시됩니다.
              </p>
            </div>
          )}
        </section>

        <section className="mt-14">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
              Search Links
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
              동선별 식사 검색
            </h2>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {intents.map((intent) => (
              <FoodIntentCard key={intent.id} intent={intent} />
            ))}
          </div>
        </section>
        <div className="mt-10">
          <FoodSourceNotice source={foodIndex.source} />
        </div>
      </div>
    </div>
  );
}
