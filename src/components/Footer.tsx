import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 사이트 소개 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏘️</span>
              <span className="text-lg font-bold text-white">
                우리 동네 생활 정보
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              공공데이터를 활용하여 우리 동네의 행사, 축제, 지원금, 혜택 정보를
              자동으로 수집하여 전달해드립니다.
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h3 className="text-white font-semibold mb-4">바로가기</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  블로그
                </Link>
              </li>
            </ul>
          </div>

          {/* 데이터 출처 */}
          <div>
            <h3 className="text-white font-semibold mb-4">데이터 출처</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://data.go.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  공공데이터포털 →
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="mt-10 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            © 2026 우리 동네 생활 정보. 공공데이터를 활용한 서비스입니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
