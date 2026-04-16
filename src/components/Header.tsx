"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-sky-100/80 bg-[linear-gradient(180deg,rgba(248,252,255,0.94),rgba(239,246,255,0.88))] backdrop-blur-xl shadow-[0_12px_32px_rgba(56,189,248,0.08)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,rgba(224,242,254,0.95),rgba(56,189,248,0.28)_55%,rgba(14,116,144,0.18))] ring-1 ring-cyan-200/60 shadow-[0_8px_22px_rgba(14,165,233,0.18)] transition-transform group-hover:-translate-y-0.5">
              <BrandMark />
            </span>
            <span className="flex flex-col">
              <span className="text-lg font-bold tracking-[-0.02em] bg-gradient-to-r from-sky-950 via-sky-700 to-cyan-500 bg-clip-text text-transparent">
                서울시티
              </span>
              <span className="text-[11px] font-medium tracking-[0.18em] text-sky-500/80 uppercase">
                Seoul Local Guide
              </span>
            </span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/">홈</NavLink>
            <NavLink href="/#situations">상황별 코스</NavLink>
            <NavLink href="/events">행사/축제</NavLink>
            <NavLink href="/benefits">지원금/혜택</NavLink>
            <NavLink href="/blog">블로그</NavLink>
            <NavLink href="/about">소개</NavLink>
          </nav>

          {/* 모바일 메뉴 버튼 */}
          <button
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl p-2 transition-colors md:hidden ${
              isMenuOpen
                ? "bg-sky-100 text-sky-700"
                : "text-slate-700 hover:bg-sky-50"
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <>
            <button
              type="button"
              aria-label="메뉴 배경 닫기"
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 top-16 z-40 bg-slate-950/20 backdrop-blur-[2px] md:hidden"
            />
            <nav className="animate-fade-in fixed inset-x-4 top-[4.5rem] z-50 max-h-[calc(100vh-5.5rem)] overflow-y-auto rounded-[1.75rem] border border-sky-100/80 bg-white/95 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl md:hidden">
              <div className="px-3 pb-3 pt-2">
                <p className="text-xs font-semibold tracking-[0.18em] text-sky-600/70">
                  QUICK MENU
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  자주 찾는 화면으로 바로 이동할 수 있습니다.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <MobileNavLink href="/" onClick={() => setIsMenuOpen(false)}>
                  🏠 홈
                </MobileNavLink>
                <MobileNavLink
                  href="/#situations"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🧭 상황별 코스
                </MobileNavLink>
                <MobileNavLink href="/events" onClick={() => setIsMenuOpen(false)}>
                  🎉 행사/축제
                </MobileNavLink>
                <MobileNavLink href="/benefits" onClick={() => setIsMenuOpen(false)}>
                  💰 지원금/혜택
                </MobileNavLink>
                <MobileNavLink href="/blog" onClick={() => setIsMenuOpen(false)}>
                  📝 블로그
                </MobileNavLink>
                <MobileNavLink href="/about" onClick={() => setIsMenuOpen(false)}>
                  ℹ️ 소개
                </MobileNavLink>
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
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

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-medium text-slate-600 transition-all hover:bg-sky-50 hover:text-sky-700"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-2xl border border-transparent bg-slate-50/80 px-4 py-3.5 text-base font-semibold text-slate-700 transition-all hover:border-sky-100 hover:bg-sky-50 hover:text-sky-700"
    >
      {children}
    </Link>
  );
}
