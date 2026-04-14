import Link from "next/link";
import HomeEventsSection from "@/components/HomeEventsSection";
import HomeBenefitsSection from "@/components/HomeBenefitsSection";
import { getBenefitsIndex, getFeaturedBenefits } from "@/lib/public-benefits";
import { getAllEvents, getEventsIndex } from "@/lib/seoul-events";

export default async function Home() {
  const [allEvents, featuredBenefits, eventsIndex, benefitsIndex] = await Promise.all([
    getAllEvents(),
    getFeaturedBenefits(4),
    getEventsIndex(),
    getBenefitsIndex(),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-white blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center">
            <span className="mb-6 inline-block rounded-full border border-white/10 bg-white/20 px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur-sm">
              🏙️ 서울시 생활 정보
            </span>
            <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              서울시 행사와 생활 정보를
              <br />
              <span className="text-amber-100">한눈에 확인하세요</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-orange-50 sm:text-xl">
              서울 전역의 행사·축제와 생활 혜택을 나눠서 정리했습니다.
              <br />
              먼저 행사 데이터부터 서울 열린데이터광장 기준으로 연결했습니다.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-white/10 backdrop-blur-sm" />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              <span className="text-3xl">🎉</span> 서울시 행사·축제
            </h2>
            <p className="mt-2 text-gray-500">
              서울 열린데이터광장의 서울시 문화행사 정보를 기준으로 보여드립니다.
            </p>
          </div>
          <Link
            href="/events"
            className="hidden rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-100 sm:inline-flex"
          >
            전체 행사 보기
          </Link>
        </div>

        <HomeEventsSection events={allEvents} />

        <div className="mt-6 sm:hidden">
          <Link
            href="/events"
            className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-100"
          >
            전체 행사 보기
          </Link>
        </div>
      </section>

      <section className="border-t border-orange-100/50 bg-orange-50/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mb-8 flex items-center justify-between sm:mb-10">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                <span className="text-3xl">💰</span> 놓치면 아쉬운 혜택
              </h2>
            <p className="mt-2 text-gray-500">
                공공데이터포털 기준으로 서울 혜택 정보를 확인하세요
              </p>
            </div>
          </div>

          <HomeBenefitsSection benefits={featuredBenefits} />

          <div className="mt-6">
            <Link
              href="/benefits"
              className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100"
            >
              전체 혜택 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="mb-2 text-sm text-gray-500">
            행사 데이터는 서울 열린데이터광장{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-orange-700">서울시 문화행사 정보</code>,
            혜택 데이터는 공공데이터포털{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-amber-700">대한민국 공공서비스(혜택) 정보</code>
            를 사용합니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              행사 수집 시각: {eventsIndex.source.collectedAt || "아직 수집되지 않음"}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              혜택 수집 시각: {benefitsIndex.source.collectedAt || "아직 수집되지 않음"}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
