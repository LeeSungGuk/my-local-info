"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DISTRICT_MAP_METRICS,
  getDistrictLinks,
  getMetricLegend,
  getMetricStep,
  summarizeEventsByDistrict,
  type DistrictEventSummary,
  type DistrictLinks,
  type DistrictMapEntry,
  type DistrictMapEvent,
  type DistrictMapMetric,
  type MetricStep,
} from "@/lib/district-map";
import { useTodayInSeoul } from "@/lib/use-today-in-seoul";

const METRIC_ORDER: DistrictMapMetric[] = ["benefits", "events", "free"];

const METRIC_VALUES: Record<
  DistrictMapMetric,
  (entry: DistrictMapEntry, events: DistrictEventSummary | undefined) => number
> = {
  benefits: (entry) => entry.benefitCount,
  events: (_, events) => events?.visibleCount ?? 0,
  free: (_, events) => events?.freeCount ?? 0,
};

const NO_EVENTS: DistrictEventSummary = { visibleCount: 0, ongoingCount: 0, freeCount: 0, featured: [] };

const STEP_CLASSES: Record<MetricStep, string> = {
  0: "bg-slate-100 text-slate-600",
  1: "bg-sky-100 text-slate-800",
  2: "bg-sky-200 text-slate-900",
  3: "bg-sky-300 text-slate-950",
  4: "bg-sky-600 text-white",
};

function shortDistrictName(name: string) {
  return name === "중구" ? name : name.replace(/구$/, "");
}

function formatShortDate(date: string) {
  const [, month, day] = date.split("-");
  return `${Number(month)}.${Number(day)}`;
}

function formatShortPeriod(event: Pick<DistrictMapEvent, "startDate" | "endDate">) {
  const start = event.startDate || event.endDate;
  const end = event.endDate || event.startDate;
  return start === end ? formatShortDate(start) : `${formatShortDate(start)}–${formatShortDate(end)}`;
}

