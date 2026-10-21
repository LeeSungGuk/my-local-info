import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/posts";
import { getBlogCardTitle } from "@/lib/blog-card-title";

export default function HomeRecommendedPostsSection({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-slate-200/70">
      <div className="home-section">
        <div className="home-section-top">
          <div>
            <p className="eyebrow">
              RECOMMENDED POSTS
            </p>
            <h2 className="section-heading">
              최근 서울 코스 글
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              상황별 페이지와 함께 읽기 좋은 최신 추천 글입니다.
            </p>
          </div>
          <Link
            href="/blog"
            className="section-link hidden sm:inline-flex"
          >
            전체 글 보기
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group min-w-0"
            >
              {post.coverImage ? (
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    src={post.coverImage}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              ) : null}
              <div className="px-1 pt-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold text-sky-700">
                    {post.category}
                  </span>
                  <time className="text-xs font-medium text-slate-400">{post.date}</time>
                </div>
                <h3 className="blog-card-title text-slate-950 transition-colors group-hover:text-sky-700">
                  {getBlogCardTitle(post)}
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
