import Link from "next/link";
import { blogPosts } from "@/data/dummy";

export default function BlogListPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* 페이지 헤더 */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          📝 블로그
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          AI가 매일 자동 작성하는 우리 동네 생활 정보 글
        </p>
      </div>

      {/* 블로그 글 목록 */}
      <div className="space-y-6">
        {blogPosts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                  <h2 className="mt-3 text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-gray-500 leading-relaxed line-clamp-2">
                    {post.summary}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 sm:mt-2">
                  <span>📅</span>
                  <span>{post.date}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                글 읽기
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
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
