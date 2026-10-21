import Link from "next/link";
import type { PublicBenefitSummary } from "@/lib/public-benefits";
import { formatBenefitDeadline } from "@/lib/benefit-utils";

export default function HomeBenefitsSection({ benefits }: { benefits: PublicBenefitSummary[] }) {
  if (benefits.length === 0) {
    return <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">혜택 데이터가 아직 없습니다.</div>;
  }
  return (
    <div className="grid gap-x-10 gap-y-4 md:grid-cols-2">
      {benefits.map((benefit, index) => (
        <article key={benefit.id} className="group flex min-w-0 gap-5 border-t border-slate-200 py-6">
          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 font-serif text-sm text-sky-600">0{index + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-blue-700">{benefit.field} <span className="mx-1 text-slate-300">/</span> {benefit.district}</p>
            <h3 className="mt-2 text-base font-bold leading-7 tracking-tight"><Link href={"/benefits/" + benefit.id} className="hover:text-blue-700">{benefit.title}</Link></h3>
            <p className="mt-2 text-xs text-slate-500">{benefit.provider}</p>
            <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-600">{benefit.targetSummary}</p>
            <p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-500">{benefit.summary}</p>
            <p className="mt-3 text-xs leading-6 text-slate-500">{formatBenefitDeadline(benefit)}</p>
            <p className="text-xs leading-6 text-slate-500">{benefit.receptionAgency}</p>
            <Link href={"/benefits/" + benefit.id} className="section-link mt-2">자세히 보기 <span aria-hidden="true">↗</span></Link>
          </div>
        </article>
      ))}
    </div>
  );
}
