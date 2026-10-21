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
    food: 0,
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
    case "food":
      return "bg-emerald-100 text-emerald-700";
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
    <div className="relative z-30 mx-auto max-w-xl text-left">
      <div className="relative">
        <div className="home-search-shell">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
            className="relative isolate"
          >
            <div className="flex items-center gap-2 px-2 text-slate-900">
              <div className="flex min-h-11 min-w-0 flex-1 items-center gap-2 text-slate-400">
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  />
                </svg>
                <span className="sr-only">통합 검색</span>

                <input
                  type="text"
                  inputMode="search"
                  autoComplete="off"
                  aria-label="통합 검색"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={() => setIsOpen(true)}
                  onBlur={() => {
                    window.setTimeout(() => setIsOpen(false), 120);
                  }}
                  placeholder="지역, 행사, 가고 싶은 곳"
                  className="min-h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />

                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setIsOpen(false);
                    }}
                    className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                    aria-label="검색어 지우기"
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 6l12 12M18 6L6 18"
                      />
                    </svg>
                  </button>
                ) : null}
              </div>

              <button
                type="submit"
                className="button-primary shrink-0 !px-4"
              >
                통합 검색
              </button>
            </div>
          </form>
        </div>

        {isOpen && suggestions.length > 0 ? (
          <div className="search-suggestions absolute left-0 right-0 top-full z-50 mt-2 max-h-[min(28rem,calc(100dvh-9rem))] overflow-y-auto">
            <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              빠른 검색 결과
            </div>
            <div className="divide-y divide-slate-100">
              {suggestions.map((item) => {
                const content = (
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
                );

                if (item.isExternal) {
                  return (
                    <a
                      key={`${item.type}-${item.id}`}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-3 transition-colors hover:bg-slate-50"
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={item.href}
                    className="block px-4 py-3 transition-colors hover:bg-slate-50"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

    </div>
  );
}
