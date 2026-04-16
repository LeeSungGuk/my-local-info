"use client";

import Link from "next/link";
import { filterVisibleEvents, sortEventsByStartDate } from "@/lib/event-visibility";
import { useTodayInSeoul } from "@/lib/use-today-in-seoul";

interface EventItem {
  id: string;
  title: string;
  category: string;
  district: string;
  venue: string;
  startDate: string;
  endDate: string;
  fee: string;
  isFree: boolean;
  summary: string;
}

function formatEventPeriod(event: Pick<EventItem, "startDate" | "endDate">) {
  if (!event.startDate && !event.endDate) {
    return "일정 정보 없음";
  }

  if (event.startDate && event.endDate && event.startDate !== event.endDate) {
    return `${event.startDate} ~ ${event.endDate}`;
  }

  return event.startDate || event.endDate;
}

export default function HomeEventsSection({ events }: { events: EventItem[] }) {
  const today = useTodayInSeoul();

  if (!today) {
    return (
      <div className="rounded-2xl border border-sky-100 bg-white p-10 text-center">
        <p className="text-lg font-semibold text-gray-900">행사 목록을 불러오는 중입니다.</p>
        <p className="mt-2 text-sm text-gray-600">오늘 날짜 기준으로 노출 대상을 계산하고 있습니다.</p>
      </div>
    );
  }

  const featuredEvents = sortEventsByStartDate(filterVisibleEvents(events, today)).slice(0, 6);

  return (
    <>
      {featuredEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sky-200 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-gray-900">오늘 기준으로 표시할 행사가 없습니다.</p>
          <p className="mt-2 text-sm text-gray-600">{today} 기준으로 종료되지 않은 행사만 보여드립니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredEvents.map((event, index) => (
            <div
              key={event.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(56,189,248,0.10)]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-1 bg-gradient-to-r from-sky-400 to-blue-500" />

              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                    {event.category}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {event.district}
                  </span>
                </div>

                <h3 className="mb-3 mt-4 text-xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-sky-800">
                  {event.title}
                </h3>

                <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-gray-600">
                  {event.summary}
                </p>

                <div className="mb-6 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-sky-500">📅</span>
                    <span className="font-medium text-slate-700">{formatEventPeriod(event)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-sky-500">📍</span>
                    <span className="truncate">{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-sky-500">💸</span>
                    <span>{event.isFree ? "무료" : event.fee}</span>
                  </div>
                </div>

                <Link
                  href={`/events/${event.id}`}
                  className="inline-flex min-h-11 items-center rounded-md text-sm font-semibold text-sky-700 transition-colors hover:text-sky-800"
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
    </>
  );
}
