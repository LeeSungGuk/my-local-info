import EventsCatalog from "@/components/EventsCatalog";
import { filterVisibleEvents, getTodayInSeoul, sortEventsByStartDate } from "@/lib/event-visibility";
import { getAllEvents } from "@/lib/seoul-events";

export const metadata = {
  title: "서울시 행사·축제 | 서울시티",
  description: "서울 열린데이터광장의 서울시 문화행사 정보를 기준으로 서울 전역의 행사와 축제를 확인하세요.",
};

export default async function EventsPage() {
  const today = getTodayInSeoul();
  const events = sortEventsByStartDate(filterVisibleEvents(await getAllEvents(), today));

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      <section className="border-b border-sky-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
            서울시 전체 행사·축제
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            요즘 서울에서 열리는 행사와 축제를
            <br />
            한눈에 둘러보세요
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
            전시, 공연, 체험, 축제처럼 지금 서울에서 살펴볼 만한 일정을 모았습니다.
            <br />
            가고 싶은 구를 고르면 내 주변에서 볼 만한 행사만 더 빠르게 찾을 수 있습니다.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <QuickLink href="/events?view=ongoing" label="오늘 진행 중" />
            <QuickLink href="/events?view=free" label="무료 행사" />
            <QuickLink href="/events?view=indoor" label="실내 추천" />
            <QuickLink href="/events" label="서울 전체 보기" />
          </div>
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
          <EventsCatalog events={events} today={today} />
        )}
      </section>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center rounded-full border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-50"
    >
      {label}
    </a>
  );
}
