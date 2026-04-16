import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/posts";

export default function HomeRecommendedPostsSection({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-sky-100/70 bg-sky-50/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="mb-3 text-sm font-bold tracking-[0.18em] text-sky-600">
              RECOMMENDED POSTS
            </p>
            <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">
              최근 서울 코스 글
            </h2>
            <p className="mt-2 text-slate-600">
              상황별 페이지와 함께 읽기 좋은 최신 추천 글입니다.
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden min-h-11 items-center rounded-full border border-sky-200 bg-white px-4 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50 sm:inline-flex"
          >
            전체 글 보기
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-[1.75rem] border border-sky-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(56,189,248,0.14)]"
            >
              {post.coverImage ? (
                <div className="relative h-40 overflow-hidden bg-slate-950/90">
                  <Image
                    src={post.coverImage}
                    alt={post.coverAlt || post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              ) : null}
              <div className="p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                    {post.category}
                  </span>
                  <time className="text-xs font-medium text-slate-400">{post.date}</time>
                </div>
                <h3 className="line-clamp-2 text-lg font-bold text-slate-950 transition-colors group-hover:text-sky-700">
                  {post.title}
                </h3>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                  {post.summary}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/blog"
            className="inline-flex min-h-11 items-center rounded-full border border-sky-200 bg-white px-4 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50"
          >
            전체 글 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
