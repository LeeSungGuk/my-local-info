import type { FoodPlace } from "@/lib/food";
import { getFoodPlaceMapSearchUrl } from "@/lib/food";

export default function FoodPlaceCard({ place }: { place: FoodPlace }) {
  const address = place.roadAddress || place.address || "주소 정보 없음";
  const updatedAt = place.updatedAt || place.licenseDate || "";

  return (
    <article className="food-place-card">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-medium text-slate-600">
          {place.category}
        </span>
        <span className="flex items-center gap-1.5 text-slate-600">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
          {place.status}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-950">
        {place.name}
      </h3>
      <p className="mt-2 text-xs font-medium text-sky-700">
        {[place.district, place.area].filter(Boolean).join(" · ")}
      </p>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        {address}
      </p>
      <dl className="mt-auto grid gap-2 pt-6 text-xs text-slate-500">
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
        className="button-primary mt-6 self-start"
        aria-label={`${place.name} 카카오맵에서 확인 (새 창)`}
      >
        카카오맵에서 확인
        <span aria-hidden="true" className="ml-1">
          ↗
        </span>
      </a>
    </article>
  );
}
