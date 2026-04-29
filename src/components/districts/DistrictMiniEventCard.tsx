import Link from "next/link";
import { formatEventPeriod, type SeoulEventSummary } from "@/lib/seoul-events";

export default function DistrictMiniEventCard({
  event,
}: {
  event: SeoulEventSummary;
}) {
  return (
    <article className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition-all hover:border-sky-200 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700">
          {event.category || "행사"}
        </span>
        {event.isFree ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            무료
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 line-clamp-2 text-base font-bold leading-6 text-slate-950">
        <Link href={`/events/${event.id}`} className="hover:text-sky-700">
          {event.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm font-semibold text-sky-700">
        {formatEventPeriod(event)}
      </p>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
        {event.venue || event.district || "서울"}
      </p>

      <Link
        href={`/events/${event.id}`}
        className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-sky-700 transition-colors hover:text-sky-900"
      >
        상세 보기
        <span aria-hidden="true" className="ml-1">
          →
        </span>
      </Link>
    </article>
  );
}
