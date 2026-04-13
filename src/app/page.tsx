import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";
import { formatEventPeriod, getFeaturedEvents, getEventsIndex } from "@/lib/seoul-events";

interface LocalBenefitsData {
  benefits: Array<{
    id: number;
    title: string;
    category: string;
    startDate: string;
    endDate: string;
    location: string;
    target: string;
    summary: string;
    url: string;
  }>;
  lastUpdated: string;
}

async function getLocalBenefitsData(): Promise<LocalBenefitsData> {
  const filePath = path.join(process.cwd(), "public", "data", "local-info.json");
  const fileContents = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContents);
}

export default async function Home() {
  const [localData, featuredEvents, eventsIndex] = await Promise.all([
    getLocalBenefitsData(),
    getFeaturedEvents(6),
    getEventsIndex(),
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

        {featuredEvents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-gray-900">행사 데이터가 아직 없습니다.</p>
            <p className="mt-2 text-sm text-gray-600">
              서울시 문화행사 데이터를 수집하면 이 영역에 자동으로 반영됩니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((event, index) => (
              <div
                key={event.id}
                className="group overflow-hidden rounded-2xl border border-orange-100/50 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-1.5 bg-gradient-to-r from-orange-400 to-rose-400" />

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
                      {event.category}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                      {event.district}
                    </span>
                  </div>

                  <h3 className="mb-3 mt-4 text-xl font-bold text-gray-900 transition-colors group-hover:text-orange-600">
                    {event.title}
                  </h3>

                  <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-gray-600">
                    {event.summary}
                  </p>

                  <div className="mb-6 space-y-2 rounded-xl bg-gray-50/50 p-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-orange-400">📅</span>
                      <span className="font-medium">{formatEventPeriod(event)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-orange-400">📍</span>
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-orange-400">💸</span>
                      <span>{event.isFree ? "무료" : event.fee}</span>
                    </div>
                  </div>

                  <Link
                    href={`/events/${event.id}`}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100"
                  >
                    자세히 보기
                    <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

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
                서울 생활에 도움이 되는 지원 정보를 확인하세요
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {localData.benefits.map((benefit, index) => (
              <div
                key={benefit.id}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex items-start justify-between p-1 pl-6 pt-6">
                  <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                    지원 혜택
                  </span>
                </div>

                <div className="flex flex-1 flex-col px-6 pb-6 pt-3">
                  <h3 className="mb-4 line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-amber-600 sm:text-2xl">
                    {benefit.title}
                  </h3>

                  <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-100/50 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-sm font-medium text-gray-700">
                    <span className="text-xl">🎯</span>
                    {benefit.target}
                  </div>

                  <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-600">
                    {benefit.summary}
                  </p>

                  <Link
                    href={`/benefits/${benefit.id}`}
                    className="inline-flex items-center text-sm font-semibold text-amber-600 hover:text-amber-700"
                  >
                    자세히 보기
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div className="h-1 bg-amber-400/20 transition-colors group-hover:bg-amber-400" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="mb-2 text-sm text-gray-500">
            행사 데이터는 서울 열린데이터광장{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-orange-700">서울시 문화행사 정보</code>,
            혜택 데이터는 현재 로컬 데이터 파일을 사용합니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              행사 수집 시각: {eventsIndex.source.collectedAt || "아직 수집되지 않음"}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              혜택 업데이트: {localData.lastUpdated}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
