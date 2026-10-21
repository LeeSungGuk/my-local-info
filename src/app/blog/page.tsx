import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { getBlogCardTitle } from "@/lib/blog-card-title";

export const metadata = {
  title: "서울 생활 정보 블로그 | Seoul City",
  description: "서울에서 가볼만한 곳, 동네별 추천 코스, 취향별 서울 정보를 정리한 서울 전용 정보글을 확인하세요.",
};

export default function BlogListPage() {
  const posts = getAllPosts();
  return (
    <div className="site-page min-h-screen pb-20">
      <header className="page-intro">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <p className="eyebrow">STORIES FROM SEOUL</p>
          <h1 className="mt-5 font-extrabold text-slate-950">서울을 읽는 시간</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500">서울에서 가볼만한 곳과 취향별 추천 코스를 정보글로 정리합니다.</p>
          <p className="mt-6 text-xs text-slate-500">서울 생활 정보 블로그 · {posts.length.toLocaleString("ko-KR")}개의 이야기</p>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <p className="font-semibold">아직 공개된 서울 전용 정보글이 없습니다.</p>
            <p className="mt-3 text-sm text-slate-500">서울 장소 추천과 동네별 코스를 기준으로 순차적으로 채워집니다.</p>
          </div>
        ) : (
          <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.slug} className="group min-w-0">
                <Link href={"/blog/" + post.slug} className="block">
                  {post.coverImage ? (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
                      <Image src={post.coverImage} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    </div>
                  ) : (
                    <div aria-hidden="true" className="aspect-[16/10] rounded-xl bg-slate-100" />
                  )}
                  <div className="px-1 pt-5">
                    <div className="flex items-center justify-between gap-3 text-[11px]">
                      <span className="font-semibold text-sky-700">{post.category}</span>
                      <time className="text-slate-500">{post.date}</time>
                    </div>
                    <h2 className="blog-card-title mt-3 transition-colors group-hover:text-sky-700">{getBlogCardTitle(post)}</h2>
                    <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-500">{post.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
                    <span className="section-link mt-3">자세히 읽기 <span aria-hidden="true">↗</span></span>
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
