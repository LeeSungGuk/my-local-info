import Link from "next/link";
import type { PublicBenefitSummary } from "@/lib/public-benefits";
import { formatBenefitDeadline } from "@/lib/benefit-utils";

export default function HomeBenefitsSection({ benefits }: { benefits: PublicBenefitSummary[] }) {
  if (benefits.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-10 text-center">
        <p className="text-lg font-semibold text-gray-900">혜택 데이터가 아직 없습니다.</p>
        <p className="mt-2 text-sm text-gray-600">
          공공데이터포털 혜택 데이터를 수집하면 이 영역에 자동으로 반영됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {benefits.map((benefit, index) => (
        <div
          key={benefit.id}
          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(59,130,246,0.10)]"
          style={{ animationDelay: `${index * 0.12}s` }}
        >
          <div className="flex items-start justify-between p-1 pl-6 pt-6">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                {benefit.field}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {benefit.district}
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col px-6 pb-6 pt-3">
            <h3 className="mb-3 line-clamp-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-800 sm:text-2xl">
              {benefit.title}
            </h3>

            <p className="mb-4 text-sm font-medium text-slate-500">{benefit.provider}</p>

            <div className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700">
              <span className="text-xl">🎯</span>
              <span className="line-clamp-2">{benefit.targetSummary}</span>
            </div>

            <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-600">{benefit.summary}</p>

            <div className="mb-6 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <span className="text-blue-500">⏰</span>
                <span>{formatBenefitDeadline(benefit)}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500">🏛️</span>
                <span>{benefit.receptionAgency}</span>
              </div>
            </div>

            <Link
              href={`/benefits/${benefit.id}`}
              className="inline-flex items-center text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              자세히 보기
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
        </div>
      ))}
    </div>
  );
}
