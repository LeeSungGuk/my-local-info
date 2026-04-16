# Homepage Situation Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition the homepage from a general Seoul event/benefit portal into a situation-based Seoul outing guide with three static landing pages: kids, rainy day, and free/low-cost.

**Architecture:** Add one typed situation data source under `src/lib`, then render it in both the homepage card section and `/situations/[slug]` static pages. Keep the existing blog, event, benefit, and search data flows intact; situation pages link to existing blog posts instead of introducing a database or new CMS.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript, Tailwind CSS, Node built-in `node:test`, static filesystem content from `src/content/posts`

---

## File Map

- Create `src/lib/situations.ts`: source of truth for the first three situation guides and related-post matching helpers.
- Create `src/lib/situations.test.ts`: focused unit tests for public slugs, lookup behavior, and related-post ordering.
- Create `src/components/HomeSituationSection.tsx`: homepage section with the three situation cards.
- Create `src/components/HomeRecommendedPostsSection.tsx`: homepage section for latest situation-oriented blog posts.
- Create `src/app/situations/[slug]/page.tsx`: static landing page route for each situation.
- Modify `src/app/page.tsx`: update hero copy, add situation cards, move search below cards, add recommended posts before events/benefits.
- Modify `src/components/Header.tsx`: add a `상황별 코스` anchor link to the homepage situation section.
- Modify `src/app/sitemap.ts`: include `/situations/kids`, `/situations/rainy-day`, and `/situations/free`.
- Do not modify `scripts/build-search-index.js` in v1. The search index remains event/benefit/blog only, avoiding a new search item type until there is enough situation content.

## Task 1: Add Situation Data Model

**Files:**
- Create: `src/lib/situations.ts`
- Create: `src/lib/situations.test.ts`

- [ ] **Step 1: Write the failing situation data tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  getAllSituations,
  getRelatedPostsForSituation,
  getSituationBySlug,
} from "./situations.ts";
import type { Post } from "./posts.ts";

function makePost(overrides: Partial<Post>): Post {
  return {
    slug: overrides.slug ?? overrides.sourceId ?? "post",
    title: overrides.title ?? "",
    date: overrides.date ?? "2026-04-16",
    updatedAt: overrides.updatedAt ?? "2026-04-16",
    summary: overrides.summary ?? "",
    category: overrides.category ?? "서울 코스",
    tags: overrides.tags ?? [],
    content: overrides.content ?? "",
    region: overrides.region ?? "서울",
    sourceType: overrides.sourceType ?? "정보글",
    sourceId: overrides.sourceId ?? overrides.slug ?? "post",
    sourceUrl: overrides.sourceUrl ?? "",
    sourceNote: overrides.sourceNote ?? "",
    coverImage: overrides.coverImage ?? "",
    coverAlt: overrides.coverAlt ?? "",
  };
}

test("defines the first three public situation guides", () => {
  assert.deepEqual(
    getAllSituations().map((situation) => situation.slug),
    ["kids", "rainy-day", "free"]
  );
  assert.deepEqual(
    getAllSituations().map((situation) => situation.href),
    ["/situations/kids", "/situations/rainy-day", "/situations/free"]
  );
});

test("looks up a situation by slug and returns null for unknown slugs", () => {
  assert.equal(getSituationBySlug("kids")?.title, "아이와 서울 나들이");
  assert.equal(getSituationBySlug("unknown"), null);
});

