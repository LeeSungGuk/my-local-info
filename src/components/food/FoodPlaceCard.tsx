import type { FoodPlace } from "@/lib/food";
import { getFoodPlaceMapSearchUrl } from "@/lib/food";

export default function FoodPlaceCard({ place }: { place: FoodPlace }) {
  const address = place.roadAddress || place.address || "주소 정보 없음";
  const updatedAt = place.updatedAt || place.licenseDate || "";

  return (
    <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
          {place.status}
        </span>
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {place.category}
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 text-lg font-extrabold text-slate-950">
        {place.name}
      </h3>
      <p className="mt-2 text-sm font-semibold text-emerald-700">
        {[place.district, place.area].filter(Boolean).join(" · ")}
      </p>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
        {address}
      </p>
      <dl className="mt-4 grid gap-2 text-xs text-slate-500">
        {place.licenseDate ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="font-semibold text-slate-500">인허가일</dt>
            <dd className="font-bold text-slate-700">{place.licenseDate}</dd>
          </div>
        ) : null}
        {updatedAt ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="font-semibold text-slate-500">데이터 갱신</dt>
            <dd className="font-bold text-slate-700">{updatedAt}</dd>
          </div>
        ) : null}
      </dl>
      <a
        href={getFoodPlaceMapSearchUrl(place)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white transition-colors hover:bg-slate-950"
      >
        카카오맵에서 확인
        <span aria-hidden="true" className="ml-1">
          ↗
        </span>
      </a>
    </article>
  );
}
