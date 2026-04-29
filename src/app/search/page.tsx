import { Suspense } from "react";
import SearchResultsView from "@/components/SearchResultsView";

export const metadata = {
  title: "통합 검색 | 서울시티",
  description: "서울시 행사, 혜택, 먹거리, 블로그를 한 번에 검색하세요.",
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-16 pt-10 sm:pt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
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
