import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/posts";
import {
  getAllSituations,
  getRelatedPostsForSituation,
  getSituationBySlug,
  type SituationAccent,
} from "@/lib/situations";
import { SITE_URL } from "@/lib/site-config";

const siteUrl = SITE_URL;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const accentClasses: Record<
  SituationAccent,
  {
    badge: string;
    panel: string;
    button: string;
  }
> = {
  sky: {
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    panel: "border-sky-100 bg-sky-50/70",
    button: "bg-sky-600 hover:bg-sky-700",
  },
  teal: {
    badge: "border-teal-200 bg-teal-50 text-teal-700",
    panel: "border-teal-100 bg-teal-50/70",
    button: "bg-teal-600 hover:bg-teal-700",
  },
  amber: {
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    panel: "border-amber-100 bg-amber-50/70",
    button: "bg-amber-600 hover:bg-amber-700",
  },
};

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSituations().map((situation) => ({
    slug: situation.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const situation = getSituationBySlug(resolvedParams.slug);

  if (!situation) {
    return {};
  }

  return {
    title: `${situation.title} | 서울시티`,
    description: situation.summary,
    openGraph: {
      title: `${situation.title} | 서울시티`,
      description: situation.summary,
      type: "website",
    },
  };
}

export default async function SituationPage({ params }: PageProps) {
  const resolvedParams = await params;
  const situation = getSituationBySlug(resolvedParams.slug);

  if (!situation) {
    notFound();
  }

  const relatedPosts = getRelatedPostsForSituation(
    situation,
    getAllPosts()
  ).slice(0, 3);
  const accent = accentClasses[situation.accent];
  const otherSituations = getAllSituations().filter(
    (candidate) => candidate.slug !== situation.slug
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: situation.title,
    description: situation.summary,
    url: `${siteUrl}${situation.href}`,
    hasPart: relatedPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${siteUrl}/blog/${post.slug}`,
      datePublished: post.date,
    })),
  };
  const searchHref = `/search?q=${encodeURIComponent(situation.searchIntent)}`;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_42%,#f8fafc_100%)] pb-20 pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <Link
          href="/#situations"
          className="mb-8 inline-flex items-center text-sm font-bold text-sky-700 transition-transform hover:-translate-x-1"
        >
          <svg
            className="mr-1 h-4 w-4"
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
          상황별 코스로 돌아가기
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <span
              className={`mb-5 inline-flex rounded-full border px-4 py-1.5 text-sm font-bold ${accent.badge}`}
            >
              {situation.eyebrow}
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              {situation.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              {situation.heroDescription}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {situation.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <aside className={`rounded-[2rem] border p-6 shadow-soft ${accent.panel}`}>
            <p className="text-sm font-bold tracking-[0.18em] text-slate-500">
              SEARCH INTENT
            </p>
            <p className="mt-3 text-2xl font-bold text-slate-950">
              {situation.searchIntent}
            </p>
            <p className="mt-4 leading-7 text-slate-600">
              이 페이지는 검색 결과를 더 보는 대신, 먼저 확인해야 할 기준과 관련
              글을 한 번에 묶어 보여줍니다.
            </p>
            <Link
              href={searchHref}
              className={`mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-md px-5 text-sm font-bold text-white transition-colors ${accent.button}`}
            >
              이 조건으로 통합 검색
            </Link>
          </aside>
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-3">
        {situation.guideSections.map((section) => (
          <article
            key={section.title}
            className="rounded-[1.75rem] border border-slate-100 bg-white p-6 shadow-soft"
          >
            <h2 className="text-xl font-bold text-slate-950">{section.title}</h2>
            <p className="mt-3 leading-7 text-slate-600">{section.body}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-bold tracking-[0.18em] text-sky-600">
                RELATED POSTS
              </p>
              <h2 className="text-2xl font-bold text-slate-950">
                같이 보면 좋은 글
              </h2>
            </div>
          </div>

          {relatedPosts.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-3">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-[1.5rem] border border-sky-100 bg-sky-50/40 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_36px_rgba(56,189,248,0.14)]"
                >
                  {post.coverImage ? (
                    <div className="relative h-36 overflow-hidden bg-slate-950/90">
                      <Image
                        src={post.coverImage}
                        alt={post.coverAlt || post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  ) : null}
                  <div className="p-5">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-700">
                      {post.category}
                    </span>
                    <h3 className="mt-3 line-clamp-2 text-lg font-bold text-slate-950 group-hover:text-sky-700">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {post.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-slate-50 p-5 text-slate-500">
              연결된 추천 글이 아직 없습니다. 관련 서울 코스 글이 발행되면 이
              영역에 자동으로 표시됩니다.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
          <h2 className="text-2xl font-bold text-slate-950">
            방문 전 체크리스트
          </h2>
          <ul className="mt-5 space-y-3">
            {situation.checklist.map((item) => (
              <li key={item} className="flex gap-3 leading-7 text-slate-700">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
          <h2 className="text-2xl font-bold text-slate-950">공식 확인 안내</h2>
          <p className="mt-4 leading-7 text-slate-600">
            이 페이지는 상황별 선택 기준을 정리한 안내 페이지입니다. 실제 운영
            시간, 예약 여부, 휴관일, 요금은 연결된 글 안의 공식 확인 링크나 각
            장소의 공식 홈페이지에서 방문 전에 다시 확인하세요.
          </p>
          <Link
            href="/blog"
            className={`mt-6 inline-flex rounded-full px-5 py-3 text-sm font-bold text-white transition-colors ${accent.button}`}
          >
            서울 코스 글 더 보기
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
        <h2 className="mb-5 text-2xl font-bold text-slate-950">
          다른 상황도 보기
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {otherSituations.map((candidate) => (
            <Link
              key={candidate.slug}
              href={candidate.href}
              className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
            >
              <p className="text-sm font-bold text-sky-700">
                {candidate.eyebrow}
              </p>
              <h3 className="mt-2 text-lg font-bold text-slate-950">
                {candidate.cardTitle}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                {candidate.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
