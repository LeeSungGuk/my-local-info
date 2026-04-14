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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white pb-16 pt-24">
      <div className="mx-auto max-w-4xl px-4">
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-slate-900 drop-shadow-sm">블로그</h1>
          <p className="text-lg text-sky-700">서울에서 가볼만한 곳과 취향별 추천 코스를 정보글로 정리합니다.</p>
        </header>

        {posts.length === 0 ? (
          <div className="rounded-3xl border border-sky-100 bg-white/70 p-12 py-20 text-center backdrop-blur-sm shadow-soft">
            <p className="mb-2 text-xl font-medium text-sky-500">아직 공개된 서울 전용 정보글이 없습니다.</p>
            <p className="text-sky-300">서울 장소 추천과 동네별 코스를 기준으로 순차적으로 채워집니다.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group relative overflow-hidden rounded-3xl border border-sky-100 bg-white/80 shadow-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(56,189,248,0.14)]"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  {post.coverImage ? (
                    <div className="relative h-52 overflow-hidden border-b border-sky-100 bg-slate-950/90">
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
                    <span className="inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-700">
                      {post.category}
                    </span>
                    <time className="text-sm font-medium text-sky-500">{post.date}</time>
                  </div>
                  <h2 className="mb-4 text-2xl font-bold text-slate-900 transition-colors group-hover:text-sky-700">
                    {post.title}
                  </h2>
                  <p className="mb-6 line-clamp-2 leading-relaxed text-slate-600">
                    {post.summary}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-sky-50 px-2 py-0.5 text-sm text-sky-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center font-bold text-sky-600 transition-transform group-hover:translate-x-1">
                    자세히 읽기 
                    <svg
                      className="ml-1 h-5 w-5 transition-transform"
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
