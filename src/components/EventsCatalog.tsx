"use client";

import Link from "next/link";
import { useState } from "react";
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

const ALL_DISTRICTS = "전체";

function formatEventPeriod(event: Pick<EventItem, "startDate" | "endDate">) {
  if (!event.startDate && !event.endDate) {
    return "일정 정보 없음";
  }

  if (event.startDate && event.endDate && event.startDate !== event.endDate) {
    return `${event.startDate} ~ ${event.endDate}`;
  }

  return event.startDate || event.endDate;
}

export default function EventsCatalog({
  events,
}: {
  events: EventItem[];
}) {
  const [selectedDistrict, setSelectedDistrict] = useState(ALL_DISTRICTS);
  const today = useTodayInSeoul();

  if (!today) {
    return (
      <div className="rounded-2xl border border-sky-100 bg-white p-10 text-center">
        <p className="text-lg font-semibold text-gray-900">행사 목록을 불러오는 중입니다.</p>
        <p className="mt-2 text-sm text-gray-600">오늘 날짜 기준으로 노출 대상을 계산하고 있습니다.</p>
      </div>
    );
  }

  const visibleEvents = sortEventsByStartDate(filterVisibleEvents(events, today));

  const districtCounts = visibleEvents.reduce<Record<string, number>>((acc, event) => {
    acc[event.district] = (acc[event.district] || 0) + 1;
    return acc;
  }, {});

  const districts = Object.keys(districtCounts).sort((a, b) => a.localeCompare(b, "ko"));

  const filteredEvents =
    selectedDistrict === ALL_DISTRICTS
      ? visibleEvents
      : visibleEvents.filter((event) => event.district === selectedDistrict);

  if (visibleEvents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-sky-200 bg-white p-10 text-center">
        <p className="text-lg font-semibold text-gray-900">오늘 기준으로 표시할 행사가 없습니다.</p>
        <p className="mt-2 text-sm text-gray-600">{today} 기준으로 종료되지 않은 행사만 노출합니다.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">구별로 빠르게 보기</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              원하는 구를 선택하면 해당 지역에서 {today} 기준 종료되지 않은 행사만 바로 볼 수 있습니다.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {selectedDistrict === ALL_DISTRICTS
              ? `전체 ${visibleEvents.length}건`
              : `${selectedDistrict} ${filteredEvents.length}건`}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">District</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <DistrictChip
              district={ALL_DISTRICTS}
              count={visibleEvents.length}
              isActive={selectedDistrict === ALL_DISTRICTS}
              onClick={setSelectedDistrict}
            />
            {districts.map((district) => (
              <DistrictChip
                key={district}
                district={district}
                count={districtCounts[district]}
                isActive={selectedDistrict === district}
                onClick={setSelectedDistrict}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
          종료된 일정은 자동으로 숨기고, 시작일 기준으로 정렬해 보여줍니다.
        </div>
      </aside>

      <div>
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {selectedDistrict === ALL_DISTRICTS ? "서울 전체" : selectedDistrict} 행사 {filteredEvents.length}건
          </p>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sky-200 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-gray-900">선택한 구에 표시할 행사가 없습니다.</p>
            <p className="mt-2 text-sm text-gray-600">다른 구를 선택하거나 전체 보기를 이용해 주세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
          {filteredEvents.map((event) => (
            <article
              key={event.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(56,189,248,0.10)]"
            >
              <div className="h-1 bg-gradient-to-r from-sky-400 to-blue-500" />
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700">
                    {event.category}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                    {event.district}
                  </span>
                </div>

                <h3 className="mt-4 line-clamp-2 text-xl font-bold leading-snug text-slate-900">
                  {event.title}
                </h3>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                  {event.summary}
                </p>

                <div className="mt-5 space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <span className="text-sky-500">📅</span>
                    <span>{formatEventPeriod(event)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sky-500">📍</span>
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sky-500">💸</span>
                    <span>{event.isFree ? "무료" : event.fee}</span>
                  </div>
                </div>

                <Link
                  href={`/events/${event.id}`}
                  className="mt-6 inline-flex items-center text-sm font-semibold text-sky-700 transition-colors hover:text-sky-800"
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
      </div>
    </div>
  );
}

function DistrictChip({
  district,
  count,
  isActive,
  onClick,
}: {
  district: string;
  count: number;
  isActive: boolean;
  onClick: (district: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(district)}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
        isActive
          ? "border-sky-500 bg-sky-500 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
      }`}
    >
      {district} {count}
    </button>
  );
}