test("related posts prefer explicit source ids before tag matches and dedupe posts", () => {
  const free = getSituationBySlug("free");
  assert.ok(free);

  const posts = [
    makePost({
      slug: "tag-match-first",
      sourceId: "tag-match-first",
      title: "서울 저비용 반나절 코스",
      tags: ["저비용"],
    }),
    makePost({
      slug: "2026-04-16-seoul-free-spot-guide",
      sourceId: "seoul-free-spot-guide",
      title: "서울 무료 나들이 코스",
      tags: ["무료", "서울"],
    }),
    makePost({
      slug: "unrelated",
      sourceId: "unrelated",
      title: "서울 야간 데이트",
      tags: ["데이트"],
    }),
  ];

  assert.deepEqual(
    getRelatedPostsForSituation(free, posts).map((post) => post.sourceId),
    ["seoul-free-spot-guide", "tag-match-first"]
  );
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test src/lib/situations.test.ts`

Expected: FAIL with a module-not-found or missing export error for `src/lib/situations.ts`.

- [ ] **Step 3: Implement the situation data source**

```ts
import type { Post } from "./posts";

export type SituationSlug = "kids" | "rainy-day" | "free";
export type SituationAccent = "sky" | "teal" | "amber";

export interface SituationGuideSection {
  title: string;
  body: string;
}

export interface SituationGuide {
  slug: SituationSlug;
  href: `/situations/${SituationSlug}`;
  eyebrow: string;
  title: string;
  cardTitle: string;
  summary: string;
  heroDescription: string;
  searchIntent: string;
  accent: SituationAccent;
  tags: string[];
  relatedSourceIds: string[];
  guideSections: SituationGuideSection[];
  checklist: string[];
}

const situations: SituationGuide[] = [
  {
    slug: "kids",
    href: "/situations/kids",
    eyebrow: "아이와",
    title: "아이와 서울 나들이",
    cardTitle: "아이와 갈만한 곳",
    summary: "이동 부담, 실내외 선택, 연령대별 주의점을 먼저 보고 주말 코스를 고를 수 있게 정리합니다.",
    heroDescription:
      "아이와 함께 움직일 때는 장소 자체보다 이동 동선, 휴식 공간, 날씨 대안이 더 중요합니다. 이 페이지는 부모가 빠르게 판단할 수 있는 기준과 관련 글을 연결합니다.",
    searchIntent: "서울 아이와 갈만한 곳",
    accent: "sky",
    tags: ["아이와", "가족", "주말", "실내", "공원"],
    relatedSourceIds: ["seoul-family-weekend-course"],
    guideSections: [
      {
        title: "먼저 이동 피로를 줄이세요",
        body: "아이와 가는 코스는 장소를 많이 넣는 것보다 이동 횟수를 줄이는 편이 만족도가 높습니다. 한 권역 안에서 실내와 야외 대안을 같이 잡는 방식이 안전합니다.",
      },
      {
        title: "실내와 야외를 동시에 준비하세요",
        body: "서울은 날씨와 혼잡도에 따라 체감 난도가 크게 달라집니다. 야외 중심 코스라도 근처 박물관, 도서관, 복합문화공간 같은 대체지를 같이 확인하는 것이 좋습니다.",
      },
      {
        title: "연령대별 체류 시간을 다르게 잡으세요",
        body: "미취학 아동은 짧은 이동과 휴식 공간이 중요하고, 초등학생은 체험 요소가 있는 장소가 좋습니다. 같은 장소라도 체류 시간을 다르게 잡아야 일정이 무너지지 않습니다.",
      },
    ],
    checklist: [
      "유모차나 아이 동반 이동이 가능한 동선인지 확인하기",
      "비가 올 때 대체할 실내 장소를 1곳 이상 정하기",
      "식사와 화장실 위치를 방문 전에 확인하기",
      "공식 홈페이지에서 휴관일과 예약 여부 확인하기",
    ],
  },
  {
    slug: "rainy-day",
    href: "/situations/rainy-day",
    eyebrow: "비 오는 날",
    title: "서울 비 오는 날 실내 코스",
    cardTitle: "비 오는 날 실내 코스",
    summary: "비가 와도 일정이 무너지지 않도록 실내 장소, 짧은 이동, 예약 여부를 기준으로 고릅니다.",
    heroDescription:
      "비 오는 날에는 좋은 장소보다 덜 젖고 덜 걷는 동선이 먼저입니다. 실내 중심 코스와 방문 전 확인할 기준을 한 번에 정리합니다.",
    searchIntent: "서울 비 오는 날 실내",
    accent: "teal",
    tags: ["비 오는 날", "실내", "박물관", "전시", "가족"],
    relatedSourceIds: ["seoul-rainy-day-indoor"],
    guideSections: [
      {
        title: "이동이 짧은 권역을 고르세요",
        body: "비 오는 날에는 지하철역과 가까운 장소, 한 건물 안에서 오래 머물 수 있는 장소가 유리합니다. 여러 장소를 찍는 코스보다 한두 곳을 깊게 보는 편이 낫습니다.",
      },
      {
        title: "예약과 휴관일을 먼저 확인하세요",
        body: "인기 실내 시설은 주말과 우천 시 혼잡도가 높습니다. 현장 대기 가능 여부, 사전 예약, 휴관일을 공식 페이지에서 먼저 확인해야 합니다.",
      },
      {
        title: "카페나 식사 공간을 동선 안에 넣으세요",
        body: "비 오는 날 일정은 중간 휴식지가 없으면 피로도가 빠르게 올라갑니다. 이동 중간에 앉을 수 있는 공간을 미리 정해두면 일정이 훨씬 안정적입니다.",
      },
    ],
    checklist: [
      "지하철역에서 도보 이동 시간이 긴 장소는 피하기",
      "우천 시 운영 변경이나 예약 필요 여부 확인하기",
      "혼잡 시간대를 피해 오전 또는 늦은 오후로 잡기",
      "우산 보관, 물품 보관, 유모차 이동 가능 여부 확인하기",
    ],
  },
  {
    slug: "free",
    href: "/situations/free",
    eyebrow: "무료·저비용",
    title: "서울 무료·저비용 나들이",
    cardTitle: "무료·저비용 코스",
    summary: "입장료 부담 없이 반나절 보내기 좋은 서울 장소를 비용, 체류 시간, 만족도 기준으로 고릅니다.",
    heroDescription:
      "무료 장소도 이동비, 식사비, 대기 시간까지 포함하면 만족도가 달라집니다. 돈을 많이 쓰지 않고도 반나절을 보내는 선택 기준을 정리합니다.",
    searchIntent: "서울 무료 나들이",
    accent: "amber",
    tags: ["무료", "저비용", "공원", "전시", "반나절"],
    relatedSourceIds: ["seoul-free-spot-guide"],
    guideSections: [
      {
        title: "무료보다 총비용을 보세요",
        body: "입장료가 없어도 이동비와 식사비가 커지면 저비용 코스가 아닙니다. 대중교통 접근성과 근처 식사 선택지를 같이 봐야 합니다.",
      },
      {
        title: "체류 시간이 충분한 장소를 고르세요",
        body: "무료 명소는 짧게 보고 끝나는 곳도 많습니다. 산책, 전시, 전망, 휴식 중 최소 두 가지 이상을 할 수 있는 장소가 반나절 코스로 적합합니다.",
      },
      {
        title: "계절과 날씨 영향을 확인하세요",
        body: "공원과 야외 명소는 계절에 따라 만족도가 크게 달라집니다. 미세먼지, 폭염, 한파가 있는 날에는 무료 실내 전시나 도서관형 공간을 대안으로 두세요.",
      },
    ],
    checklist: [
      "입장료 외 식사비와 이동비까지 예상하기",
      "무료 운영 시간과 휴관일 확인하기",
      "주말 혼잡도가 높은 시간대 피하기",
      "야외 장소라면 근처 실내 대체지 1곳 정하기",
    ],
  },
];

function normalizeKeyword(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

export function getAllSituations(): SituationGuide[] {
  return [...situations];
}

export function getSituationBySlug(slug: string): SituationGuide | null {
  return situations.find((situation) => situation.slug === slug) ?? null;
}

export function getRelatedPostsForSituation(
  situation: SituationGuide,
  posts: Post[]
): Post[] {
  const seenSlugs = new Set<string>();
  const relatedPosts: Post[] = [];
  const normalizedTags = new Set(situation.tags.map(normalizeKeyword));

  for (const sourceId of situation.relatedSourceIds) {
    const post = posts.find((candidate) => candidate.sourceId === sourceId);

    if (post && !seenSlugs.has(post.slug)) {
      seenSlugs.add(post.slug);
      relatedPosts.push(post);
    }
  }

  for (const post of posts) {
    if (seenSlugs.has(post.slug)) {
      continue;
    }

    const hasTagMatch = post.tags.some((tag) =>
      normalizedTags.has(normalizeKeyword(tag))
    );

    if (hasTagMatch) {
      seenSlugs.add(post.slug);
      relatedPosts.push(post);
    }
  }

  return relatedPosts;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test src/lib/situations.test.ts`

Expected: PASS for all three situation tests. A `MODULE_TYPELESS_PACKAGE_JSON` warning is acceptable because existing `.ts` tests show the same warning.

- [ ] **Step 5: Commit**

```bash
git add src/lib/situations.ts src/lib/situations.test.ts
git commit -m "feat: add situation guide data model"
```

## Task 2: Add Homepage Situation And Recommended Post Sections

**Files:**
- Create: `src/components/HomeSituationSection.tsx`
- Create: `src/components/HomeRecommendedPostsSection.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create the situation card component**

```tsx
import Link from "next/link";
import type { SituationGuide, SituationAccent } from "@/lib/situations";

const accentClasses: Record<SituationAccent, string> = {
  sky: "border-sky-100 bg-sky-50/80 text-sky-700 group-hover:border-sky-200",
  teal: "border-teal-100 bg-teal-50/80 text-teal-700 group-hover:border-teal-200",
  amber: "border-amber-100 bg-amber-50/80 text-amber-700 group-hover:border-amber-200",
};

export default function HomeSituationSection({
  situations,
}: {
  situations: SituationGuide[];
}) {
  return (
    <section id="situations" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-8 max-w-3xl sm:mb-10">
        <p className="mb-3 text-sm font-bold tracking-[0.18em] text-sky-600">
          SITUATION GUIDE
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          지금 상황에 맞는 서울 코스부터 고르세요
        </h2>
        <p className="mt-3 leading-7 text-slate-600">
          장소를 더 많이 나열하기보다, 아이와 가는지, 비가 오는지, 비용을 줄이고 싶은지에 따라 먼저 판단 기준을 정리했습니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {situations.map((situation) => (
          <Link
            key={situation.slug}
            href={situation.href}
            className="group rounded-[1.75rem] border border-slate-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(15,23,42,0.10)]"
          >
            <span
              className={`mb-5 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${accentClasses[situation.accent]}`}
            >
              {situation.eyebrow}
            </span>
            <h3 className="text-xl font-bold text-slate-950">{situation.cardTitle}</h3>
            <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
              {situation.summary}
            </p>
            <div className="mt-6 flex items-center text-sm font-bold text-sky-700 transition-transform group-hover:translate-x-1">
              기준 보고 고르기
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create the recommended posts component**

```tsx
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
            className="hidden rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50 sm:inline-flex"
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
            className="inline-flex rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50"
          >
            전체 글 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire both sections into the homepage**

In `src/app/page.tsx`, add these imports:

```tsx
import HomeSituationSection from "@/components/HomeSituationSection";
import HomeRecommendedPostsSection from "@/components/HomeRecommendedPostsSection";
import { getAllPosts } from "@/lib/posts";
import { getAllSituations } from "@/lib/situations";
```

Update the homepage data load:

```tsx
const [allEvents, allBenefits, eventsIndex, benefitsIndex, allPosts] = await Promise.all([
  getAllEvents(),
  getAllBenefits(),
  getEventsIndex(),
  getBenefitsIndex(),
  Promise.resolve(getAllPosts()),
]);
const situations = getAllSituations();
const recommendedPosts = allPosts.slice(0, 3);
```

Replace the hero badge, heading, and paragraph with:

```tsx
<span className="mb-6 inline-block rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur-sm">
  서울 상황별 나들이 가이드
</span>
<h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
  검색 여러 번 하지 않아도
  <br />
  <span className="text-cyan-100">서울 나들이 코스를 고를 수 있게</span>
</h1>
<p className="mx-auto max-w-2xl text-lg leading-relaxed text-sky-50 sm:text-xl">
  아이와, 비 오는 날, 무료·저비용처럼 실제 고민에서 출발해
  <br />
  공식 확인 링크와 함께 서울 코스를 고를 수 있게 돕습니다.
</p>
```

Move the search section below the new situation section:

```tsx
<HomeSituationSection situations={situations} />

<section className="relative z-20 mx-auto max-w-6xl px-4 pb-12 sm:px-6">
  <HomeUnifiedSearch />
</section>

<HomeRecommendedPostsSection posts={recommendedPosts} />

<HomeSeoulSummary summary={summary} />
```

Remove the old negative margin search block:

```tsx
<section className="relative z-20 mx-auto -mt-12 max-w-6xl px-4 sm:-mt-16 sm:px-6">
  <HomeUnifiedSearch />
</section>
```

- [ ] **Step 4: Run lint for the homepage changes**

Run: `npm run lint -- src/app/page.tsx src/components/HomeSituationSection.tsx src/components/HomeRecommendedPostsSection.tsx`

Expected: PASS with no ESLint errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/components/HomeSituationSection.tsx src/components/HomeRecommendedPostsSection.tsx
git commit -m "feat: add homepage situation guide sections"
```

## Task 3: Add Static Situation Pages

**Files:**
- Create: `src/app/situations/[slug]/page.tsx`

- [ ] **Step 1: Create the route file**

```tsx
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

const siteUrl = "https://my-local-info-6ny.pages.dev";

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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

  const relatedPosts = getRelatedPostsForSituation(situation, getAllPosts()).slice(0, 3);
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

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_42%,#f8fafc_100%)] pb-20 pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <Link
          href="/#situations"
          className="mb-8 inline-flex items-center text-sm font-bold text-sky-700 transition-transform hover:-translate-x-1"
        >
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          상황별 코스로 돌아가기
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <span className={`mb-5 inline-flex rounded-full border px-4 py-1.5 text-sm font-bold ${accent.badge}`}>
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
              이 페이지는 검색 결과를 더 보는 대신, 먼저 확인해야 할 기준과 관련 글을 한 번에 묶어 보여줍니다.
            </p>
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
              연결된 추천 글이 아직 없습니다. 관련 서울 코스 글이 발행되면 이 영역에 자동으로 표시됩니다.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
          <h2 className="text-2xl font-bold text-slate-950">방문 전 체크리스트</h2>
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
            이 페이지는 상황별 선택 기준을 정리한 안내 페이지입니다. 실제 운영 시간, 예약 여부, 휴관일, 요금은 연결된 글 안의 공식 확인 링크나 각 장소의 공식 홈페이지에서 방문 전에 다시 확인하세요.
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
        <h2 className="mb-5 text-2xl font-bold text-slate-950">다른 상황도 보기</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {otherSituations.map((candidate) => (
            <Link
              key={candidate.slug}
              href={candidate.href}
              className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
            >
              <p className="text-sm font-bold text-sky-700">{candidate.eyebrow}</p>
              <h3 className="mt-2 text-lg font-bold text-slate-950">{candidate.cardTitle}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                {candidate.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Run focused lint for the route**

Run: `npm run lint -- 'src/app/situations/[slug]/page.tsx'`

Expected: PASS with no ESLint errors.

- [ ] **Step 3: Run a production build to verify static route generation**

Run: `npm run build`

Expected: PASS and include generated routes for `/situations/kids`, `/situations/rainy-day`, and `/situations/free`.

- [ ] **Step 4: Commit**

```bash
git add 'src/app/situations/[slug]/page.tsx'
git commit -m "feat: add situation landing pages"
```

## Task 4: Add Navigation And Sitemap Entries

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Add the desktop and mobile navigation links**

In `src/components/Header.tsx`, add this desktop nav item after `홈`:

```tsx
<NavLink href="/#situations">상황별 코스</NavLink>
```

Add this mobile nav item after `🏠 홈`:

```tsx
<MobileNavLink href="/#situations" onClick={() => setIsMenuOpen(false)}>
  🧭 상황별 코스
</MobileNavLink>
```

- [ ] **Step 2: Add situation pages to the sitemap**

In `src/app/sitemap.ts`, add the import:

```ts
import { getAllSituations } from "@/lib/situations";
```

Add this block after `staticRoutes`:

```ts
const situationRoutes: MetadataRoute.Sitemap = getAllSituations().map((situation) => ({
  url: `${siteUrl}${situation.href}`,
  lastModified: new Date(),
}));
```

Update both return paths:

```ts
if (!fs.existsSync(postsDirectory)) {
  return [...staticRoutes, ...situationRoutes];
}
```

```ts
return [...staticRoutes, ...situationRoutes, ...blogRoutes];
```

- [ ] **Step 3: Run lint for navigation and sitemap changes**

Run: `npm run lint -- src/components/Header.tsx src/app/sitemap.ts`

Expected: PASS with no ESLint errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.tsx src/app/sitemap.ts
git commit -m "feat: expose situation pages in navigation and sitemap"
```

## Task 5: Final Verification

**Files:**
- Verify all changed files from Tasks 1-4.

- [ ] **Step 1: Run the situation unit test**

Run: `node --test src/lib/situations.test.ts`

Expected: PASS.

- [ ] **Step 2: Run existing script tests that protect recent blog automation work**

Run: `node --test scripts/generate-blog-post.test.js scripts/generate-blog-cover.test.js`

Expected: PASS.

- [ ] **Step 3: Rebuild the static search index**

Run: `npm run build:search-index`

Expected: PASS. Counts should still include only `event`, `benefit`, and `blog`.

- [ ] **Step 4: Run lint for all changed files**

Run: `npm run lint -- src/lib/situations.ts src/lib/situations.test.ts src/components/HomeSituationSection.tsx src/components/HomeRecommendedPostsSection.tsx src/app/page.tsx 'src/app/situations/[slug]/page.tsx' src/components/Header.tsx src/app/sitemap.ts`

Expected: PASS with no ESLint errors.

- [ ] **Step 5: Run the production build**

Run: `npm run build`

Expected: PASS. If the build fails only because Google Fonts cannot be fetched in the local sandbox, rerun in a network-enabled environment before pushing.

- [ ] **Step 6: Manually review the local UI**

Run: `npm run dev`

Open:

```text
http://localhost:3000/
http://localhost:3000/situations/kids
http://localhost:3000/situations/rainy-day
http://localhost:3000/situations/free
```

Expected:

- Homepage hero communicates situation-based Seoul outings, not only events/benefits.
- Three situation cards are visible before search.
- Search still renders and works as a secondary tool.
- Recommended posts render when blog posts exist.
- Event and benefit sections remain on the homepage below content-focused sections.
- Each situation page has guide sections, at least one related post when matching content exists, a checklist, and official-check guidance.

- [ ] **Step 7: Commit final verification adjustments if needed**

```bash
git add src/lib/situations.ts src/lib/situations.test.ts src/components/HomeSituationSection.tsx src/components/HomeRecommendedPostsSection.tsx src/app/page.tsx 'src/app/situations/[slug]/page.tsx' src/components/Header.tsx src/app/sitemap.ts
git commit -m "chore: verify homepage situation guide"
```

## Self-Review Notes

- Spec coverage: The plan implements the selected office-hours direction: homepage hero rewrite, three situation cards, dedicated pages for `kids`, `rainy-day`, and `free`, related blog posts, checklist content, official-check guidance, and keeping event/benefit sections as secondary content.
- Search scope: The search index is intentionally unchanged in v1 because introducing a new `situation` search item type would require UI filter updates. Situation discovery is handled through homepage cards, navigation, and sitemap.
- Content risk: `/situations/rainy-day` may initially show the empty related-post fallback if the rainy-day blog post has not been created yet. This is acceptable for v1 because the page still has independent guide content, but the next content task should generate or manually add `sourceId: seoul-rainy-day-indoor`.
- Type consistency: `SituationSlug`, `SituationAccent`, `SituationGuide`, and helper function names are defined in Task 1 and reused consistently by later tasks.
