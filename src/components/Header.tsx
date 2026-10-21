"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navigation = [
  ["/", "홈"], ["/#situations", "상황별 코스"], ["/districts", "구별 가이드"],
  ["/food", "먹거리"], ["/events", "행사/축제"], ["/benefits", "지원금/혜택"],
  ["/blog", "블로그"], ["/about", "소개"],
] as const;

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButton.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setIsMenuOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [isMenuOpen]);

  function isCurrent(href: string) {
    return !href.includes("#") && (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="서울시티 홈">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white transition-transform group-hover:-rotate-6">
            <svg aria-hidden="true" width="23" height="23" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v4m-2-1h4m-2 2-2 9h4l-2-9Zm-5 12h10M5 22h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="m18 5 .5 1.5L20 7l-1.5.5L18 9l-.5-1.5L16 7l1.5-.5Z" fill="currentColor" />
            </svg>
          </span>
          <span className="flex flex-col">
            <span className="text-base font-extrabold tracking-[-0.04em] text-slate-950">서울시티</span>
            <span className="mt-0.5 text-[8px] font-semibold tracking-[.2em] text-slate-500">SEOUL LOCAL GUIDE</span>
          </span>
        </Link>
        <nav aria-label="주요 메뉴" className="hidden items-center gap-0.5 lg:flex">
          {navigation.map(([href, label]) => (
            <Link key={href} href={href} aria-current={isCurrent(href) ? "page" : undefined}
              className={"inline-flex min-h-11 items-center rounded-full px-3 text-[13px] font-medium transition-colors hover:bg-slate-100 hover:text-slate-950 " + (isCurrent(href) ? "text-slate-950" : "text-slate-500")}>
              {label}
            </Link>
          ))}
        </nav>
        <button ref={menuButton} type="button" onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={isMenuOpen} aria-controls="mobile-navigation"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-800 hover:bg-slate-100 lg:hidden">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d={isMenuOpen ? "M6 6l12 12M6 18 18 6" : "M4 7h16M4 12h16M4 17h16"} />
          </svg>
        </button>
      </div>
      {isMenuOpen && (
        <div className="lg:hidden">
          <button type="button" className="fixed inset-0 top-[72px] h-[calc(100dvh-72px)] bg-slate-950/20 backdrop-blur-sm"
            aria-label="메뉴 배경 닫기" onClick={() => setIsMenuOpen(false)} tabIndex={-1} />
          <nav id="mobile-navigation" aria-label="모바일 메뉴"
            className="absolute inset-x-4 top-[84px] max-h-[calc(100dvh-100px)] overflow-y-auto rounded-2xl border border-slate-200 bg-background p-4 shadow-xl">
            <p className="eyebrow px-3 py-3">EXPLORE SEOUL</p>
            {navigation.map(([href, label]) => (
              <Link key={href} href={href} aria-current={isCurrent(href) ? "page" : undefined} onClick={() => setIsMenuOpen(false)}
                className="flex min-h-12 items-center justify-between rounded-xl px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                {label}<span aria-hidden="true" className="text-slate-400">↗</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
