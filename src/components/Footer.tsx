import Link from "next/link";

const contactEmail = "jin3137@gmail.com";
const contactEmailHref = `mailto:${contactEmail}`;
const footerLinkClassName =
  "inline-flex min-h-11 min-w-11 items-center text-sm text-slate-400 transition-colors hover:text-sky-300";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* 사이트 소개 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,rgba(224,242,254,0.95),rgba(56,189,248,0.3)_55%,rgba(14,116,144,0.22))] ring-1 ring-cyan-200/40">
                <BrandMark />
              </span>
              <span className="flex flex-col">
                <span className="text-lg font-bold text-white">서울시티</span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-sky-300/70">
                  Seoul Local Guide
                </span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              서울의 행사, 혜택, 생활형 정보글을 공공데이터 중심으로 정리해 더
              빠르게 탐색할 수 있도록 돕는 서비스입니다.
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h3 className="text-white font-semibold mb-4">바로가기</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className={footerLinkClassName}
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className={footerLinkClassName}
                >
                  행사/축제
                </Link>
              </li>
              <li>
                <Link
                  href="/benefits"
                  className={footerLinkClassName}
                >
                  지원금/혜택
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className={footerLinkClassName}
                >
                  블로그
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className={footerLinkClassName}
                >
                  통합 검색
                </Link>
              </li>
            </ul>
          </div>

          {/* 운영 안내 */}
          <div>
            <h3 className="text-white font-semibold mb-4">운영 안내</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/notice"
                  className={footerLinkClassName}
                >
                  서비스 안내
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className={footerLinkClassName}
                >
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link
                  href="/disclosure"
                  className={footerLinkClassName}
                >
                  광고·분석 고지
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className={footerLinkClassName}
                >
                  문의 및 정정 요청
                </Link>
              </li>
              <li>
                <a
                  href={contactEmailHref}
                  className={footerLinkClassName}
                >
                  {contactEmail}
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/LeeSungGuk/my-local-info/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLinkClassName}
                >
                  GitHub Issues
                </a>
              </li>
              <li>
                <a
                  href="https://data.seoul.go.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLinkClassName}
                >
                  서울 열린데이터광장
                </a>
              </li>
              <li>
                <a
                  href="https://data.go.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLinkClassName}
                >
                  공공데이터포털
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="mt-10 border-t border-slate-800 pt-8 text-center">
          <p className="text-sm text-slate-500">
            © 2026 서울시티. 공공데이터 기반 서울 로컬 정보 서비스입니다.
          </p>
        </div>
      </div>
    </footer>
  );
}

function BrandMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 4L13.8 7.5V15.5H10.2V7.5L12 4Z" fill="#082F49" />
      <path d="M11.15 1.9H12.85V4.3H11.15V1.9Z" fill="#38BDF8" />
      <path d="M9.4 15.2H14.6V18.5H9.4V15.2Z" fill="#0F172A" />
      <path d="M8.3 18.3H15.7V20.2H8.3V18.3Z" fill="#1D4ED8" />
      <path d="M6.1 20H17.9V21.8H6.1V20Z" fill="#7DD3FC" />
      <circle cx="16.8" cy="6.5" r="1.1" fill="#BAE6FD" />
      <circle cx="7.2" cy="9.2" r="0.8" fill="#E0F2FE" />
    </svg>
  );
}
