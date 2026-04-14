import type { Metadata } from "next";
import Link from "next/link";

const contactEmail = "jin3137@gmail.com";
const contactEmailHref = `mailto:${contactEmail}`;
const issuesUrl = "https://github.com/LeeSungGuk/my-local-info/issues";

export const metadata: Metadata = {
  title: "문의 및 정정 요청 | 서울시티",
  description:
    "서울시티 서비스의 오류 제보, 데이터 정정 요청, 권리 침해 우려 접수 방법을 안내합니다.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      <section className="border-b border-sky-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
            문의 및 정정 요청
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            잘못된 정보나 운영 이슈가 있으면
            <br />
            이 경로로 바로 알려주시면 됩니다
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            운영 문의, 오류 제보, 권리 침해 우려, 데이터 정정 요청은 현재
            운영 이메일을 우선 창구로 받고 있습니다. 공개 이슈는 보조 채널로만
            사용합니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-6 px-4 py-12 sm:px-6 sm:py-16">
        <Section
          title="1. 현재 접수 채널"
          description="이메일을 공식 창구로 사용하고, GitHub Issues는 보조 채널로 유지합니다."
        >
          <div className="space-y-3">
            <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-5 text-sm leading-7 text-slate-700 sm:text-base">
              공식 이메일:{" "}
              <a
                href={contactEmailHref}
                className="font-semibold text-sky-700 underline underline-offset-4"
              >
                {contactEmail}
              </a>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700 sm:text-base">
              보조 채널:{" "}
              <a
                href={issuesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sky-700 underline underline-offset-4"
              >
                GitHub Issues
              </a>
            </div>
          </div>
        </Section>

        <Section
          title="2. 어떤 요청을 받는지"
          description="아래 유형의 제보를 우선 처리 대상으로 봅니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>행사 일정, 장소, 비용, 링크 오류 같은 데이터 정정 요청</li>
            <li>지원 대상, 신청 조건, 마감 상태, 원문 출처 오류 제보</li>
            <li>권리 침해 우려, 잘못된 이미지·문구 사용 제보</li>
            <li>사이트 동작 오류, 검색 문제, 화면 깨짐 같은 운영 이슈</li>
          </ul>
        </Section>

        <Section
          title="3. 제보할 때 같이 적어주면 좋은 정보"
          description="처리 속도를 높이려면 최소한 아래 정보가 필요합니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>문제가 발생한 페이지 URL</li>
            <li>무엇이 잘못되었는지에 대한 짧은 설명</li>
            <li>정정 근거가 되는 공식 링크나 화면 캡처</li>
            <li>재현이 필요한 경우 기기 종류와 브라우저 정보</li>
          </ul>
        </Section>

        <Section
          title="4. 공개 채널 이용 시 주의"
          description="이메일과 공개 이슈는 성격이 다르므로 구분해서 사용하는 편이 안전합니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>개인정보나 민감한 증빙 자료가 필요한 요청은 이메일로 보내는 편이 맞습니다.</li>
            <li>GitHub Issues는 공개 채널이므로 이름, 전화번호, 이메일, 생년월일, 상세 주소, 주민등록번호를 남기지 마십시오.</li>
            <li>공개 가능한 오류 제보나 화면 버그는 GitHub Issues로, 개인정보가 섞이는 요청은 이메일로 보내 주시면 됩니다.</li>
          </ul>
        </Section>

        <Section
          title="5. 관련 안내"
          description="개인정보와 서비스 운영 기준은 아래 문서에서 함께 확인할 수 있습니다."
        >
          <div className="flex flex-wrap gap-3">
            <Link
              href="/privacy"
              className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/notice"
              className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              서비스 안내
            </Link>
            <Link
              href="/disclosure"
              className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              광고·분석 고지
            </Link>
          </div>
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
