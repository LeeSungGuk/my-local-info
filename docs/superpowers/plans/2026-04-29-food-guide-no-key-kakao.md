# Food Guide With No-Key Kakao Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Seoul food guide that links users from district pages to Kakao Map search results without requiring a Kakao API key.

**Architecture:** The first release does not embed Kakao maps and does not call Kakao Local API. It adds a small food guide data model, curated district food intents, reusable food cards, a `/food` hub, `/districts/[slug]/food` detail pages, and district-page entry sections. Kakao links are generated from restaurant/area/search terms with `https://map.kakao.com/link/search/{query}` so the site remains static-export friendly.

**Tech Stack:** Next.js App Router, TypeScript, React server components, Tailwind CSS, static export, existing `src/lib/districts.ts`, future-compatible `public/data/food/index.json`.

---

## Product Decision

Do not launch this as "서울 맛집 랭킹" or "최신 맛집 TOP 100".

Launch wording:
- "서울 구별 먹거리 가이드"
- "이 구에서 식사할 만한 권역"
- "카카오맵에서 식당 검색"
- "공공데이터 기반 음식점 정보는 준비 중"

Reason:
- Ranking/review claims require data we do not own.
- Kakao review/rating scraping is not part of this plan.
- No-key Kakao search links are useful, safe, and enough for the first release.

## File Structure

- Create: `src/lib/food.ts`
  - Owns food intent types, future food-place types, district lookup helpers, and no-key Kakao URL builders.
- Create: `src/lib/food.test.ts`
  - Verifies Kakao search URL generation, district filtering, and immutable helper returns.
- Create: `src/components/food/FoodIntentCard.tsx`
  - Renders one curated food intent with a Kakao search link.
- Create: `src/components/food/FoodSourceNotice.tsx`
  - Explains that Kakao links are search-result links and that business hours/menu should be checked on map/provider pages.
- Create: `src/app/food/page.tsx`
  - Food guide hub across all supported districts.
- Create: `src/app/districts/[slug]/food/page.tsx`
  - District-specific food guide page.
- Modify: `src/app/districts/[slug]/page.tsx`
  - Adds a compact "먹거리 같이 보기" section linking to the district food page.
- Modify: `src/components/Header.tsx`
  - Adds "먹거리" to desktop/mobile navigation after "구별 가이드".
- Modify: `src/components/Footer.tsx`
  - Adds "먹거리" to quick links.
- Modify: `src/app/sitemap.ts`
  - Adds `/food` and `/districts/{slug}/food`.
- Modify: `src/lib/search-types.ts`
  - Adds search item type `food`.
- Modify: `src/components/SearchResultsView.tsx`
  - Adds "먹거리" filter label and card color.
- Modify: `public/data/search/index.json` generation path through `scripts/build-search-index.js` only if food pages should appear in unified search in the first release.

---

### Task 1: Food Domain Helpers

**Files:**
- Create: `src/lib/food.ts`
- Create: `src/lib/food.test.ts`

- [ ] **Step 1: Add food domain types and curated intents**

Create `src/lib/food.ts` with:

