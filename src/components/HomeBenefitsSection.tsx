import Link from "next/link";
import type { PublicBenefitSummary } from "@/lib/public-benefits";
import { formatBenefitDeadline } from "@/lib/benefit-utils";

export default function HomeBenefitsSection({ benefits }: { benefits: PublicBenefitSummary[] }) {
  if (benefits.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-amber-200 bg-white p-10 text-center">
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
          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          style={{ animationDelay: `${index * 0.12}s` }}
        >
          <div className="flex items-start justify-between p-1 pl-6 pt-6">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                {benefit.field}
              </span>
              <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                {benefit.district}
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col px-6 pb-6 pt-3">
            <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-amber-600 sm:text-2xl">
              {benefit.title}
            </h3>

            <p className="mb-4 text-sm font-medium text-gray-500">{benefit.provider}</p>

            <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-100/50 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-sm font-medium text-gray-700">
              <span className="text-xl">🎯</span>
              <span className="line-clamp-2">{benefit.targetSummary}</span>
            </div>

            <p className="mb-5 flex-1 text-sm leading-relaxed text-gray-600">{benefit.summary}</p>

            <div className="mb-6 space-y-2 rounded-xl bg-gray-50/50 p-4 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="text-amber-500">⏰</span>
                <span>{formatBenefitDeadline(benefit)}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-500">🏛️</span>
                <span>{benefit.receptionAgency}</span>
              </div>
            </div>

            <Link
              href={`/benefits/${benefit.id}`}
              className="inline-flex items-center text-sm font-semibold text-amber-600 hover:text-amber-700"
            >
              자세히 보기
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="h-1 bg-amber-400/20 transition-colors group-hover:bg-amber-400" />
        </div>
      ))}
    </div>
  );
}
