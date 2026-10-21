import type { FoodIntent } from "@/lib/food";
import { buildKakaoMapSearchUrl } from "@/lib/food";

export default function FoodIntentCard({ intent }: { intent: FoodIntent }) {
  return (
    <article className="food-intent-card">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-sky-700">
          {intent.category}
        </span>
        <span aria-hidden="true" className="text-slate-300">/</span>
        <span className="text-slate-500">
          {intent.districtName}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-950">
        {intent.title}
      </h3>
      <p className="mt-2 text-sm font-medium text-slate-700">
        {intent.area}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {intent.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 pb-6">
        {intent.bestFor.map((label) => (
          <span
            key={label}
            className="rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
          >
            {label}
          </span>
        ))}
      </div>
      <a
        href={buildKakaoMapSearchUrl(intent.searchQuery)}
        target="_blank"
        rel="noopener noreferrer"
        className="section-link mt-auto justify-between border-t border-slate-200 pt-3"
        aria-label={`${intent.title} 카카오맵에서 검색 (새 창)`}
      >
        카카오맵에서 검색
        <span aria-hidden="true">
          ↗
        </span>
      </a>
    </article>
  );
}