```ts
import { getAllDistricts, type DistrictGuide, type DistrictSlug } from "@/lib/districts";

export interface FoodIntent {
  id: string;
  districtSlug: DistrictSlug;
  districtName: string;
  title: string;
  area: string;
  category: string;
  searchQuery: string;
  description: string;
  bestFor: string[];
}

export interface FoodPlace {
  id: string;
  name: string;
  district: string;
  area: string;
  category: string;
  mainMenu: string;
  address: string;
  roadAddress: string;
  phone: string;
  status: "영업" | "폐업" | "정보 없음";
  licenseDate: string;
  sourceLabel: string;
  sourceUrl: string;
  collectedAt: string;
}

const foodIntents: FoodIntent[] = [
  {
    id: "jongno-palace-meal",
    districtSlug: "jongno",
    districtName: "종로구",
    title: "궁궐 산책 전후 식사",
    area: "광화문 · 서촌 · 인사동",
    category: "한식",
    searchQuery: "종로구 광화문 서촌 한식",
    description: "경복궁, 광화문, 서촌 산책 전후로 찾기 좋은 한식권 검색입니다.",
    bestFor: ["부모님과", "궁궐 산책", "점심"],
  },
  {
    id: "jung-myeongdong-dinner",
    districtSlug: "jung",
    districtName: "중구",
    title: "명동·정동 도심 식사",
    area: "명동 · 정동 · 시청",
    category: "도심 식사",
    searchQuery: "중구 명동 정동 식당",
    description: "도심 산책이나 공연 전후에 빠르게 찾기 좋은 식사권 검색입니다.",
    bestFor: ["퇴근 후", "도심 산책", "공연 전후"],
  },
  {
    id: "mapo-hangang-market",
    districtSlug: "mapo",
    districtName: "마포구",
    title: "시장과 한강을 묶는 먹거리",
    area: "망원 · 합정 · 연남",
    category: "시장·골목",
    searchQuery: "마포구 망원 합정 연남 맛집",
    description: "망원시장, 한강, 골목 상권을 함께 볼 때 쓰기 좋은 검색입니다.",
    bestFor: ["데이트", "시장", "한강"],
  },
  {
    id: "seongdong-seoulforest",
    districtSlug: "seongdong",
    districtName: "성동구",
    title: "서울숲·성수 식사 선택지",
    area: "서울숲 · 성수 · 뚝섬",
    category: "카페·식사",
    searchQuery: "성동구 서울숲 성수 식당",
    description: "서울숲 산책과 성수동 실내 일정을 함께 잡을 때 쓰기 좋습니다.",
    bestFor: ["데이트", "전시", "카페"],
  },
  {
    id: "yongsan-museum-family",
    districtSlug: "yongsan",
    districtName: "용산구",
    title: "박물관·공원 전후 가족 식사",
    area: "이촌 · 용산 · 한남",
    category: "가족 식사",
    searchQuery: "용산구 이촌 용산 가족 식당",
    description: "국립중앙박물관과 용산가족공원 전후로 식사 장소를 찾는 검색입니다.",
    bestFor: ["아이와", "부모님과", "박물관"],
  },
  {
    id: "gangnam-indoor-meal",
    districtSlug: "gangnam",
    districtName: "강남구",
    title: "강남 실내 일정 전후 식사",
    area: "삼성 · 신사 · 역삼",
    category: "실내·쇼핑",
    searchQuery: "강남구 삼성 신사 역삼 식당",
    description: "비 오는 날이나 실내 일정을 중심으로 식사 선택지를 찾는 검색입니다.",
    bestFor: ["비 오는 날", "쇼핑", "전시"],
  },
  {
    id: "songpa-family-lake",
    districtSlug: "songpa",
    districtName: "송파구",
    title: "잠실·석촌호수 가족 식사",
    area: "잠실 · 석촌 · 방이",
    category: "가족 식사",
    searchQuery: "송파구 잠실 석촌 방이 식당",
    description: "석촌호수와 잠실권 나들이 전후로 식사 장소를 찾는 검색입니다.",
    bestFor: ["아이와", "주말", "호수 산책"],
  },
  {
    id: "yeongdeungpo-yeouido",
    districtSlug: "yeongdeungpo",
    districtName: "영등포구",
    title: "여의도·문래 식사 선택지",
    area: "여의도 · 문래 · 영등포",
    category: "직장인·실내",
    searchQuery: "영등포구 여의도 문래 식당",
    description: "퇴근 후, 한강 산책, 실내 일정에 맞춰 식사권을 찾는 검색입니다.",
    bestFor: ["퇴근 후", "한강", "실내"],
  },
  {
    id: "seodaemun-campus",
    districtSlug: "seodaemun",
    districtName: "서대문구",
    title: "신촌·연희 가벼운 식사",
    area: "신촌 · 연희 · 이대",
    category: "대학가·카페",
    searchQuery: "서대문구 신촌 연희 식당",
    description: "대학가, 카페, 동네 산책을 묶을 때 쓰기 좋은 검색입니다.",
    bestFor: ["혼자", "대학가", "카페"],
  },
  {
    id: "gwangjin-family-park",
    districtSlug: "gwangjin",
    districtName: "광진구",
    title: "어린이대공원 전후 식사",
    area: "어린이대공원 · 건대입구 · 아차산",
    category: "가족·주말",
    searchQuery: "광진구 어린이대공원 건대입구 식당",
    description: "아이와 공원 나들이 전후로 식사 선택지를 찾는 검색입니다.",
    bestFor: ["아이와", "공원", "주말"],
  },
];

export function buildKakaoMapSearchUrl(query: string) {
  return `https://map.kakao.com/link/search/${encodeURIComponent(query.trim())}`;
}

