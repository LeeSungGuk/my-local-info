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
      <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center">
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
      <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-10 text-center">
        <p className="text-lg font-semibold text-gray-900">오늘 기준으로 표시할 행사가 없습니다.</p>
        <p className="mt-2 text-sm text-gray-600">{today} 기준으로 종료되지 않은 행사만 노출합니다.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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

        <div className="mt-5">
          <div className="flex flex-wrap gap-2">
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
      </div>

      {filteredEvents.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-orange-200 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-gray-900">선택한 구에 표시할 행사가 없습니다.</p>
          <p className="mt-2 text-sm text-gray-600">다른 구를 선택하거나 전체 보기를 이용해 주세요.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => (
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

                <h3 className="mt-4 line-clamp-2 text-xl font-bold leading-snug text-gray-900">
                  {event.title}
                </h3>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
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
          ? "border-orange-500 bg-orange-500 text-white"
          : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
      }`}
    >
      {district} {count}
    </button>
  );
}
