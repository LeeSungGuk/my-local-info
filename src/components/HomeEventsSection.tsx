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
      <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center">
        <p className="text-lg font-semibold text-gray-900">행사 목록을 불러오는 중입니다.</p>
        <p className="mt-2 text-sm text-gray-600">오늘 날짜 기준으로 노출 대상을 계산하고 있습니다.</p>
      </div>
    );
  }

  const featuredEvents = sortEventsByStartDate(filterVisibleEvents(events, today)).slice(0, 6);

  return (
    <>
      {featuredEvents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-gray-900">오늘 기준으로 표시할 행사가 없습니다.</p>
          <p className="mt-2 text-sm text-gray-600">{today} 기준으로 종료되지 않은 행사만 보여드립니다.</p>
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
    </>
  );
}