export default function HomeDistrictMapSection({
  entries,
  events,
  totalBenefitCount,
  seoulWideBenefitCount,
}: {
  entries: DistrictMapEntry[];
  events: DistrictMapEvent[];
  totalBenefitCount: number;
  seoulWideBenefitCount: number;
}) {
  const [metric, setMetric] = useState<DistrictMapMetric>("benefits");
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const today = useTodayInSeoul();
  const eventSummaries = useMemo(
    () => (today ? summarizeEventsByDistrict(events, today) : null),
    [events, today],
  );
  const isWaitingForDate = metric !== "benefits" && !eventSummaries;
  const metricLabel = DISTRICT_MAP_METRICS[metric].label;
  const selectedEntry = entries.find((entry) => entry.name === selectedName) ?? null;
  const totalVisibleEvents = eventSummaries
    ? [...eventSummaries.values()].reduce((sum, summary) => sum + summary.visibleCount, 0)
    : null;

  return (
    <section className="home-section" aria-labelledby="district-map-title">
      <div className="home-section-top">
        <div>
          <p className="eyebrow">EXPLORE BY DISTRICT</p>
          <h2 id="district-map-title" className="section-heading">어느 구를 둘러볼까요?</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            구를 누르면 그 구의 행사, 혜택, 먹거리를 한 번에 보여드려요. 색이 진할수록 많아요.
          </p>
        </div>
        <span className="hidden text-xs text-slate-500 sm:block">
          서울 <span className="ml-2 rounded-full border border-slate-200 px-2 py-1">25개 구</span>
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          <div
            className="inline-flex w-fit gap-0.5 rounded-full border border-slate-200 bg-white p-1"
            role="group"
            aria-label="색 기준"
          >
            {METRIC_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setMetric(key)}
                aria-pressed={metric === key}
                className={`min-h-11 rounded-full px-4 text-[13px] transition-colors ${
                  metric === key ? "bg-slate-950 font-bold text-white" : "font-medium text-slate-500 hover:text-slate-900"
                }`}
              >
                {DISTRICT_MAP_METRICS[key].label}
              </button>
            ))}
          </div>

          <div className="grid w-full max-w-[520px] grid-cols-5 gap-1.5 sm:gap-2" role="group" aria-label="서울 25개 구">
            {entries.map((entry) => {
              const value = isWaitingForDate ? null : METRIC_VALUES[metric](entry, eventSummaries?.get(entry.name));
              const step = value === null ? 0 : getMetricStep(metric, value);
              const isSelected = entry.name === selectedName;

              return (
                <button
                  key={entry.name}
                  type="button"
                  onClick={() => setSelectedName(entry.name)}
                  aria-pressed={isSelected}
                  aria-label={`${entry.name}, ${metricLabel} ${value === null ? "확인 중" : `${value}개`}${
                    entry.guideSlug ? ", 구별 가이드 있음" : ""
                  }`}
                  style={{ gridRow: entry.row, gridColumn: entry.col }}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-xl transition-colors ${
                    STEP_CLASSES[step]
                  } ${isSelected ? "ring-2 ring-slate-950 ring-offset-2 ring-offset-background" : "hover:brightness-95"}`}
                >
                  <span className="text-[13px] font-bold leading-tight sm:text-sm">{shortDistrictName(entry.name)}</span>
                  <span className="text-xs font-medium tabular-nums sm:text-sm">{value ?? "·"}</span>
                  {entry.guideSlug ? (
                    <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-cyan-600 ring-2 ring-white/80" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-2">
              <span>{metricLabel} 수</span>
              <div className="flex gap-0.5">
                {getMetricLegend(metric).map((range, index) => (
                  <span key={range} className="grid gap-1 text-center tabular-nums">
                    <i className={`block h-2.5 w-10 rounded-sm ${STEP_CLASSES[index as MetricStep]}`} />
                    {range}
                  </span>
                ))}
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-full bg-cyan-600" />
              구별 가이드 있음
            </span>
          </div>
        </div>

        <aside className="min-w-0 rounded-[22px] border border-slate-200 bg-white p-5 sm:p-6">
          <p className="sr-only" aria-live="polite">
            {selectedEntry ? `${selectedEntry.name}를 골랐어요.` : ""}
          </p>
          {selectedEntry ? (
            <DistrictPanel
              entry={selectedEntry}
              events={eventSummaries ? eventSummaries.get(selectedEntry.name) ?? NO_EVENTS : null}
              seoulWideBenefitCount={seoulWideBenefitCount}
            />
          ) : (
            <div className="grid gap-5">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight text-slate-950">구를 골라 보세요</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  타일을 누르면 그 구에서 볼 수 있는 행사와 받을 수 있는 혜택, 먹거리 후보를 보여드려요.
                </p>
              </div>
              <dl className="grid grid-cols-2 divide-x divide-slate-200 border-y border-slate-200">
                <Stat label="서울에서 볼 수 있는 행사" value={totalVisibleEvents} />
                <Stat label="서울 혜택" value={totalBenefitCount} note={`서울 전체 대상 ${seoulWideBenefitCount}개 포함`} />
              </dl>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: number | null; note?: string }) {
  return (
    <div className="grid content-start gap-0.5 px-3 py-3 first:pl-0">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-2xl font-extrabold tabular-nums tracking-tight text-slate-950">
        {value === null ? "·" : (
          <>
            {value}
            <small className="ml-0.5 text-[13px] font-medium text-slate-500">개</small>
          </>
        )}
      </dd>
      {note ? <dd className="text-xs text-slate-500">{note}</dd> : null}
    </div>
  );
}

const SECONDARY_LINK_CLASS =
  "flex min-h-11 flex-1 basis-40 items-center justify-between gap-2 whitespace-nowrap rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 transition-colors hover:border-sky-300 hover:text-sky-700";

const PRIMARY_LABELS: Record<DistrictLinks["primary"]["kind"], (name: string) => string> = {
  guide: (name) => `${name} 가이드 보기`,
  events: (name) => `${name} 행사 보기`,
  benefits: (name) => `${name} 혜택 보기`,
};

function DistrictPanel({
  entry,
  events,
  seoulWideBenefitCount,
}: {
  entry: DistrictMapEntry;
  /** 오늘 날짜를 아직 모르면 null */
  events: DistrictEventSummary | null;
  seoulWideBenefitCount: number;
}) {
  const links = getDistrictLinks(entry, events?.visibleCount ?? 0);
  const secondaryLinks = [
    links.events && links.primary.kind !== "events" ? { href: links.events, label: `행사 ${events?.visibleCount}개` } : null,
    links.primary.kind !== "benefits" ? { href: links.benefits, label: `혜택 ${entry.benefitCount}개` } : null,
  ].filter((link) => link !== null);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <h3 className="text-2xl font-extrabold tracking-tight text-slate-950">{entry.name}</h3>
        {entry.guideSlug ? (
          <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700">구별 가이드 있음</span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">가이드 준비 중</span>
        )}
      </div>

      <dl className="grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200">
        <Stat
          label="볼 수 있는 행사"
          value={events ? events.visibleCount : null}
          note={events ? `진행 중 ${events.ongoingCount}개` : undefined}
        />
        <Stat label="무료 행사" value={events ? events.freeCount : null} />
        <Stat label="구 혜택" value={entry.benefitCount} note={`+ 서울 전체 ${seoulWideBenefitCount}개`} />
      </dl>

      <div>
        <p className="text-sm font-bold text-slate-900">지금·곧 볼 수 있는 행사</p>
        {!events ? (
          <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">행사 정보를 불러오는 중이에요.</p>
        ) : events.featured.length > 0 ? (
          <ul className="mt-1">
            {events.featured.map((event) => (
              <li key={event.id} className="border-b border-slate-200 py-3 last:border-b-0">
                <Link href={`/events/${event.id}`} className="line-clamp-2 text-[15px] font-semibold leading-snug text-slate-900 hover:text-sky-700">
                  {event.title}
                </Link>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                  {event.isOngoing ? (
                    <span className="rounded-full bg-cyan-50 px-2 py-0.5 font-bold text-cyan-700">진행 중</span>
                  ) : null}
                  {event.isFree ? (
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 font-bold text-sky-700">무료</span>
                  ) : null}
                  <span className="tabular-nums">{formatShortPeriod(event)}</span>
                  <span>{event.venue}</span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            지금 볼 수 있는 행사가 없어요. 혜택과 먹거리부터 확인해 보세요.
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Link
          href={links.primary.href}
          className="flex min-h-12 items-center justify-between rounded-full bg-slate-950 px-5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          {PRIMARY_LABELS[links.primary.kind](entry.name)} <span aria-hidden="true">↗</span>
        </Link>
        <div className="flex flex-wrap gap-2">
          {secondaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={SECONDARY_LINK_CLASS}
            >
              {link.label} <span aria-hidden="true">↗</span>
            </Link>
          ))}
          {links.food.isExternal ? (
            <a
              href={links.food.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${entry.name} 먹거리 후보 카카오맵에서 찾기 (새 창)`}
              className={SECONDARY_LINK_CLASS}
            >
              먹거리 카카오맵 <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <Link
              href={links.food.href}
              className={SECONDARY_LINK_CLASS}
            >
              먹거리 후보 {entry.food.placeCount}곳 <span aria-hidden="true">↗</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
