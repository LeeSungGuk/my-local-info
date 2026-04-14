import Link from "next/link";
import type { Metadata } from "next";

const contactEmail = "jin3137@gmail.com";
const contactEmailHref = `mailto:${contactEmail}`;
const correctionUrl = "https://github.com/LeeSungGuk/my-local-info/issues";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 서울시티",
  description:
    "서울시티 서비스의 개인정보 처리 범위와 기술 로그 처리, 외부 제휴 링크 및 인프라 사용 기준을 안내합니다.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <section className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            개인정보처리방침
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            현재 운영 기준의 개인정보 처리 범위를
            <br />
            분명하게 안내합니다
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            서울시티는 공공데이터 기반 정보 서비스로 운영되며, 현재 회원가입,
            댓글, 문의폼, 결제 기능을 두고 있지 않습니다. 이 문서는 현재 공개
            운영 기준에서 어떤 정보가 처리될 수 있는지와, 외부 인프라 사용
            범위를 함께 설명합니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-500">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
              시행일 2026-04-14
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
              최종 기준일 2026-04-14
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-6 px-4 py-12 sm:px-6 sm:py-16">
        <PolicySection
          title="1. 직접 수집하는 개인정보"
          description="현재 서비스는 이용자가 직접 입력하는 개인정보를 받지 않습니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>회원가입, 로그인, 댓글, 문의폼, 결제 기능을 운영하지 않습니다.</li>
            <li>이용자 이름, 이메일, 전화번호, 주소를 직접 입력받지 않습니다.</li>
            <li>따라서 서울시티가 별도 데이터베이스에 이용자 개인정보를 저장하는 구조는 현재 없습니다.</li>
          </ul>
        </PolicySection>

        <PolicySection
          title="2. 기술적으로 처리될 수 있는 정보"
          description="다만 웹사이트 제공 과정에서 인프라 수준의 기술 정보가 생성될 수 있습니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>접속 시각, IP 주소, 브라우저·기기 정보, 요청 URL, 오류 기록 같은 접속 로그가 호스팅 및 보안 목적 범위에서 생성될 수 있습니다.</li>
            <li>이 정보는 서비스 안정성 확보, 오류 대응, 비정상 접근 방지, 배포 점검 같은 운영 목적에 한해 제한적으로 처리됩니다.</li>
            <li>서울시티 운영자가 직접 수집하지 않더라도, 인프라 제공사 수준에서 기술 로그가 처리될 수 있습니다.</li>
          </ul>
        </PolicySection>

        <PolicySection
          title="3. 외부 서비스 및 국외 처리 가능성"
          description="현재 서비스는 다음 인프라를 사용하고 있습니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>
              <strong>Cloudflare Pages</strong>: 정적 사이트 호스팅과 전송
              경로를 제공합니다.
            </li>
            <li>
              <strong>GitHub / GitHub Actions</strong>: 소스 저장소 관리와
              자동 배포, 데이터 동기화 작업에 사용됩니다.
            </li>
            <li>
              위 서비스는 해외 인프라를 포함할 수 있으므로, 접속 로그나 배포
              관련 기술 정보가 국외 서버를 거쳐 처리될 가능성이 있습니다.
            </li>
          </ul>
        </PolicySection>

        <PolicySection
          title="4. 쿠키, 분석, 광고"
          description="현재 기준에서 제휴 링크는 일부 운영 중이며, 추적 분석과 AdSense 광고는 비활성 상태입니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>일부 블로그 영역에는 쿠팡파트너스 제휴 링크가 포함될 수 있으며, 링크 클릭 시 외부 사이트로 이동합니다.</li>
            <li>Google Analytics, Google AdSense는 현재 실제 운영 기준으로 활성화하지 않았습니다.</li>
            <li>향후 분석 또는 AdSense 광고 기능을 도입하면, 관련 쿠키 사용과 국외 이전 가능성을 포함해 이 방침을 먼저 갱신한 뒤 적용합니다.</li>
          </ul>
        </PolicySection>

        <PolicySection
          title="5. 보유기간과 파기"
          description="서울시티가 직접 보유하는 이용자 개인정보 저장소는 현재 없습니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>직접 수집한 회원 정보나 문의 내역을 별도 보관하지 않습니다.</li>
            <li>기술 로그의 보유기간은 Cloudflare, GitHub 등 실제 인프라 제공사의 정책과 운영 환경에 따라 달라질 수 있습니다.</li>
            <li>향후 직접 수집 기능이 추가될 경우, 수집 항목과 보유기간을 이 방침에 구체적으로 반영합니다.</li>
          </ul>
        </PolicySection>

        <PolicySection
          title="6. 이용자 권리와 문의"
          description="개인정보 또는 데이터 정정 관련 요청은 공개 운영 기준에 맞게 접수합니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            <li>개인정보 관련 문의, 데이터 정정, 삭제 요청은 운영 이메일로 먼저 접수할 수 있습니다.</li>
            <li>공개 이슈는 보조 채널이므로, 이름, 연락처, 주민등록번호, 상세 주소 같은 개인정보를 남기지 마십시오.</li>
            <li>
              정정 요청 안내는{" "}
              <Link href="/contact" className="font-semibold text-sky-700 underline underline-offset-4">
                문의 및 정정 요청 페이지
              </Link>
              에서 함께 확인할 수 있습니다.
            </li>
          </ul>
          <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm leading-6 text-slate-700">
            운영 이메일:{" "}
            <a
              href={contactEmailHref}
              className="font-semibold text-sky-700 underline underline-offset-4"
            >
              {contactEmail}
            </a>
          </div>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
            보조 정정 채널:{" "}
            <a
              href={correctionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sky-700 underline underline-offset-4"
            >
              GitHub Issues
            </a>
          </div>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
            광고 및 분석 도구 도입 시 변경 기준은{" "}
            <Link
              href="/disclosure"
              className="font-semibold text-sky-700 underline underline-offset-4"
            >
              광고·분석 고지
            </Link>
            에서 먼저 안내합니다.
          </div>
        </PolicySection>
      </section>
    </div>
  );
}

function PolicySection({
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
