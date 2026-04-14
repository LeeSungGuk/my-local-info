import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "광고·분석 고지 | 서울시티",
  description:
    "서울시티의 제휴 링크, 광고, 분석 도구 사용 현황과 향후 활성화 시 반영 기준을 안내합니다.",
};

export default function DisclosurePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <section className="border-b border-blue-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
            광고·분석 고지
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            광고와 분석 도구를
            <br />
            언제 어떻게 쓰는지 미리 공개합니다
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            이 문서는 현재 서울시티의 제휴 링크, 광고·분석 기능 사용 현황과,
            향후 Google Analytics 또는 Google AdSense를 활성화할 때 어떤
            기준으로 고지를 바꾸는지 설명하기 위한 운영 안내입니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-6 px-4 py-12 sm:px-6 sm:py-16">
        <Section
          title="1. 현재 상태"
          description="현재 공개 코드 기준으로는 제휴 링크 일부가 활성화되어 있고, 분석 및 AdSense 광고는 비활성 상태입니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>Google Analytics 태그는 현재 실제 서비스 코드에 삽입되어 있지 않습니다.</li>
            <li>Google AdSense는 아직 실제 운영 광고를 시작하지 않았습니다.</li>
            <li>일부 블로그 영역에는 쿠팡파트너스 제휴 링크가 포함될 수 있으며, 사용자가 해당 링크를 클릭하면 외부 사이트로 이동합니다.</li>
            <li>현재 기준으로는 이용 통계 수집을 목적으로 한 별도 추적 기능은 동작시키지 않습니다.</li>
          </ul>
        </Section>

        <Section
          title="2. 향후 활성화 시 바뀌는 점"
          description="분석 또는 AdSense 광고를 켜면 이 사이트의 법적·운영적 성격이 더 달라집니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>Google Analytics를 활성화하면 접속 통계와 사용 흐름 분석을 위한 식별 정보와 쿠키가 처리될 수 있습니다.</li>
            <li>Google AdSense를 활성화하면 광고 제공, 빈도 제한, 성과 측정 목적의 쿠키 또는 유사 식별자가 처리될 수 있습니다.</li>
            <li>이 경우 개인정보처리방침, 서비스 안내, 필요 시 배너 또는 추가 고지를 먼저 갱신한 뒤 기능을 활성화합니다.</li>
          </ul>
        </Section>

        <Section
          title="3. 광고 표시 원칙"
          description="광고나 제휴성 콘텐츠가 들어오면 편집 콘텐츠와 구분되도록 운영합니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>광고는 가능한 한 `광고`, `스폰서`, `제휴`처럼 이용자가 알아볼 수 있는 방식으로 표시합니다.</li>
            <li>쿠팡파트너스 같은 제휴 링크는 본문 정보와 섞이지 않도록 별도 안내 박스 또는 명확한 문구와 함께 노출합니다.</li>
            <li>공공데이터 기반 정보와 광고성 추천 콘텐츠를 혼동시키는 형태는 지양합니다.</li>
            <li>행정 정보, 신청 자격, 공식 일정 자체는 광고 계약 여부와 무관하게 공식 출처를 우선합니다.</li>
          </ul>
        </Section>

        <Section
          title="4. 업데이트 원칙"
          description="광고·분석 기능이 실제로 켜지기 전에는 이 페이지를 먼저 갱신합니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>도입 도구 이름</li>
            <li>처리 목적과 사용 범위</li>
            <li>쿠키 또는 유사 식별자 사용 여부</li>
            <li>국외 이전 가능성</li>
            <li>적용 시작일</li>
          </ul>
        </Section>
      </section>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
        {description}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  );
}
