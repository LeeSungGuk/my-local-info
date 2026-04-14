"use client";

import Link from "next/link";
import { useState } from "react";
import type { PublicBenefitSummary } from "@/lib/public-benefits";
import { formatBenefitDeadline } from "@/lib/benefit-utils";

const ALL_FIELDS = "전체 분야";
const ALL_DISTRICTS = "전체 지역";
const INITIAL_VISIBLE_COUNT = 24;

export default function BenefitsCatalog({ benefits }: { benefits: PublicBenefitSummary[] }) {
  const [selectedField, setSelectedField] = useState(ALL_FIELDS);
  const [selectedDistrict, setSelectedDistrict] = useState(ALL_DISTRICTS);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const fieldCounts = benefits.reduce<Record<string, number>>((acc, benefit) => {
    acc[benefit.field] = (acc[benefit.field] || 0) + 1;
    return acc;
  }, {});

  const districtCounts = benefits.reduce<Record<string, number>>((acc, benefit) => {
    acc[benefit.district] = (acc[benefit.district] || 0) + 1;
    return acc;
  }, {});

  const fields = Object.keys(fieldCounts).sort((a, b) => a.localeCompare(b, "ko"));
  const districts = Object.keys(districtCounts).sort((a, b) => a.localeCompare(b, "ko"));

  const benefitsByField =
    selectedField === ALL_FIELDS ? benefits : benefits.filter((benefit) => benefit.field === selectedField);
  const filteredBenefits =
    selectedDistrict === ALL_DISTRICTS
      ? benefitsByField
      : benefitsByField.filter((benefit) => benefit.district === selectedDistrict);
  const visibleBenefits = filteredBenefits.slice(0, visibleCount);

  function selectField(field: string) {
    setSelectedField(field);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }

  function selectDistrict(district: string) {
    setSelectedDistrict(district);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }

  return (
    <div>
      <div className="rounded-[2rem] border border-amber-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">분야와 지역으로 빠르게 보기</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              서울시와 자치구, 서울 공공기관이 제공하는 혜택만 모아두었습니다.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {selectedField === ALL_FIELDS && selectedDistrict === ALL_DISTRICTS
              ? `전체 ${benefits.length}건`
              : `${filteredBenefits.length}건`}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">분야</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <FilterChip
              label={ALL_FIELDS}
              count={benefits.length}
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
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">지역</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <FilterChip
              label={ALL_DISTRICTS}
              count={benefits.length}
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
      </div>

      {filteredBenefits.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-amber-200 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-gray-900">선택한 조건에 맞는 혜택이 없습니다.</p>
          <p className="mt-2 text-sm text-gray-600">다른 분야나 지역을 선택해 주세요.</p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleBenefits.map((benefit) => (
              <article
                key={benefit.id}
                className="overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {benefit.field}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      {benefit.district}
                    </span>
                  </div>

                  <h3 className="mt-4 line-clamp-2 text-xl font-bold leading-snug text-gray-900">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-sm font-medium text-gray-500">{benefit.provider}</p>

                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
                    {benefit.summary}
                  </p>

                  <div className="mt-5 space-y-2 rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-500">⏰</span>
                      <span>{formatBenefitDeadline(benefit)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-500">🎯</span>
                      <span className="line-clamp-2">{benefit.targetSummary}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-500">🏛️</span>
                      <span>{benefit.receptionAgency}</span>
                    </div>
                  </div>

                  <Link
                    href={`/benefits/${benefit.id}`}
                    className="mt-6 inline-flex items-center text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700"
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

          {filteredBenefits.length > visibleCount ? (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + INITIAL_VISIBLE_COUNT)}
                className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100"
              >
                더 보기
              </button>
            </div>
          ) : null}
        </>
      )}
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
          ? "border-amber-500 bg-amber-500 text-white"
          : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
      }`}
    >
      {label} {count}
    </button>
  );
}
