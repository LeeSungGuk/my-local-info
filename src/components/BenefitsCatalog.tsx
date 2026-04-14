"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { PublicBenefitSummary } from "@/lib/public-benefits";
import { formatBenefitDeadline } from "@/lib/benefit-utils";
import { getTodayInSeoul } from "@/lib/event-visibility";
import { getEndOfWeekInSeoul } from "@/lib/home-summary";

const ALL_FIELDS = "전체 분야";
const ALL_DISTRICTS = "전체 지역";
const INITIAL_VISIBLE_COUNT = 24;
const BENEFIT_VIEW_LABELS: Record<string, string> = {
  "closing-this-week": "이번 주 마감 혜택",
};

export default function BenefitsCatalog({ benefits }: { benefits: PublicBenefitSummary[] }) {
  const [selectedField, setSelectedField] = useState(ALL_FIELDS);
  const [selectedDistrict, setSelectedDistrict] = useState(ALL_DISTRICTS);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const searchParams = useSearchParams();
  const today = getTodayInSeoul();
  const weekEnd = getEndOfWeekInSeoul(today);
  const selectedView = searchParams.get("view") || "";

  const baseBenefits = benefits.filter((benefit) => {
    if (selectedView === "closing-this-week") {
      if (benefit.isAlwaysOpen) {
        return false;
      }

      if (!benefit.deadlineSortKey || benefit.deadlineSortKey === "9999-12-31") {
        return false;
      }

      return benefit.deadlineSortKey >= today && benefit.deadlineSortKey <= weekEnd;
    }

    return true;
  });

  const fieldCounts = baseBenefits.reduce<Record<string, number>>((acc, benefit) => {
    acc[benefit.field] = (acc[benefit.field] || 0) + 1;
    return acc;
  }, {});

  const districtCounts = baseBenefits.reduce<Record<string, number>>((acc, benefit) => {
    acc[benefit.district] = (acc[benefit.district] || 0) + 1;
    return acc;
  }, {});

  const fields = Object.keys(fieldCounts).sort((a, b) => a.localeCompare(b, "ko"));
  const districts = Object.keys(districtCounts).sort((a, b) => a.localeCompare(b, "ko"));

  const benefitsByField =
    selectedField === ALL_FIELDS ? baseBenefits : baseBenefits.filter((benefit) => benefit.field === selectedField);
  const filteredBenefits =
    selectedDistrict === ALL_DISTRICTS
      ? benefitsByField
      : benefitsByField.filter((benefit) => benefit.district === selectedDistrict);
  const visibleBenefits = filteredBenefits.slice(0, visibleCount);
  const hasMoreBenefits = filteredBenefits.length > visibleCount;

  function selectField(field: string) {
    setSelectedField(field);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }

  function selectDistrict(district: string) {
    setSelectedDistrict(district);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">분야와 지역으로 빠르게 보기</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              서울시와 자치구, 서울 공공기관이 제공하는 혜택만 모아두었습니다.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {selectedField === ALL_FIELDS && selectedDistrict === ALL_DISTRICTS
              ? `전체 ${baseBenefits.length}건`
              : `${filteredBenefits.length}건`}
          </div>
        </div>

        {BENEFIT_VIEW_LABELS[selectedView] ? (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm leading-relaxed text-blue-800">
            현재 보기: <strong>{BENEFIT_VIEW_LABELS[selectedView]}</strong>
            <Link href="/benefits" className="ml-2 font-semibold underline underline-offset-4">
              전체로 돌아가기
            </Link>
          </div>
        ) : null}

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Field</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <FilterChip
              label={ALL_FIELDS}
              count={baseBenefits.length}
              isActive={selectedField === ALL_FIELDS}
              onClick={selectField}
            />
            {fields.map((field) => (
              <FilterChip
                key={field}
                label={field}
                count={fieldCounts[field]}
                isActive={selectedField === field}
                onClick={selectField}
              />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">District</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <FilterChip
              label={ALL_DISTRICTS}
              count={baseBenefits.length}
              isActive={selectedDistrict === ALL_DISTRICTS}
              onClick={selectDistrict}
            />
            {districts.map((district) => (
              <FilterChip
                key={district}
                label={district}
                count={districtCounts[district]}
                isActive={selectedDistrict === district}
                onClick={selectDistrict}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
          분야와 지역을 함께 좁히면 생활에 맞는 혜택을 더 빠르게 찾을 수 있습니다.
        </div>
      </aside>

      <div>
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {selectedField === ALL_FIELDS ? "전체 분야" : selectedField} · {selectedDistrict === ALL_DISTRICTS ? "전체 지역" : selectedDistrict}
          </p>
          <p className="text-sm text-slate-500">{filteredBenefits.length}건</p>
        </div>

        {filteredBenefits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-gray-900">선택한 조건에 맞는 혜택이 없습니다.</p>
            <p className="mt-2 text-sm text-gray-600">다른 분야나 지역을 선택해 주세요.</p>
          </div>
        ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
            {visibleBenefits.map((benefit) => (
              <article
                key={benefit.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(59,130,246,0.10)]"
              >
                <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
                      {benefit.field}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                      {benefit.district}
                    </span>
                  </div>

                  <h3 className="mt-4 line-clamp-2 text-xl font-bold leading-snug text-slate-900">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-sm font-medium text-slate-500">{benefit.provider}</p>

                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {benefit.summary}
                  </p>

                  <div className="mt-5 space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500">⏰</span>
                      <span>{formatBenefitDeadline(benefit)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500">🎯</span>
                      <span className="line-clamp-2">{benefit.targetSummary}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500">🏛️</span>
                      <span>{benefit.receptionAgency}</span>
                    </div>
                  </div>

                  <Link
                    href={`/benefits/${benefit.id}`}
                    className="mt-6 inline-flex items-center text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800"
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

          {hasMoreBenefits ? (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + INITIAL_VISIBLE_COUNT)}
                className="inline-flex items-center rounded-full border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
              >
                혜택 더 보기
                <span className="ml-2 text-slate-400">
                  {visibleBenefits.length}/{filteredBenefits.length}
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

function FilterChip({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: (value: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(label)}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
        isActive
          ? "border-blue-500 bg-blue-500 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      {label} {count}
    </button>
  );
}
