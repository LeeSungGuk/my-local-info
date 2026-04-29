import type { Metadata } from "next";
import Link from "next/link";
import FoodIntentCard from "@/components/food/FoodIntentCard";
import FoodSourceNotice from "@/components/food/FoodSourceNotice";
import { getAllFoodIntents, getDistrictsWithFood } from "@/lib/food";

export const metadata: Metadata = {
  title: "서울 구별 먹거리 가이드 | 서울시티",
  description:
    "서울 주요 구별로 식사하기 좋은 권역과 카카오맵 검색 링크를 정리합니다.",
};

export default function FoodPage() {
  const intents = getAllFoodIntents();
  const districts = getDistrictsWithFood();

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
            맛집 순위를 임의로 매기지 않고, 구별 나들이 동선과 맞는 식사 검색
            링크를 제공합니다. 실제 영업 정보는 카카오맵에서 확인해 주세요.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {districts.map((district) => (
              <Link
                key={district.slug}
                href={`/districts/${district.slug}/food`}
                className="inline-flex min-h-11 items-center rounded-xl border border-emerald-200 bg-white px-4 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                {district.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {intents.map((intent) => (
            <FoodIntentCard key={intent.id} intent={intent} />
          ))}
        </div>
        <div className="mt-10">
          <FoodSourceNotice />
        </div>
      </div>
    </div>
  );
}
