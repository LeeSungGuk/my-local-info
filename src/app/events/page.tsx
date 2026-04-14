import { Suspense } from "react";
import EventsCatalog from "@/components/EventsCatalog";
import { getAllEvents } from "@/lib/seoul-events";

export const metadata = {
  title: "서울시 행사·축제 | 서울시티",
  description: "서울 열린데이터광장의 서울시 문화행사 정보를 기준으로 서울 전역의 행사와 축제를 확인하세요.",
};

export default async function EventsPage() {
  const events = await getAllEvents();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      <section className="border-b border-sky-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
            서울시 전체 행사·축제
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            오늘의 서울을 채우는 행사와 축제를
            <br />
            더 가볍게 둘러보세요
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
            서울 곳곳에서 열리는 전시, 공연, 체험, 축제를 한곳에 모았습니다.
            <br />
            원하는 구를 고르면 지금 살펴보기 좋은 일정만 더 빠르게 찾을 수 있습니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {events.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-gray-900">행사 데이터가 아직 없습니다.</h2>
            <p className="mt-3 text-gray-600">
              <code className="rounded bg-sky-50 px-1.5 py-0.5 text-sm text-sky-700">
                node scripts/fetch-seoul-events.js
              </code>
              를 실행해 서울시 행사 데이터를 먼저 생성해 주세요.
            </p>
          </div>
        ) : (
          <Suspense fallback={<CatalogFallback message="행사 목록을 불러오는 중입니다." />}>
            <EventsCatalog events={events} />
          </Suspense>
        )}
      </section>
    </div>
  );
}

function CatalogFallback({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-10 text-center">
      <p className="text-lg font-semibold text-gray-900">{message}</p>
      <p className="mt-2 text-sm text-gray-600">필터 조건을 준비하고 있습니다.</p>
    </div>
  );
}
