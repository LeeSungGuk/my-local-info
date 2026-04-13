import Link from "next/link";
import { formatEventPeriod, getEventsIndex } from "@/lib/seoul-events";

export const metadata = {
  title: "서울시 행사·축제 | 서울시티",
  description: "서울 열린데이터광장의 서울시 문화행사 정보를 기준으로 서울 전역의 행사와 축제를 확인하세요.",
};

export default async function EventsPage() {
  const eventsIndex = await getEventsIndex();
  const events = eventsIndex.items;

  return (
    <div className="bg-gradient-to-b from-orange-50 via-white to-white min-h-screen">
      <section className="border-b border-orange-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
            서울시 전체 행사·축제
          </span>
          <h1 className="mt-5 text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
            서울 전역 행사와 축제를
            <br />
            한곳에서 확인하세요
          </h1>
          <p className="mt-5 max-w-3xl text-base sm:text-lg leading-relaxed text-gray-600">
            서울 열린데이터광장의 서울시 문화행사 정보를 기준으로 정리했습니다.
            구별 행사, 전시, 공연, 축제를 일정과 장소 중심으로 빠르게 확인할 수 있습니다.
          </p>

        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {events.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-gray-900">행사 데이터가 아직 없습니다.</h2>
            <p className="mt-3 text-gray-600">
              <code className="rounded bg-orange-50 px-1.5 py-0.5 text-sm text-orange-700">
                node scripts/fetch-seoul-events.js
              </code>
              를 실행해 서울시 행사 데이터를 먼저 생성해 주세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event) => (
              <article
                key={event.id}
                className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-1.5 bg-gradient-to-r from-orange-400 to-rose-400" />
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                      {event.category}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      {event.district}
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-bold leading-snug text-gray-900 line-clamp-2">
                    {event.title}
                  </h2>

                  <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-2">
                    {event.summary}
                  </p>

                  <div className="mt-5 space-y-2 rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <span className="text-orange-500">📅</span>
                      <span>{formatEventPeriod(event)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-500">📍</span>
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-500">💸</span>
                      <span>{event.isFree ? "무료" : event.fee}</span>
                    </div>
                  </div>

                  <Link
                    href={`/events/${event.id}`}
                    className="mt-6 inline-flex items-center text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700"
                  >
                    상세 보기
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
