import Link from "next/link";
import HomeEventsSection from "@/components/HomeEventsSection";
import HomeBenefitsSection from "@/components/HomeBenefitsSection";
import HomeSeoulSummary from "@/components/HomeSeoulSummary";
import HomeUnifiedSearch from "@/components/HomeUnifiedSearch";
import { getBenefitsIndex, getAllBenefits } from "@/lib/public-benefits";
import { getAllEvents, getEventsIndex } from "@/lib/seoul-events";
import { getHomeSummaryMetrics } from "@/lib/home-summary";

export default async function Home() {
  const [allEvents, allBenefits, eventsIndex, benefitsIndex] = await Promise.all([
    getAllEvents(),
    getAllBenefits(),
    getEventsIndex(),
    getBenefitsIndex(),
  ]);
  const featuredBenefits = allBenefits.slice(0, 4);
  const summary = getHomeSummaryMetrics(allEvents, allBenefits);
  const heroStars = [
    "left-[12%] top-[18%] h-1 w-1 bg-white/70",
    "left-[22%] top-[34%] h-1.5 w-1.5 bg-sky-100/70",
    "left-[31%] top-[14%] h-1 w-1 bg-cyan-100/60",
    "left-[44%] top-[28%] h-1 w-1 bg-white/60",
    "left-[56%] top-[16%] h-1.5 w-1.5 bg-cyan-100/70",
    "left-[66%] top-[36%] h-1 w-1 bg-white/60",
    "left-[74%] top-[22%] h-1 w-1 bg-sky-100/60",
    "left-[82%] top-[12%] h-1.5 w-1.5 bg-white/70",
    "left-[18%] top-[56%] h-1 w-1 bg-cyan-100/60",
    "left-[38%] top-[62%] h-1.5 w-1.5 bg-white/60",
    "left-[59%] top-[54%] h-1 w-1 bg-sky-100/70",
    "left-[79%] top-[60%] h-1 w-1 bg-white/60",
  ];

  return (
    <div>
      <section className="relative bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_42%,#38bdf8_100%)] text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-sky-100/40 blur-3xl" />
            <div className="absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-300/20 blur-3xl" />
          </div>
          <div className="absolute inset-0 opacity-45">
            {heroStars.map((starClassName, index) => (
              <span
                key={index}
                className={`absolute rounded-full blur-[0.5px] ${starClassName}`}
              />
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-white/10 backdrop-blur-sm" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center">
            <span className="mb-6 inline-block rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur-sm">
              🌙 서울 로컬 생활 가이드
            </span>
            <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              서울의 행사와 생활 정보를
              <br />
              <span className="text-cyan-100">한눈에 확인하세요</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-sky-50 sm:text-xl">
              오늘의 서울을 조금 더 가볍고 선명하게 만날 수 있도록,
              <br />
              일상에 닿는 행사와 혜택을 한곳에 담았습니다.
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-12 max-w-6xl px-4 sm:-mt-16 sm:px-6">
        <HomeUnifiedSearch />
      </section>

      <HomeSeoulSummary summary={summary} />

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
            className="hidden rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100 sm:inline-flex"
          >
            전체 행사 보기
          </Link>
        </div>

        <HomeEventsSection events={allEvents} />

        <div className="mt-6 sm:hidden">
          <Link
            href="/events"
            className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100"
          >
            전체 행사 보기
          </Link>
        </div>
      </section>

      <section className="border-t border-sky-100/70 bg-sky-50/30">
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
              className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition-colors hover:bg-cyan-100"
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
    </div>
  );
}