export function getAllFoodIntents(): FoodIntent[] {
  return [...foodIntents];
}

export function getFoodIntentsByDistrict(slug: string): FoodIntent[] {
  return foodIntents.filter((intent) => intent.districtSlug === slug);
}

export function getDistrictFoodHref(district: Pick<DistrictGuide, "slug">) {
  return `/districts/${district.slug}/food`;
}

export function getDistrictsWithFood() {
  const slugs = new Set(foodIntents.map((intent) => intent.districtSlug));
  return getAllDistricts().filter((district) => slugs.has(district.slug));
}
```

- [ ] **Step 2: Add helper tests**

Create `src/lib/food.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  buildKakaoMapSearchUrl,
  getAllFoodIntents,
  getDistrictFoodHref,
  getFoodIntentsByDistrict,
} from "./food.ts";

test("builds no-key Kakao map search links", () => {
  assert.equal(
    buildKakaoMapSearchUrl("성동구 서울숲 식당"),
    "https://map.kakao.com/link/search/%EC%84%B1%EB%8F%99%EA%B5%AC%20%EC%84%9C%EC%9A%B8%EC%88%B2%20%EC%8B%9D%EB%8B%B9"
  );
});

test("returns food intents by district slug", () => {
  const mapoIntents = getFoodIntentsByDistrict("mapo");

  assert.equal(mapoIntents.length, 1);
  assert.equal(mapoIntents[0]?.districtName, "마포구");
});

test("getAllFoodIntents returns a copy", () => {
  const intents = getAllFoodIntents();
  intents.pop();

  assert.ok(getAllFoodIntents().length >= 10);
});

test("builds district food route href", () => {
  assert.equal(getDistrictFoodHref({ slug: "jongno" }), "/districts/jongno/food");
});
```

- [ ] **Step 3: Verify syntax through lint/build**

Run:

```bash
npm run lint
npm run build
```

Expected:
- lint exits `0`
- build exits `0`

### Task 2: Food UI Components

**Files:**
- Create: `src/components/food/FoodIntentCard.tsx`
- Create: `src/components/food/FoodSourceNotice.tsx`

- [ ] **Step 1: Add `FoodIntentCard`**

Create `src/components/food/FoodIntentCard.tsx`:

```tsx
import type { FoodIntent } from "@/lib/food";
import { buildKakaoMapSearchUrl } from "@/lib/food";

