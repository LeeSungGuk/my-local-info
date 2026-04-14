import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개",
  description: "사이트 운영 목적, 데이터 출처, AI 활용 방식에 대해 안내합니다.",
};

export default function AboutPage() {
  return (
    <article className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fbff_18%,#ffffff_48%)] pb-24 pt-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-[2rem] border border-sky-100 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-12">
          <p className="text-sm font-semibold text-sky-700">소개</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
            지역 주민이 실제로 참고할 수 있는 생활 정보를 더 보기 쉽게 정리합니다
          </h1>

          <div className="mt-10 space-y-8 text-slate-700">
            <section>
              <h2 className="text-xl font-bold text-slate-900">운영 목적</h2>
              <p className="mt-3 leading-7">
                이 사이트는 지역 주민이 행사, 생활 혜택, 공공정보를 더 빠르게 찾을 수 있도록 돕기 위해 운영됩니다.
                흩어져 있는 정보를 한곳에 모아, 지금 확인할 가치가 있는 정보부터 우선적으로 보여주는 것을 목표로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">데이터 출처</h2>
              <p className="mt-3 leading-7">
                주요 데이터는 공공데이터포털과 서울 열린데이터광장 등 공공기관이 공개한 자료를 바탕으로 수집합니다.
                각 상세 페이지와 콘텐츠 하단에는 가능한 범위에서 원문 링크와 기준 시점을 함께 표시합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">콘텐츠 생성 방식</h2>
              <p className="mt-3 leading-7">
                일부 블로그 콘텐츠는 공공기관 공개 정보와 생활형 주제를 바탕으로 AI를 활용해 작성합니다.
                다만 실제 신청 조건, 운영 시간, 이용 기준은 원문과 다를 수 있으므로 최종 정보는 반드시 공식 사이트에서 다시 확인해야 합니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
