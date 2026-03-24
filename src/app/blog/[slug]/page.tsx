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
    <article className="bg-[#fff9f2] min-h-screen pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-12">
          <Link
            href="/blog"
            className="group flex items-center text-orange-600 font-bold mb-8 hover:-translate-x-1 transition-transform"
          >
            <svg
              className="w-5 h-5 mr-1"
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
            <span className="inline-block px-4 py-1.5 bg-rose-100 text-rose-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#3a1d1d] mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-orange-500 font-medium">
              <time className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1.5"
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
                    className="text-orange-400 bg-orange-50 px-2 py-0.5 rounded text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </header>
          
          {/* 본문 콘텐츠 */}
          <div className="prose prose-orange prose-lg max-w-none prose-headings:text-[#3a1d1d] prose-a:text-orange-600 hover:prose-a:text-orange-700 bg-white/90 backdrop-blur-sm rounded-[2rem] p-8 md:p-12 shadow-soft border border-orange-50">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
          
          <div className="mt-16 pt-10 border-t border-orange-100 text-center">
             <Link
                href="/blog"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                다른 글 더보기
              </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
