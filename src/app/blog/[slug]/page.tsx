import Link from "next/link";
import { blogPosts } from "@/data/dummy";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // 마크다운 스타일의 간단한 렌더링 (## 헤더, 줄바꿈 처리)
  const renderContent = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("## ")) {
        return (
          <h2
            key={index}
            className="text-xl font-bold text-gray-900 mt-8 mb-3"
          >
            {line.replace("## ", "")}
          </h2>
        );
      }
      if (line.trim() === "") {
        return <br key={index} />;
      }
      return (
        <p key={index} className="text-gray-700 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* 뒤로가기 */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        블로그 목록으로
      </Link>

      <article className="animate-fade-in">
        {/* 카테고리 + 날짜 */}
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            {post.category}
          </span>
          <span className="text-sm text-gray-400">{post.date}</span>
        </div>

        {/* 제목 */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
          {post.title}
        </h1>

        {/* 요약 */}
        <p className="mt-4 text-lg text-gray-500 leading-relaxed">
          {post.summary}
        </p>

        {/* 본문 */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          {renderContent(post.content)}
        </div>

        {/* 광고 배너 자리 (쿠팡 파트너스) */}
        <div className="mt-8 bg-gray-100 rounded-2xl p-6 text-center">
          <p className="text-sm text-gray-400">
            📢 광고 영역 (쿠팡 파트너스 배너 예정)
          </p>
        </div>

        {/* 다른 글 보기 */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            다른 글도 읽어보세요
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {blogPosts
              .filter((p) => p.slug !== post.slug)
              .map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4"
                >
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                    {p.category}
                  </span>
                  <h4 className="mt-2 text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {p.title}
                  </h4>
                  <p className="mt-1 text-xs text-gray-400">{p.date}</p>
                </Link>
              ))}
          </div>
        </div>
      </article>
    </div>
  );
}