export default function FoodIntentCard({ intent }: { intent: FoodIntent }) {
  return (
    <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
          {intent.category}
        </span>
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {intent.districtName}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-extrabold text-slate-950">{intent.title}</h3>
      <p className="mt-2 text-sm font-semibold text-emerald-700">{intent.area}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{intent.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {intent.bestFor.map((label) => (
          <span
            key={label}
            className="rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600"
          >
            {label}
          </span>
        ))}
      </div>
      <a
        href={buildKakaoMapSearchUrl(intent.searchQuery)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
      >
        카카오맵에서 검색
        <span aria-hidden="true" className="ml-1">
          ↗
        </span>
      </a>
    </article>
  );
}
```

- [ ] **Step 2: Add `FoodSourceNotice`**

Create `src/components/food/FoodSourceNotice.tsx`:

```tsx
export default function FoodSourceNotice() {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
      <p className="font-bold text-slate-900">먹거리 정보 안내</p>
      <p className="mt-2">
        이 페이지는 카카오 API를 호출하지 않고 카카오맵 검색 결과로 연결합니다.
        영업시간, 휴무, 메뉴, 대기 여부는 방문 전 카카오맵 또는 공식 채널에서
        다시 확인해 주세요.
      </p>
    </aside>
  );
}
```

### Task 3: Food Hub Page

**Files:**
- Create: `src/app/food/page.tsx`

- [ ] **Step 1: Add `/food` page**

Create `src/app/food/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import FoodIntentCard from "@/components/food/FoodIntentCard";
import FoodSourceNotice from "@/components/food/FoodSourceNotice";
import { getAllFoodIntents, getDistrictsWithFood } from "@/lib/food";

export const metadata: Metadata = {
  title: "서울 구별 먹거리 가이드 | 서울시티",
  description:
    "서울 주요 구별로 식사하기 좋은 권역과 카카오맵 검색 링크를 정리합니다.",
};

export default function FoodPage() {
  const intents = getAllFoodIntents();
  const districts = getDistrictsWithFood();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ecfdf5_0%,#ffffff_34%,#f8fbff_100%)]">
      <section className="border-b border-emerald-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            서울 구별 먹거리 가이드
          </span>
          <h1 className="mt-5 max-w-4xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            나들이 동선에 맞춰
            <br />
            식사할 권역을 같이 고릅니다
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            맛집 순위를 임의로 매기지 않고, 구별 나들이 동선과 맞는 식사 검색
            링크를 제공합니다. 실제 영업 정보는 카카오맵에서 확인해 주세요.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {districts.map((district) => (
              <Link
                key={district.slug}
                href={`/districts/${district.slug}/food`}
                className="inline-flex min-h-11 items-center rounded-xl border border-emerald-200 bg-white px-4 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                {district.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {intents.map((intent) => (
            <FoodIntentCard key={intent.id} intent={intent} />
          ))}
        </div>
        <div className="mt-10">
          <FoodSourceNotice />
        </div>
      </div>
    </div>
  );
}
```

### Task 4: District Food Detail Pages

**Files:**
- Create: `src/app/districts/[slug]/food/page.tsx`

- [ ] **Step 1: Add static district food page**

Create `src/app/districts/[slug]/food/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FoodIntentCard from "@/components/food/FoodIntentCard";
import FoodSourceNotice from "@/components/food/FoodSourceNotice";
import { getAllDistricts, getDistrictBySlug, getDistrictSlugs } from "@/lib/districts";
import { getFoodIntentsByDistrict } from "@/lib/food";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getDistrictSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const district = getDistrictBySlug(slug);

  if (!district) {
    return {};
  }

  return {
    title: `${district.name} 먹거리 가이드 | 서울시티`,
    description: `${district.name} 나들이 동선에 맞는 식사 권역과 카카오맵 검색 링크를 확인하세요.`,
  };
}

