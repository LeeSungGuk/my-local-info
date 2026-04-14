"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useState } from "react";
import { getSuggestionItems } from "@/lib/search-utils";
import type { SearchIndexData } from "@/lib/search-types";

const EMPTY_INDEX: SearchIndexData = {
  generatedAt: "",
  counts: {
    event: 0,
    benefit: 0,
    blog: 0,
  },
  items: [],
};

function typeBadgeClassName(type: string) {
  switch (type) {
    case "event":
      return "bg-sky-100 text-sky-700";
    case "benefit":
      return "bg-blue-100 text-blue-700";
    case "blog":
      return "bg-indigo-100 text-indigo-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function HomeUnifiedSearch() {
  const router = useRouter();
  const [index, setIndex] = useState<SearchIndexData>(EMPTY_INDEX);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);

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

  const suggestions = deferredQuery.trim()
    ? getSuggestionItems(index.items, deferredQuery, 6)
    : [];

  function submitSearch() {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    setIsOpen(false);
  }

  return (
    <div className="relative z-30 mx-auto mt-10 max-w-3xl">
      <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-3 shadow-[0_18px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch();
          }}
          className="relative isolate"
        >
          <div className="flex flex-col gap-3 rounded-[1.2rem] bg-white px-4 py-4 text-slate-900 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 text-slate-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                />
              </svg>
            </div>

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setIsOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setIsOpen(false), 120);
              }}
              placeholder="성동구 무료 전시, 청년 혜택, 비 오는 날 실내 코스"
              className="w-full bg-transparent text-base outline-none placeholder:text-slate-400"
            />

            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
            >
              통합 검색
            </button>
          </div>

          {isOpen && suggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
              <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                빠른 검색 결과
              </div>
              <div className="divide-y divide-slate-100">
                {suggestions.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={item.href}
                    className="block px-4 py-3 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${typeBadgeClassName(item.type)}`}>
                            {item.typeLabel}
                          </span>
                          {item.district ? (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                              {item.district}
                            </span>
                          ) : null}
                        </div>
                        {item.dateLabel ? (
                          <div className="shrink-0 pt-0.5 text-xs text-slate-400">
                            {item.dateLabel}
                          </div>
                        ) : null}
                      </div>
                      <p className="w-full truncate text-left text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="w-full truncate text-left text-xs text-slate-500">
                        {item.summary}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 px-1 text-xs text-sky-100">
          <span className="rounded-full bg-white/10 px-3 py-1">행사 {index.counts.event}건</span>
          <span className="rounded-full bg-white/10 px-3 py-1">혜택 {index.counts.benefit}건</span>
          <span className="rounded-full bg-white/10 px-3 py-1">블로그 {index.counts.blog}건</span>
        </div>
      </div>
    </div>
  );
}
