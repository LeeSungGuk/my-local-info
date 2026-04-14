import { Suspense } from "react";
import SearchResultsView from "@/components/SearchResultsView";

export const metadata = {
  title: "통합 검색 | 서울시티",
  description: "서울시 행사, 혜택, 블로그를 한 번에 검색하세요.",
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-16 pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-10">
          <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
            서울 통합 검색
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            서울의 행사, 혜택, 정보글을
            <br />
            한 번에 찾아보세요
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            검색어 하나로 여러 영역을 함께 살펴보고, 지역과 유형 필터로 더 빠르게 좁힐 수 있습니다.
          </p>
        </header>
        <Suspense
          fallback={
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <p className="text-lg font-semibold text-slate-900">검색 화면을 준비하는 중입니다.</p>
              <p className="mt-2 text-sm text-slate-600">서울 통합 검색 인덱스를 불러오고 있습니다.</p>
            </div>
          }
        >
          <SearchResultsView />
        </Suspense>
      </div>
    </div>
  );
}