export default async function DistrictFoodPage({ params }: PageProps) {
  const { slug } = await params;
  const district = getDistrictBySlug(slug);

  if (!district) {
    notFound();
  }

  const intents = getFoodIntentsByDistrict(slug);
  const otherDistricts = getAllDistricts()
    .filter((item) => item.slug !== district.slug)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ecfdf5_0%,#ffffff_34%,#f8fbff_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href={`/districts/${district.slug}`}
          className="inline-flex min-h-11 items-center text-sm font-bold text-slate-500 transition-colors hover:text-emerald-700"
        >
          <span aria-hidden="true" className="mr-1">
            ←
          </span>
          {district.name} 가이드로 돌아가기
        </Link>

        <section className="mt-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            {district.name} 먹거리 가이드
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            {district.name}에서 식사할 권역을
            <br />
            나들이 동선과 함께 봅니다
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            {district.summary} 아래 검색 링크는 카카오 API 없이 카카오맵 검색
            결과로 연결됩니다.
          </p>
        </section>

        {intents.length > 0 ? (
          <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {intents.map((intent) => (
              <FoodIntentCard key={intent.id} intent={intent} />
            ))}
          </section>
        ) : (
          <section className="mt-10 rounded-3xl border border-dashed border-emerald-200 bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-slate-950">
              아직 연결된 먹거리 검색이 없습니다.
            </h2>
            <p className="mt-3 text-slate-600">
              먼저 서울 주요 10개 구부터 채우고, 이후 25개 구로 확장합니다.
            </p>
          </section>
        )}

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <FoodSourceNotice />
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-extrabold text-slate-950">다른 구 먹거리 보기</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {otherDistricts.map((item) => (
                <Link
                  key={item.slug}
                  href={`/districts/${item.slug}/food`}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 font-bold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
```

### Task 5: District Page Integration

**Files:**
- Modify: `src/app/districts/[slug]/page.tsx`

- [ ] **Step 1: Import food helpers**

Add imports near the existing district imports:

```ts
import { getDistrictFoodHref, getFoodIntentsByDistrict } from "@/lib/food";
```

- [ ] **Step 2: Compute district food intents**

Inside `DistrictDetailPage`, after `const relatedPosts = getRelatedPosts(district, posts);`, add:

```ts
const foodIntents = getFoodIntentsByDistrict(district.slug).slice(0, 2);
```

- [ ] **Step 3: Render compact food section**

Add this section before the "다른 구도 이어서 보기" section:

```tsx
        <section className="mt-10 rounded-3xl border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-600">
                Food
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                나들이 전후 식사도 같이 보기
              </h2>
            </div>
            <Link
              href={getDistrictFoodHref(district)}
              className="inline-flex min-h-11 items-center rounded-xl border border-emerald-200 px-4 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              {district.name} 먹거리 보기
            </Link>
          </div>
          {foodIntents.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {foodIntents.map((intent) => (
                <Link
                  key={intent.id}
                  href={getDistrictFoodHref(district)}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <p className="font-bold text-slate-950">{intent.title}</p>
                  <p className="mt-2 text-sm font-semibold text-emerald-700">{intent.area}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {intent.description}
                  </p>
                </Link>
              ))}
            </div>
          ) : null}
        </section>
```

### Task 6: Navigation and Sitemap

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Add navigation link**

In `src/components/Header.tsx`, add desktop nav after "구별 가이드":

```tsx
<NavLink href="/food">먹거리</NavLink>
```

Add mobile nav after "구별 가이드":

```tsx
<MobileNavLink href="/food" onClick={() => setIsMenuOpen(false)}>
  🍽️ 먹거리
</MobileNavLink>
```

- [ ] **Step 2: Add footer link**

In `src/components/Footer.tsx`, add to quick links:

```tsx
<li>
  <Link href="/food" className={footerLinkClassName}>
    먹거리
  </Link>
</li>
```

- [ ] **Step 3: Add sitemap routes**

In `src/app/sitemap.ts`, add `/food` to `staticRoutes`:

```ts
{
  url: `${siteUrl}/food`,
  lastModified: new Date(),
},
```

Add food district routes after `districtRoutes`:

```ts
const districtFoodRoutes: MetadataRoute.Sitemap = getAllDistricts().map((district) => ({
  url: `${siteUrl}/districts/${district.slug}/food`,
  lastModified: new Date(),
}));
```

Return them:

```ts
return [
  ...staticRoutes,
  ...districtRoutes,
  ...districtFoodRoutes,
  ...situationRoutes,
  ...blogRoutes,
];
```

### Task 7: Optional Unified Search Integration

**Files:**
- Modify: `src/lib/search-types.ts`
- Modify: `src/components/SearchResultsView.tsx`
- Modify: `scripts/build-search-index.js`

- [ ] **Step 1: Add food search type**

In `src/lib/search-types.ts`:

```ts
export type SearchItemType = "event" | "benefit" | "blog" | "food";
```

- [ ] **Step 2: Add search UI label and colors**

In `src/components/SearchResultsView.tsx`, add:

```ts
{ label: "먹거리", value: "food" }
```

Extend `typeClassName`:

```ts
case "food":
  return "bg-emerald-100 text-emerald-700";
