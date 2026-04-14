import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";

const siteUrl = "https://my-local-info-6ny.pages.dev";
const siteName = "서울시 생활 정보";

function getSourceHostLabel(url: string) {
  if (!url) {
    return "";
  }

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
    },
  };
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

  const hasSourceLink = Boolean(post.sourceUrl);
  const sourceHostLabel = getSourceHostLabel(post.sourceUrl);
  const blogStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        datePublished: post.date,
        dateModified: post.updatedAt,
        description: post.summary,
        author: {
          "@type": "Organization",
          name: siteName,
        },
        publisher: {
          "@type": "Organization",
          name: siteName,
          url: siteUrl,
        },
        mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "홈",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "블로그",
            item: `${siteUrl}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: `${siteUrl}/blog/${post.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <article className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fbff_18%,#ffffff_48%)] pb-24 pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogStructuredData) }}
      />
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
              <span className="flex items-center text-sm text-slate-500">
                최종 업데이트: {post.updatedAt}
              </span>
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

          <div className="mt-8 rounded-[1.5rem] border border-sky-100 bg-sky-50/70 p-6 text-sm leading-7 text-slate-700">
            <p className="font-semibold text-slate-900">콘텐츠 안내</p>
            <p className="mt-2">
              {hasSourceLink
                ? (
                  <>
                    이 글은 공공데이터포털(<a href="http://data.go.kr/" target="_blank" rel="noreferrer" className="font-semibold text-sky-700 underline underline-offset-2">data.go.kr</a>) 또는 공공기관 공개 정보를 바탕으로 AI가 작성하였습니다. 정확한 내용은 원문 링크를 통해 확인해주세요.
                  </>
                )
                : "이 글은 서울 생활형 공개 정보와 일반 안내 목적의 자료를 바탕으로 AI가 작성한 정보글입니다. 실제 방문이나 이용 전에는 관련 기관의 최신 안내를 다시 확인해주세요."}
            </p>

            <div className="mt-4 rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                원문 출처
              </p>
              {hasSourceLink ? (
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center text-sm font-semibold text-sky-700 hover:text-sky-800"
                >
                  {sourceHostLabel || "원문 링크"} 바로가기
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5h5v5m-1-4L10 14M5 9v10h10" />
                  </svg>
                </a>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  현재 이 글에는 연결된 원문 링크가 없습니다. 방문 전 관련 기관의 공식 안내를 다시 확인해주세요.
                </p>
              )}
            </div>
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
