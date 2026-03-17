import Link from "next/link";
import type { Benefit } from "@/data/dummy";

export default function BenefitCard({ benefit }: { benefit: Benefit }) {
  // 카테고리별 이모지
  const categoryEmoji: Record<string, string> = {
    주거: "🏠",
    "출산/육아": "👶",
    사업: "💼",
    복지: "🤝",
  };

  // 카테고리별 배경 색상
  const categoryColor: Record<string, string> = {
    주거: "bg-blue-100 text-blue-700",
    "출산/육아": "bg-rose-100 text-rose-700",
    사업: "bg-emerald-100 text-emerald-700",
    복지: "bg-violet-100 text-violet-700",
  };

  return (
    <Link href={`/benefits/${benefit.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        {/* 카드 상단 색상 바 */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />

        <div className="p-5">
          {/* 카테고리 태그 */}
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
              categoryColor[benefit.category] || "bg-gray-100 text-gray-700"
            }`}
          >
            {categoryEmoji[benefit.category] || "📌"} {benefit.category}
          </span>

          {/* 제목 */}
          <h3 className="mt-3 text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
            {benefit.title}
          </h3>

          {/* 지원 금액 강조 */}
          <div className="mt-3 p-3 bg-emerald-50 rounded-xl">
            <p className="text-sm font-semibold text-emerald-700">
              💰 {benefit.amount}
            </p>
          </div>

          {/* 정보 */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>👤</span>
              <span className="line-clamp-1">{benefit.target}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>⏰</span>
              <span>마감: {benefit.deadline}</span>
            </div>
          </div>

          {/* 더보기 */}
          <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 group-hover:text-emerald-700">
            자세히 보기
            <svg
              className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
