import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fbff_18%,#ffffff_48%)] pb-24 pt-32">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12">
          <Link
            href="/blog"
            className="group mb-8 flex items-center font-bold text-sky-700 transition-transform hover:-translate-x-1"
          >
            <svg
              className="mr-1 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            목록으로 돌아가기
          </Link>

          <header className="mb-10 text-center md:text-left">
            <span className="mb-6 inline-block rounded-full bg-sky-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-700">
              {post.category}
            </span>
            <h1 className="mb-6 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 font-medium text-sky-600 md:justify-start">
              <time className="flex items-center">
                <svg
                  className="mr-1.5 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                {post.date}
              </time>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-sky-50 px-2 py-0.5 text-sm text-sky-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </header>

          {post.coverImage ? (
            <div className="relative mb-10 overflow-hidden rounded-[2rem] border border-sky-100 bg-slate-950/90">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={post.coverImage}
                  alt={post.coverAlt || post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
            </div>
          ) : null}
          
          {/* 본문 콘텐츠 */}
          <div className="prose prose-lg max-w-none rounded-[2rem] border border-sky-100 bg-white/90 p-8 shadow-soft backdrop-blur-sm prose-headings:text-slate-900 prose-a:text-sky-600 hover:prose-a:text-sky-700 md:p-12">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
          
          <div className="mt-16 border-t border-sky-100 pt-10 text-center">
             <Link
                href="/blog"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 px-8 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                다른 글 더보기
              </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
