"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { filterSearchItems, getSearchDistricts } from "@/lib/search-utils";
import type { SearchFilters, SearchIndexData, SearchIndexItem } from "@/lib/search-types";

const EMPTY_INDEX: SearchIndexData = {
  generatedAt: "",
  counts: {
    event: 0,
    benefit: 0,
    blog: 0,
  },
  items: [],
};

const SEARCH_TYPE_OPTIONS = [
  { label: "전체", value: "all" },
  { label: "행사", value: "event" },
  { label: "혜택", value: "benefit" },
  { label: "블로그", value: "blog" },
] as const;

function typeClassName(type: SearchIndexItem["type"]) {
  switch (type) {
    case "event":
      return "bg-sky-100 text-sky-700";
    case "benefit":
      return "bg-blue-100 text-blue-700";
    case "blog":
      return "bg-indigo-100 text-indigo-700";
  }
}

function cardAccentClassName(type: SearchIndexItem["type"]) {
  switch (type) {
    case "event":
      return "from-sky-400 to-blue-500";
    case "benefit":
      return "from-blue-400 to-indigo-500";
    case "blog":
      return "from-cyan-400 to-sky-500";
  }
}

export default function SearchResultsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [index, setIndex] = useState<SearchIndexData>(EMPTY_INDEX);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch("/data/search/index.json")
      .then((response) => response.json())
      .then((data: SearchIndexData) => {
        if (isMounted) {
          setIndex(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIndex(EMPTY_INDEX);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filters: SearchFilters = {
    query: searchParams.get("q") || "",
    type: (searchParams.get("type") as SearchFilters["type"]) || "all",
    district: searchParams.get("district") || "전체 지역",
    activeOnly: searchParams.get("active") !== "0",
  };

  const results = filterSearchItems(index.items, filters);
  const districtBaseItems = filterSearchItems(index.items, {
    ...filters,
    district: "전체 지역",
  });
  const districts = getSearchDistricts(districtBaseItems);
  const hasQuery = filters.query.trim().length > 0;
  const selectedTypeLabel =
    SEARCH_TYPE_OPTIONS.find((option) => option.value === filters.type)?.label ?? "전체";
  const activeSummaryItems = [
    hasQuery ? `검색어: ${filters.query}` : "검색어 없음",
    filters.type === "all" ? "유형: 전체" : `유형: ${selectedTypeLabel}`,
    filters.district === "전체 지역" ? "지역: 전체" : `지역: ${filters.district}`,
    filters.activeOnly ? "현재 참고 가능한 정보만" : "모든 상태 포함",
  ];
  const mobileFilterSummary = [
    filters.type === "all" ? "전체 유형" : selectedTypeLabel,
    filters.district,
    filters.activeOnly ? "현재 정보만" : "전체 상태",
  ].join(" · ");

  function updateParams(next: Partial<SearchFilters>) {
    const params = new URLSearchParams(searchParams.toString());

    const nextQuery = next.query ?? filters.query;
    const nextType = next.type ?? filters.type;
    const nextDistrict = next.district ?? filters.district;
    const nextActiveOnly = next.activeOnly ?? filters.activeOnly;

    if (nextQuery) {
      params.set("q", nextQuery);
    } else {
      params.delete("q");
    }

    if (nextType && nextType !== "all") {
      params.set("type", nextType);
    } else {
      params.delete("type");
    }

    if (nextDistrict && nextDistrict !== "전체 지역") {
      params.set("district", nextDistrict);
    } else {
      params.delete("district");
    }

    if (nextActiveOnly) {
      params.delete("active");
    } else {
      params.set("active", "0");
    }

    const queryString = params.toString();
    setIsMobileFiltersOpen(false);
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function renderFilterPanel() {
    return (
      <>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            updateParams({ query: String(formData.get("query") || "").trim() });
          }}
        >
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            검색어
          </label>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 text-slate-400 shadow-sm ring-1 ring-slate-200/70">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                />
              </svg>
              <input
                key={filters.query}
                name="query"
                type="search"
                defaultValue={filters.query}
                placeholder="성동구 무료 전시, 청년 혜택"
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
            >
              이 조건으로 검색
            </button>
          </div>
        </form>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">유형</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SEARCH_TYPE_OPTIONS.map((option) => {
              const isActive = filters.type === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateParams({ type: option.value as SearchFilters["type"] })}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">지역</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["전체 지역", ...districts].map((district) => {
              const isActive = filters.district === district;

              return (
                <button
                  key={district}
                  type="button"
                  onClick={() => updateParams({ district })}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {district}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={filters.activeOnly}
              onChange={(event) => updateParams({ activeOnly: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-sky-600"
            />
            진행 중이거나 현재 참고 가능한 정보만 보기
          </label>
        </div>
      </>
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
            <p className="text-sm font-semibold text-slate-900">검색 필터</p>
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
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-sky-700">
                {hasQuery ? "현재 검색어" : "통합 검색"}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {hasQuery ? (
                  <>
                    <span className="text-slate-500">“</span>
                    {filters.query}
                    <span className="text-slate-500">”</span> 검색 결과
                  </>
                ) : (
                  "원하는 서울 정보를 바로 찾아보세요"
                )}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                행사, 혜택, 블로그를 한 번에 검색합니다. 지역과 유형을 함께 좁히면 더 빨리 찾을 수 있습니다.
              </p>
            </div>
            <div className="rounded-2xl bg-sky-50 px-4 py-3 text-right text-sm font-semibold text-sky-700">
              검색 결과 {results.length}건
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {activeSummaryItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {!filters.query.trim() ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-slate-900">찾고 싶은 서울 정보를 검색해 보세요.</p>
            <p className="mt-2 text-sm text-slate-600">
              예: 성동구 무료 전시, 청년 혜택, 비 오는 날 실내 코스
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-slate-900">조건에 맞는 검색 결과가 없습니다.</p>
            <p className="mt-2 text-sm text-slate-600">
              검색어를 조금 더 넓게 쓰거나 지역/유형 필터를 풀어보세요.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {results.map((item) => (
              <article
                key={`${item.type}-${item.id}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(56,189,248,0.10)]"
              >
                <div className={`h-1 bg-gradient-to-r ${cardAccentClassName(item.type)}`} />
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${typeClassName(item.type)}`}
                    >
                      {item.typeLabel}
                    </span>
                    {item.category ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                        {item.category}
                      </span>
                    ) : null}
                    {item.district ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                        {item.district}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-4 text-xl font-bold leading-snug text-slate-900">{item.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{item.summary}</p>

                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                      <span className="text-sky-500">🗂️</span>
                      <span>{item.provider || item.venue || item.dateLabel || "추가 정보 없음"}</span>
                    </div>
                    {item.dateLabel ? (
                      <div className="mt-2 flex items-start gap-2">
                        <span className="text-sky-500">📅</span>
                        <span>{item.dateLabel}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <Link href={item.href} className="text-sm font-semibold text-sky-700 hover:text-sky-800">
                      자세히 보기
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
