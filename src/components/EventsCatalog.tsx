"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { isIndoorEvent, isOngoingEvent } from "@/lib/home-summary";

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
const EVENT_VIEW_LABELS: Record<string, string> = {
  ongoing: "오늘 진행 중 행사",
  free: "무료 행사",
  indoor: "실내 추천",
};
const URL_CHANGE_EVENT = "events-catalog-url-change";

function subscribeToSearchParams(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(URL_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(URL_CHANGE_EVENT, callback);
  };
}

function getSearchParamsSnapshot() {
  return window.location.search;
}

function getServerSearchParamsSnapshot() {
  return "";
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

export default function EventsCatalog({
  events,
  today,
}: {
  events: EventItem[];
  today: string;
}) {
  const [pagination, setPagination] = useState({
    filterKey: "",
    visibleCount: 24,
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const searchParamsSnapshot = useSyncExternalStore(
    subscribeToSearchParams,
    getSearchParamsSnapshot,
    getServerSearchParamsSnapshot,
  );
  const searchParams = useMemo(
    () => new URLSearchParams(searchParamsSnapshot),
    [searchParamsSnapshot],
  );

  const selectedView = searchParams.get("view") || "";
  const baseEvents = events.filter((event) => {
    if (selectedView === "ongoing") {
      return isOngoingEvent(event, today);
    }

    if (selectedView === "free") {
      return event.isFree;
    }

    if (selectedView === "indoor") {
      return isIndoorEvent(event);
    }

    return true;
  });

  const districtCounts = baseEvents.reduce<Record<string, number>>((acc, event) => {
    acc[event.district] = (acc[event.district] || 0) + 1;
    return acc;
  }, {});

  const districts = Object.keys(districtCounts).sort((a, b) => a.localeCompare(b, "ko"));
  const districtParam = searchParams.get("district") || ALL_DISTRICTS;
  const selectedDistrict = districtParam === ALL_DISTRICTS || districtCounts[districtParam]
    ? districtParam
    : ALL_DISTRICTS;
  const filterKey = `${selectedView}:${selectedDistrict}`;
  const visibleCount =
    pagination.filterKey === filterKey ? pagination.visibleCount : 24;

  const filteredEvents =
    selectedDistrict === ALL_DISTRICTS
      ? baseEvents
      : baseEvents.filter((event) => event.district === selectedDistrict);
  const visibleEventsToRender = filteredEvents.slice(0, visibleCount);
  const hasMoreEvents = filteredEvents.length > visibleCount;
  const mobileFilterSummary = [
    EVENT_VIEW_LABELS[selectedView] ?? "전체 행사",
    selectedDistrict === ALL_DISTRICTS ? "서울 전체" : selectedDistrict,
    `${filteredEvents.length}건`,
  ].join(" · ");

  function selectDistrict(nextDistrict: string) {
    const nextParams = new URLSearchParams(window.location.search);

    if (nextDistrict === ALL_DISTRICTS) {
      nextParams.delete("district");
    } else {
      nextParams.set("district", nextDistrict);
    }

    const nextQuery = nextParams.toString();
    const nextUrl = nextQuery
      ? `${window.location.pathname}?${nextQuery}`
      : window.location.pathname;

    window.history.replaceState(null, "", nextUrl);
    window.dispatchEvent(new Event(URL_CHANGE_EVENT));
    setIsMobileFiltersOpen(false);
  }

  function resetCatalogFilters() {
    window.history.replaceState(null, "", "/events");
    window.dispatchEvent(new Event(URL_CHANGE_EVENT));
    setIsMobileFiltersOpen(false);
  }

  function renderFilterPanel() {
    return (
      <>
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">지역으로 빠르게 보기</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              원하는 구를 선택하면 해당 지역에서 {today} 기준 지금 볼 만한 행사만 바로 볼 수 있습니다.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {selectedDistrict === ALL_DISTRICTS
              ? `전체 ${baseEvents.length}건`
              : `${selectedDistrict} ${filteredEvents.length}건`}
          </div>
        </div>

        {EVENT_VIEW_LABELS[selectedView] ? (
          <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm leading-relaxed text-sky-800">
            현재 보기: <strong>{EVENT_VIEW_LABELS[selectedView]}</strong>
            <Link
              href="/events"
              onClick={(event) => {
                event.preventDefault();
                resetCatalogFilters();
              }}
              className="ml-2 font-semibold underline underline-offset-4"
            >
              전체로 돌아가기
            </Link>
          </div>
        ) : null}

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">지역</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <DistrictChip
              district={ALL_DISTRICTS}
              count={baseEvents.length}
              isActive={selectedDistrict === ALL_DISTRICTS}
              onClick={selectDistrict}
            />
            {districts.map((district) => (
              <DistrictChip
                key={district}
                district={district}
                count={districtCounts[district]}
                isActive={selectedDistrict === district}
                onClick={selectDistrict}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
          종료된 일정은 자동으로 숨기고, 시작일 기준으로 정렬해 보여줍니다.
        </div>
      </>
    );
  }

  if (baseEvents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-sky-200 bg-white p-10 text-center">
        <p className="text-lg font-semibold text-gray-900">선택한 조건에 맞는 행사가 없습니다.</p>
        <p className="mt-2 text-sm text-gray-600">
          {today} 기준으로 다시 집계한 결과이며, 다른 조건으로 둘러보실 수 있습니다.
        </p>
        <div className="mt-4">
          <Link
            href="/events"
            className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100"
          >
            전체 행사 보기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">지역 필터</p>
            <p className="mt-1 text-xs text-slate-500">{mobileFilterSummary}</p>
          </div>
          <span className="text-sm font-semibold text-sky-700">
            {isMobileFiltersOpen ? "닫기" : "열기"}
          </span>
        </button>
        {isMobileFiltersOpen ? (
          <aside className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
            {renderFilterPanel()}
          </aside>
        ) : null}
      </div>

      <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6 lg:block">
        {renderFilterPanel()}
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
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
              {visibleEventsToRender.map((event) => (
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

            {hasMoreEvents ? (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setPagination({
                      filterKey,
                      visibleCount: visibleCount + 24,
                    })
                  }
                  className="inline-flex items-center rounded-full border border-sky-200 bg-white px-6 py-3 text-sm font-semibold text-sky-700 shadow-sm transition-colors hover:bg-sky-50"
                >
                  행사 더 보기
                  <span className="ml-2 text-slate-400">
                    {visibleEventsToRender.length}/{filteredEvents.length}
                  </span>
                </button>
              </div>
            ) : null}
          </>
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
