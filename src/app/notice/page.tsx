import Link from "next/link";
import type { Metadata } from "next";

const contactEmail = "jin3137@gmail.com";
const contactEmailHref = `mailto:${contactEmail}`;
const correctionUrl = "https://github.com/LeeSungGuk/my-local-info/issues";

export const metadata: Metadata = {
  title: "서비스 안내 | 서울시티",
  description:
    "서울시티의 데이터 출처, 업데이트 기준, 콘텐츠 면책, 정정 요청 절차를 안내합니다.",
};

export default function NoticePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      <section className="border-b border-sky-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
            서비스 안내
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            서울시티가 무엇을 보여주고
            <br />
            어디까지 책임지는지 안내합니다
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            서울시티는 서울 생활에 닿는 행사, 혜택, 정보글을 더 빠르게
            찾도록 돕는 공공데이터 기반 탐색 서비스입니다. 아래 내용은 현재
            운영 방식, 데이터 기준, 정정 요청 흐름을 설명하는 안내문입니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-6 px-4 py-12 sm:px-6 sm:py-16">
        <NoticeSection
          title="1. 서비스가 제공하는 정보"
          description="현재 서비스는 세 가지 축으로 운영됩니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>행사·축제: 서울 열린데이터광장의 서울시 문화행사 정보를 기준으로 정리합니다.</li>
            <li>지원금·혜택: 공공데이터포털의 대한민국 공공서비스(혜택) 정보를 기준으로 서울 관련 항목만 선별합니다.</li>
            <li>먹거리: 서울 열린데이터광장의 서울시 일반음식점 인허가 정보를 기준으로 영업 상태 후보를 정리합니다.</li>
            <li>블로그: 서울 생활형 탐색을 돕는 정보성 콘텐츠이며, 공식 공고문 자체를 대체하지 않습니다.</li>
          </ul>
        </NoticeSection>

        <NoticeSection
          title="2. 데이터 출처와 갱신 기준"
          description="소스는 가능한 한 공식 데이터셋을 우선 사용합니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>행사 데이터는 서울 열린데이터광장 `서울시 문화행사 정보`를 사용합니다.</li>
            <li>혜택 데이터는 공공데이터포털 `행정안전부_대한민국 공공서비스(혜택) 정보`를 사용합니다.</li>
            <li>먹거리 데이터는 서울 열린데이터광장 `서울시 일반음식점 인허가 정보`를 사용합니다.</li>
            <li>행사, 혜택, 먹거리는 현재 기준으로 매일 오전 7시 30분(KST) 동기화를 목표로 운영합니다.</li>
            <li>혜택은 중복 항목을 추가하지 않고, 신청기한이 지난 데이터는 정리합니다.</li>
          </ul>
        </NoticeSection>

        <NoticeSection
          title="3. 블로그와 AI 생성 콘텐츠"
          description="블로그는 공식 공고문 복제본이 아니라 안내형 콘텐츠입니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>블로그는 서울 생활에 도움이 되는 정보성 글을 하루 1건 기준으로 생성하도록 구성되어 있습니다.</li>
            <li>AI 보조 작성이 포함될 수 있으므로, 최종 일정·자격·신청 조건은 반드시 공식 페이지에서 다시 확인해야 합니다.</li>
            <li>행사 상세, 혜택 상세, 원문 링크가 있는 경우 그 정보를 우선 기준으로 보셔야 합니다.</li>
          </ul>
        </NoticeSection>

        <NoticeSection
          title="4. 면책 및 이용 주의"
          description="서울시티는 참고용 탐색 서비스이며, 최종 행정 판단을 대신하지 않습니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>공공데이터 원본이 변경되거나 지연 갱신되면, 사이트 반영 시점과 차이가 생길 수 있습니다.</li>
            <li>행사 일정, 신청 가능 여부, 지원 대상, 비용, 마감 상태는 원문에서 수시로 바뀔 수 있습니다.</li>
            <li>서울시티는 법률, 세무, 행정, 재정 자문 서비스를 제공하지 않습니다.</li>
            <li>중요한 신청이나 방문 결정 전에는 반드시 공식 원문 페이지를 다시 확인해 주십시오.</li>
          </ul>
        </NoticeSection>

        <NoticeSection
          title="5. 출처 표시와 데이터 이용"
          description="공공데이터 라이선스와 출처 표시 조건을 존중합니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>서비스 내 데이터 설명과 상세 페이지에는 가능한 범위에서 공식 출처와 원문 링크를 함께 표시합니다.</li>
            <li>저작권 또는 제3자 권리가 별도로 붙은 자료는 원 데이터셋의 이용허락 범위를 우선 따릅니다.</li>
            <li>오류나 권리 문제가 확인되면 관련 노출을 조정하거나 삭제할 수 있습니다.</li>
          </ul>
        </NoticeSection>

        <NoticeSection
          title="6. 정정·삭제 요청"
          description="잘못된 정보나 권리 침해 우려가 있으면 바로 제보해 주시면 됩니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>오류 제보, 출처 수정, 삭제 요청은 운영 이메일을 우선 창구로 접수합니다.</li>
            <li>공개 이슈에는 개인정보나 민감한 증빙 자료를 올리지 마십시오.</li>
            <li>제보 시 대상 URL, 문제 내용, 수정 근거를 함께 적어주시면 처리 속도가 빨라집니다.</li>
          </ul>
          <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm leading-6 text-slate-700">
            공식 운영 이메일은{" "}
            <a
              href={contactEmailHref}
              className="font-semibold text-sky-700 underline underline-offset-4"
            >
              {contactEmail}
            </a>
            입니다.
          </div>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
            자세한 접수 방법은{" "}
            <Link
              href="/contact"
              className="font-semibold text-sky-700 underline underline-offset-4"
            >
              문의 및 정정 요청 페이지
            </Link>
            에서 확인할 수 있습니다. 보조 채널은{" "}
            <a
              href={correctionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sky-700 underline underline-offset-4"
            >
              GitHub Issues
            </a>
            입니다.
          </div>
        </NoticeSection>
      </section>
    </div>
  );
}

function NoticeSection({
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
