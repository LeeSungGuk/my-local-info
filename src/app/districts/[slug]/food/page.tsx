import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FoodIntentCard from "@/components/food/FoodIntentCard";
import FoodSourceNotice from "@/components/food/FoodSourceNotice";
import {
  getAllDistricts,
  getDistrictBySlug,
  getDistrictSlugs,
} from "@/lib/districts";
import { getFoodIntentsByDistrict } from "@/lib/food";

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
  const otherDistricts = getAllDistricts()
    .filter((item) => item.slug !== district.slug)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ecfdf5_0%,#ffffff_34%,#f8fbff_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href={`/districts/${district.slug}`}
          className="inline-flex min-h-11 items-center text-sm font-bold text-slate-500 transition-colors hover:text-emerald-700"
        >
          <span aria-hidden="true" className="mr-1">
            ←
          </span>
          {district.name} 가이드로 돌아가기
        </Link>

        <section className="mt-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            {district.name} 먹거리 가이드
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            {district.name}에서 식사할 권역을
            <br />
            나들이 동선과 함께 봅니다
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            {district.summary} 아래 검색 링크는 카카오 API 없이 카카오맵 검색
            결과로 연결됩니다.
          </p>
        </section>

        {intents.length > 0 ? (
          <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {intents.map((intent) => (
              <FoodIntentCard key={intent.id} intent={intent} />
            ))}
          </section>
        ) : (
          <section className="mt-10 rounded-3xl border border-dashed border-emerald-200 bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-slate-950">
              아직 연결된 먹거리 검색이 없습니다.
            </h2>
            <p className="mt-3 text-slate-600">
              먼저 서울 주요 10개 구부터 채우고, 이후 25개 구로 확장합니다.
            </p>
          </section>
        )}

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <FoodSourceNotice />
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-extrabold text-slate-950">
              다른 구 먹거리 보기
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {otherDistricts.map((item) => (
                <Link
                  key={item.slug}
                  href={`/districts/${item.slug}/food`}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 font-bold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
