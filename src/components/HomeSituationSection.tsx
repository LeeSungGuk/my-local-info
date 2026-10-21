import Link from "next/link";
import type { SituationGuide } from "@/lib/situations";
import SeoulCover from "./design/SeoulCover";

export default function HomeSituationSection({ situations }: { situations: SituationGuide[] }) {
  return (
    <section id="situations" className="home-section">
      <div className="home-section-top">
        <div>
          <p className="eyebrow">A DAY FOR EVERY MOMENT</p>
          <h2 className="section-heading">어떤 하루를 보내고 싶나요?</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">지금 내 상황에 가까운 서울부터 만나보세요.</p>
        </div>
        <span className="hidden text-xs text-slate-500 sm:block">상황별 가이드 <span className="ml-2 rounded-full border border-slate-200 px-2 py-1">0{situations.length}</span></span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-7">
        {situations.map((situation) => (
          <article key={situation.slug} className="editorial-card">
            <Link href={situation.href} className="block" aria-label={situation.title + " 가이드 보기"}><SeoulCover kind={situation.slug} /></Link>
            <div className="px-1 pt-5">
              <p className="text-[11px] font-semibold text-sky-700">{situation.eyebrow}</p>
              <h3 className="mt-2 text-base font-bold tracking-tight sm:text-lg"><Link href={situation.href} className="hover:text-sky-700">{situation.cardTitle}</Link></h3>
              <p className="mt-3 line-clamp-3 text-xs leading-6 text-slate-500 sm:text-sm sm:leading-7">{situation.summary}</p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-x-2 border-t border-slate-200 pt-2">
                <Link href={situation.href} className="section-link">기준 읽기 <span aria-hidden="true">↗</span></Link>
                <Link href={"/search?q=" + encodeURIComponent(situation.searchIntent)} className="section-link">통합 검색 보기 <span aria-hidden="true">→</span></Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
