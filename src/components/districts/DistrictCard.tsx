import Link from "next/link";
import type { DistrictGuide } from "@/lib/districts";

export default function DistrictCard({ district }: { district: DistrictGuide }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-sky-100 bg-white/85 p-6 shadow-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_20px_48px_rgba(56,189,248,0.14)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-sky-600">서울 구별 가이드</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            {district.name}
          </h2>
        </div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
          {district.nearbyAreas[0]}
        </span>
      </div>

      <p className="mt-4 text-base font-semibold leading-relaxed text-slate-800">
        {district.headline}
      </p>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
        {district.summary}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {district.bestFor.map((label) => (
          <span
            key={label}
            className="rounded-full border border-sky-100 bg-sky-50/70 px-3 py-1 text-xs font-semibold text-sky-700"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-5 border-t border-sky-50 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          주요 권역
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {district.nearbyAreas.join(" · ")}
        </p>
      </div>

      <Link
        href={`/districts/${district.slug}`}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition-colors hover:bg-sky-700"
      >
        {district.name} 보기
      </Link>
    </article>
  );
}
