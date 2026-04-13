import EventsCatalog from "@/components/EventsCatalog";
import { getAllEvents } from "@/lib/seoul-events";

export const metadata = {
  title: "서울시 행사·축제 | 서울시티",
  description: "서울 열린데이터광장의 서울시 문화행사 정보를 기준으로 서울 전역의 행사와 축제를 확인하세요.",
};

export default async function EventsPage() {
  const events = await getAllEvents();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
      <section className="border-b border-orange-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
            서울시 전체 행사·축제
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            서울 전역 행사와 축제를
            <br />
            한곳에서 확인하세요
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
            서울 열린데이터광장의 서울시 문화행사 정보를 기준으로 정리했습니다.
            전체 리스트를 한 번에 보는 대신, 구를 선택해서 더 빠르게 탐색할 수 있게 구성했습니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
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
          <EventsCatalog events={events} />
        )}
      </section>
    </div>
  );
}
