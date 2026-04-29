import Link from "next/link";
import { formatBenefitDeadline } from "@/lib/benefit-utils";
import type { PublicBenefitSummary } from "@/lib/public-benefits";

export default function DistrictMiniBenefitCard({
  benefit,
}: {
  benefit: PublicBenefitSummary;
}) {
  return (
    <article className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
          {benefit.field || "생활 혜택"}
        </span>
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {benefit.district || "서울"}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-base font-bold leading-6 text-slate-950">
        <Link href={`/benefits/${benefit.id}`} className="hover:text-blue-700">
          {benefit.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm font-semibold text-blue-700">
        {formatBenefitDeadline(benefit)}
      </p>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
        {benefit.supportSummary || benefit.summary || benefit.targetSummary}
      </p>

      <Link
        href={`/benefits/${benefit.id}`}
        className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-blue-700 transition-colors hover:text-blue-900"
      >
        신청 정보 보기
        <span aria-hidden="true" className="ml-1">
          →
        </span>
      </Link>
    </article>
  );
}
