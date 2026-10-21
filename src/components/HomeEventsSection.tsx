"use client";

import Link from "next/link";
import type { SeoulEventSummary } from "@/lib/seoul-events";
import { filterVisibleEvents, sortEventsByStartDate } from "@/lib/event-visibility";
import { useTodayInSeoul } from "@/lib/use-today-in-seoul";
import EventPoster from "./design/EventPoster";

function formatEventPeriod(event: SeoulEventSummary) {
  if (!event.startDate && !event.endDate) return "일정 정보 없음";
  return event.endDate && event.endDate !== event.startDate
    ? event.startDate + " ~ " + event.endDate
    : event.startDate || event.endDate;
}

export default function HomeEventsSection({ events }: { events: SeoulEventSummary[] }) {
  const today = useTodayInSeoul();
  if (!today) {
    return <div className="rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500" role="status">행사 목록을 불러오는 중입니다.</div>;
  }
  const featuredEvents = sortEventsByStartDate(filterVisibleEvents(events, today)).slice(0, 6);
  if (featuredEvents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
        <p className="font-semibold">오늘 기준으로 표시할 행사가 없습니다.</p>
        <p className="mt-2 text-sm text-slate-500">{today} 기준으로 종료되지 않은 행사만 보여드립니다.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {featuredEvents.map((event) => (
        <article key={event.id} className="group min-w-0">
          <Link href={"/events/" + event.id} aria-label={event.title + " 상세 보기"} className="block">
            <EventPoster imageUrl={event.imageUrl} title={event.title} />
          </Link>
          <div className="px-1 pt-4">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span className="font-semibold text-sky-700">{event.category}</span>
              <span aria-hidden="true">·</span><span>{event.district}</span>
              {event.isFree && <span className="ml-auto rounded-full bg-cyan-50 px-2 py-1 font-medium text-cyan-700">무료</span>}
            </div>
            <h3 className="mt-2 line-clamp-2 text-base font-bold leading-7 tracking-tight">
              <Link href={"/events/" + event.id} className="hover:text-sky-700">{event.title}</Link>
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{event.summary}</p>
            <p className="mt-2 text-xs leading-6 text-slate-500">{formatEventPeriod(event)}</p>
            <p className="truncate text-xs leading-6 text-slate-500">{event.venue}</p>
            {!event.isFree && <p className="mt-1 line-clamp-2 text-xs leading-6 text-slate-500">{event.fee || "요금은 공식 안내 확인"}</p>}
            <Link href={"/events/" + event.id} className="section-link mt-1">자세히 보기 <span aria-hidden="true">↗</span></Link>
          </div>
        </article>
      ))}
    </div>
  );
}
