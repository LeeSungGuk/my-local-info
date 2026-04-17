import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개",
  description:
    "서울 나들이, 산책, 가족 외출, 무료·저비용 코스 선택을 돕는 사이트 운영 목적을 안내합니다.",
};

export default function AboutPage() {
  return (
    <article className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fbff_18%,#ffffff_48%)] pb-24 pt-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-[2rem] border border-sky-100 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-12">
          <p className="text-sm font-semibold text-sky-700">소개</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
            서울 나들이 코스를 상황에 맞게 고를 수 있도록 정리합니다
          </h1>

          <div className="mt-10 space-y-8 text-slate-700">
            <section>
              <h2 className="text-xl font-bold text-slate-900">운영 목적</h2>
              <p className="mt-3 leading-7">
                이 사이트는 서울에서 아이와 갈 곳, 산책하기 좋은 곳, 비 오는 날 들를 곳, 무료·저비용 코스를
                더 쉽게 고를 수 있도록 돕기 위해 운영됩니다. 흩어져 있는 공식 정보와 생활형 콘텐츠를 함께 정리해,
                지금 상황에 맞는 선택지를 빠르게 비교할 수 있게 하는 것을 목표로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">데이터 출처</h2>
              <p className="mt-3 leading-7">
                주요 데이터는 서울 열린데이터광장, 공공데이터포털, 각 공공기관이 공개한 공식 자료를 바탕으로
                정리합니다. 각 상세 페이지와 콘텐츠 하단에는 가능한 범위에서 원문 링크와 기준 시점을 함께 표시해,
                사용자가 필요한 경우 공식 안내로 바로 확인할 수 있도록 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">콘텐츠 생성 방식</h2>
              <p className="mt-3 leading-7">
                일부 블로그 콘텐츠는 공식 자료, 공개 데이터, 서울 생활형 주제를 바탕으로 AI를 활용해 초안을
                구성합니다. AI가 작성한 요약은 실제 운영 시간, 요금, 예약 조건, 신청 기준의 변동을 모두 보장하지
                않으므로 방문이나 신청 전에는 반드시 공식 원문을 다시 확인해야 합니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
