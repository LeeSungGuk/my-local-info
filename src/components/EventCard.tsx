import Link from "next/link";
import type { Event } from "@/data/dummy";

export default function EventCard({ event }: { event: Event }) {
  // 카테고리별 이모지
  const categoryEmoji: Record<string, string> = {
    축제: "🎉",
    마켓: "🛍️",
    문화: "🎬",
    건강: "🏃",
  };

  // 카테고리별 배경 색상
  const categoryColor: Record<string, string> = {
    축제: "bg-pink-100 text-pink-700",
    마켓: "bg-amber-100 text-amber-700",
    문화: "bg-purple-100 text-purple-700",
    건강: "bg-green-100 text-green-700",
  };

  return (
    <Link href={`/events/${event.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        {/* 카드 상단 색상 바 */}
        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />

        <div className="p-5">
          {/* 카테고리 태그 */}
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
              categoryColor[event.category] || "bg-gray-100 text-gray-700"
            }`}
          >
            {categoryEmoji[event.category] || "📌"} {event.category}
          </span>

          {/* 제목 */}
          <h3 className="mt-3 text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {event.title}
          </h3>

          {/* 정보 */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>📅</span>
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>📍</span>
              <span>{event.location}</span>
            </div>
          </div>

          {/* 설명 미리보기 */}
          <p className="mt-3 text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* 더보기 */}
          <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
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
