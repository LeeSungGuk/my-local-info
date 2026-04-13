"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🏘️</span>
            <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent group-hover:from-orange-500 group-hover:to-rose-500 transition-all">
              서울시티
            </span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/">홈</NavLink>
            <NavLink href="/events">행사/축제</NavLink>
            <NavLink href="/benefits/1">지원금/혜택</NavLink>
            <NavLink href="/blog">블로그</NavLink>
          </nav>

          {/* 모바일 메뉴 버튼 */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="메뉴 열기"
          >
            <svg
              className="w-6 h-6 text-gray-700"
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
          <nav className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
            <div className="flex flex-col gap-1">
              <MobileNavLink
                href="/"
                onClick={() => setIsMenuOpen(false)}
              >
                🏠 홈
              </MobileNavLink>
              <MobileNavLink
                href="/events"
                onClick={() => setIsMenuOpen(false)}
              >
                🎉 행사/축제
              </MobileNavLink>
              <MobileNavLink
                href="/benefits/1"
                onClick={() => setIsMenuOpen(false)}
              >
                💰 지원금/혜택
              </MobileNavLink>
              <MobileNavLink
                href="/blog"
                onClick={() => setIsMenuOpen(false)}
              >
                📝 블로그
              </MobileNavLink>
            </div>
          </nav>
        )}
      </div>
    </header>
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
      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all"
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
      className="px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all"
    >
      {children}
    </Link>
  );
}
