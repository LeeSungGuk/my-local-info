import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "서울 생활 정보 블로그 | 서울시티",
  description: "서울에서 가볼만한 곳, 동네별 추천 코스, 취향별 서울 정보를 정리한 서울 전용 정보글을 확인하세요.",
};

export default function BlogListPage() {
  const posts = getAllPosts();
  return (
    <div className="bg-gradient-to-b from-amber-50 to-white min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-orange-900 mb-4 drop-shadow-sm">블로그</h1>
          <p className="text-lg text-orange-700">서울에서 가볼만한 곳과 취향별 추천 코스를 정보글로 정리합니다.</p>
        </header>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-3xl shadow-soft p-12 border border-orange-100">
            <p className="text-xl text-orange-400 font-medium mb-2">아직 공개된 서울 전용 정보글이 없습니다.</p>
            <p className="text-orange-300">서울 장소 추천과 동네별 코스를 기준으로 순차적으로 채워집니다.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft overflow-hidden hover:shadow-hover transition-all duration-300 border border-orange-50 transform hover:-translate-y-1"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  {post.coverImage ? (
                    <div className="relative h-52 overflow-hidden border-b border-orange-100 bg-slate-950/90">
                      <Image
                        src={post.coverImage}
                        alt={post.coverAlt || post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 896px"
                      />
                    </div>
                  ) : null}
                  <div className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                    <span className="inline-block px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                    <time className="text-sm text-orange-400 font-medium">{post.date}</time>
                  </div>
                  <h2 className="text-2xl font-bold text-orange-900 mb-4 group-hover:text-orange-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-orange-700 leading-relaxed mb-6 line-clamp-2">
                    {post.summary}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-sm text-orange-500 bg-orange-50 px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center text-orange-500 font-bold group-hover:translate-x-1 transition-transform">
                    자세히 읽기 
                    <svg
                      className="w-5 h-5 ml-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      ></path>
                    </svg>
                  </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