```

Extend `cardAccentClassName`:

```ts
case "food":
  return "from-emerald-400 to-teal-500";
```

- [ ] **Step 3: Add food items to search index generation**

In `scripts/build-search-index.js`, import or duplicate the food intent records only if the script remains CommonJS. Preferred approach for the first release: do not add food to unified search until `scripts/build-search-index.js` is migrated to consume a JSON source. This avoids duplicating TypeScript data in a CommonJS script.

Decision for this plan:
- Skip unified search in first implementation.
- Keep `/food` discoverable through Header, Footer, district pages, and sitemap.

### Task 8: Verification

**Files:**
- All changed files

- [ ] **Step 1: Run lint**

Run:

```bash
npm run lint
```

Expected:
- exit code `0`

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected:
- exit code `0`
- build output includes `/food`
- build output includes `/districts/[slug]/food` generated for 10 district paths

- [ ] **Step 3: Inspect generated pages**

Run:

```bash
rg -n "서울 구별 먹거리 가이드|카카오맵에서 검색" out/food/index.html
rg -n "종로구 먹거리 가이드|카카오 API를 호출하지 않고" out/districts/jongno/food/index.html
rg -n "https://seoulcities.net/districts/.*/food|https://seoulcities.net/food" out/sitemap.xml
```

Expected:
- `/food` contains hub copy
- `/districts/jongno/food` contains the district food copy
- sitemap contains `/food` and district food URLs

### Task 9: Commit and Push

**Files:**
- All changed files

- [ ] **Step 1: Review status**

Run:

```bash
git status --short
git diff --stat
```

Expected:
- Only food guide files, sitemap/nav edits, and this plan are staged or modified.
- Pre-existing unrelated `.gitignore` changes remain unstaged unless the user explicitly asks to include them.

- [ ] **Step 2: Stage feature files**

Run:

```bash
git add src/lib/food.ts src/lib/food.test.ts src/components/food src/app/food 'src/app/districts/[slug]/food' 'src/app/districts/[slug]/page.tsx' src/components/Header.tsx src/components/Footer.tsx src/app/sitemap.ts docs/superpowers/plans/2026-04-29-food-guide-no-key-kakao.md
```

- [ ] **Step 3: Commit**

Run:

```bash
git commit -m "feat: add Seoul food guide links"
```

- [ ] **Step 4: Push main if the user wants live deployment**

Run:

```bash
git push origin main
```

Expected:
- GitHub Actions `Deploy to Cloudflare Pages` starts on `main`.

---

## Future Plan: Public Food Data

This implementation deliberately does not fetch individual restaurant records yet.

Second release should add:
- `scripts/fetch-seoul-food.js`
- `public/data/food/index.json`
- `src/lib/seoul-food.ts`
- food cards for official public-data restaurant records
- official source notice for 서울 열린데이터광장 general restaurant license data and model restaurant data

The second release should only start after confirming the exact Seoul Open Data service names for the target districts. Do not block the no-key Kakao link MVP on that research.

## Self-Review

- Spec coverage: The plan covers no-key Kakao links, food hub, district food pages, district integration, navigation, sitemap, and verification.
- Placeholder scan: No `TBD` or `TODO` remains. Public-data ingestion is explicitly scoped out as a future release.
- Type consistency: `FoodIntent`, `DistrictSlug`, and route helpers are used consistently across tasks.
- Scope check: The plan is focused on the no-key MVP. Public data ingestion is a separate follow-up plan.
