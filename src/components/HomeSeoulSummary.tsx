import Link from "next/link";
import type { HomeSummaryMetrics } from "@/lib/home-summary";

interface HomeSeoulSummaryProps {
  summary: HomeSummaryMetrics;
}

function formatCount(count: number) {
  return `${count.toLocaleString("ko-KR")}개`;
}

export default function HomeSeoulSummary({ summary }: HomeSeoulSummaryProps) {
  const cards = [
    {
      label: "오늘 진행 중 행사",
      value: formatCount(summary.ongoingEventsCount),
      note: `${summary.today} 기준 현재 열려 있는 일정`,
      accentClassName: "border-sky-200 bg-sky-50/80 text-sky-700",
      href: "/events?view=ongoing",
    },
    {
      label: "이번 주 마감 혜택",
      value: formatCount(summary.closingBenefitsThisWeekCount),
      note: `${summary.weekEnd} 안에 마감되는 혜택`,
      accentClassName: "border-blue-200 bg-blue-50/80 text-blue-700",
      href: "/benefits?view=closing-this-week",
    },
    {
      label: "무료 행사",
      value: formatCount(summary.freeEventsCount),
      note: "오늘 이후 참여 가능한 무료 일정",
      accentClassName: "border-cyan-200 bg-cyan-50/80 text-cyan-700",
      href: "/events?view=free",
    },
    {
      label: "실내 추천",
      value: formatCount(summary.indoorRecommendationsCount),
      note: "실내 공간 중심으로 바로 둘러볼 일정",
      accentClassName: "border-indigo-200 bg-indigo-50/80 text-indigo-700",
      href: "/events?view=indoor",
    },
  ];

  return (
    <section className="home-section">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/50">
        <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-sky-700">오늘의 서울 요약</p>
              <h2 className="mt-2 text-xl font-bold leading-relaxed tracking-tight text-slate-950 sm:text-2xl">
                지금 바로 볼 가치가 있는 정보만 먼저 모았습니다
              </h2>
            </div>
            <p className="text-sm text-slate-500">{summary.today} 서울 시간 기준 자동 집계</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-slate-200 lg:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="group block bg-background px-4 py-5 transition-colors hover:bg-slate-50 sm:px-7"
            >
              <article>
                <div className={`inline-flex text-[11px] font-semibold ${card.accentClassName}`}>
                  {card.label}
                </div>
                <p className="mt-3 font-serif text-4xl tracking-tight text-slate-950">
                  {card.value}
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-500">{card.note}</p>
                <p className="mt-4 inline-flex items-center text-sm font-semibold text-slate-700 transition-colors group-hover:text-sky-700">
                  바로 보기
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
