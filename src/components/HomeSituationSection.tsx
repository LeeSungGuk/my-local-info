import Link from "next/link";
import type { SituationGuide, SituationAccent } from "@/lib/situations";

const accentClasses: Record<SituationAccent, string> = {
  sky: "border-sky-200 bg-sky-50 text-sky-700",
  teal: "border-teal-200 bg-teal-50 text-teal-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
};

const situationQuestions: Record<SituationGuide["slug"], string> = {
  kids: "아이와 움직이나요?",
  "rainy-day": "비가 오나요?",
  free: "비용을 줄이고 싶나요?",
};

export default function HomeSituationSection({
  situations,
}: {
  situations: SituationGuide[];
}) {
  return (
    <section id="situations" className="border-b border-sky-100/70 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-bold tracking-[0.14em] text-sky-600">
              코스 고르기
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              지금 조건에 가까운 선택지부터 보세요
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-500">
            장소 목록보다 먼저 필요한 기준을 좁히면 검색 시간이 줄어듭니다.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {situations.map((situation) => {
            const searchHref = `/search?q=${encodeURIComponent(
              situation.searchIntent
            )}`;

            return (
              <article
                key={situation.slug}
                className="flex min-h-[250px] flex-col rounded-lg border border-slate-200 bg-slate-50/60 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${accentClasses[situation.accent]}`}
                  >
                    {situation.eyebrow}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {situation.searchIntent}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-950">
                  {situationQuestions[situation.slug]}
                </h3>
                <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
                  {situation.summary}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {situation.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">
                  <Link
                    href={searchHref}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-sky-700 px-4 text-sm font-bold text-white transition-colors hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  >
                    통합 검색 보기
                  </Link>
                  <Link
                    href={situation.href}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  >
                    기준 읽기
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
