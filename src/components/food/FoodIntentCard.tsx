import type { FoodIntent } from "@/lib/food";
import { buildKakaoMapSearchUrl } from "@/lib/food";

export default function FoodIntentCard({ intent }: { intent: FoodIntent }) {
  return (
    <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
          {intent.category}
        </span>
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {intent.districtName}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-extrabold text-slate-950">
        {intent.title}
      </h3>
      <p className="mt-2 text-sm font-semibold text-emerald-700">
        {intent.area}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {intent.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {intent.bestFor.map((label) => (
          <span
            key={label}
            className="rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600"
          >
            {label}
          </span>
        ))}
      </div>
      <a
        href={buildKakaoMapSearchUrl(intent.searchQuery)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
      >
        카카오맵에서 검색
        <span aria-hidden="true" className="ml-1">
          ↗
        </span>
      </a>
    </article>
  );
}
