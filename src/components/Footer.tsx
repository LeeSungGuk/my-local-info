import Link from "next/link";

const quickLinks = [["/", "홈"], ["/events", "행사/축제"], ["/districts", "구별 가이드"], ["/food", "먹거리"], ["/benefits", "지원금/혜택"], ["/blog", "블로그"], ["/search", "통합 검색"]];
const notices = [["/notice", "서비스 안내"], ["/privacy", "개인정보처리방침"], ["/disclosure", "광고·분석 고지"], ["/contact", "문의 및 정정 요청"]];
const linkClass = "inline-flex min-h-11 items-center text-xs text-slate-500 transition-colors hover:text-slate-950";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/70">
      <div className="mx-auto max-w-6xl px-5 pb-8 pt-14 sm:px-6 sm:pt-16">
        <div className="grid gap-12 pb-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex min-h-11 items-center gap-2.5 text-sm font-extrabold text-slate-950">
              <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white">✳</span> 서울시티
            </Link>
            <p className="mt-6 font-serif text-xl leading-relaxed tracking-tight text-slate-600">익숙한 서울에서,<br />새로운 하루를 발견하는 시간.</p>
            <p className="mt-5 max-w-xs text-xs leading-6 text-slate-500">서울의 행사, 혜택, 생활형 정보글을 공공데이터 중심으로 정리하는 서울 로컬 정보 서비스입니다.</p>
          </div>
          <div>
            <p className="eyebrow mb-4">EXPLORE</p>
            <ul className="grid grid-cols-2 gap-x-4">{quickLinks.map(([href, label]) => <li key={href}><Link href={href} className={linkClass}>{label}</Link></li>)}</ul>
          </div>
          <div>
            <p className="eyebrow mb-4">INFORMATION</p>
            <ul>{notices.map(([href, label]) => <li key={href}><Link href={href} className={linkClass}>{label}</Link></li>)}</ul>
            <a href="mailto:jin3137@gmail.com" className={linkClass}>jin3137@gmail.com</a><br />
            <a href="https://github.com/LeeSungGuk/my-local-info/issues" target="_blank" rel="noopener noreferrer" className={linkClass}>GitHub Issues ↗</a>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 border-t border-slate-200 pt-6 text-[11px] text-slate-500 sm:flex-row sm:items-center">
          <p>© 2026 서울시티. 공공데이터 기반 서울 로컬 정보 서비스.</p>
          <div className="flex flex-wrap gap-x-5">
            <a href="https://data.seoul.go.kr" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:text-slate-950">서울 열린데이터광장 ↗</a>
            <a href="https://data.go.kr" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:text-slate-950">공공데이터포털 ↗</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
