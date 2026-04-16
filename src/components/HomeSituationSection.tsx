import Link from "next/link";
import type { SituationGuide, SituationAccent } from "@/lib/situations";

const accentClasses: Record<SituationAccent, string> = {
  sky: "border-sky-100 bg-sky-50/80 text-sky-700 group-hover:border-sky-200",
  teal: "border-teal-100 bg-teal-50/80 text-teal-700 group-hover:border-teal-200",
  amber: "border-amber-100 bg-amber-50/80 text-amber-700 group-hover:border-amber-200",
};

export default function HomeSituationSection({
  situations,
}: {
  situations: SituationGuide[];
}) {
  return (
    <section id="situations" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-8 max-w-3xl sm:mb-10">
        <p className="mb-3 text-sm font-bold tracking-[0.18em] text-sky-600">
          SITUATION GUIDE
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          지금 상황에 맞는 서울 코스부터 고르세요
        </h2>
        <p className="mt-3 leading-7 text-slate-600">
          장소를 더 많이 나열하기보다, 아이와 가는지, 비가 오는지, 비용을 줄이고 싶은지에 따라 먼저 판단 기준을 정리했습니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {situations.map((situation) => (
          <Link
            key={situation.slug}
            href={situation.href}
            className="group rounded-[1.75rem] border border-slate-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(15,23,42,0.10)]"
          >
            <span
              className={`mb-5 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${accentClasses[situation.accent]}`}
            >
              {situation.eyebrow}
            </span>
            <h3 className="text-xl font-bold text-slate-950">{situation.cardTitle}</h3>
            <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
              {situation.summary}
            </p>
            <div className="mt-6 flex items-center text-sm font-bold text-sky-700 transition-transform group-hover:translate-x-1">
              기준 보고 고르기
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
