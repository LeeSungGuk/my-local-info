# District Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add SEO-focused Seoul district landing pages that combine hand-written district guidance with automatically refreshed event and benefit data.

**Architecture:** Add a district metadata module, reusable district page components, a `/districts` hub route, and a `/districts/[slug]` static route. District editorial content is committed in code, while events and benefits are filtered from the existing daily-generated JSON indexes at build time.

**Tech Stack:** Next.js App Router, TypeScript, React, Tailwind CSS, static export, existing public JSON data loaders.

---

### Task 1: District Metadata

**Files:**
- Create: `src/lib/districts.ts`

- [x] **Step 1: Create district types and records**

Add `DistrictGuide`, `DistrictRoute`, `DistrictSituation`, and `DistrictOfficialLink` types. Export 10 records for `jongno`, `jung`, `mapo`, `seongdong`, `yongsan`, `gangnam`, `songpa`, `yeongdeungpo`, `seodaemun`, and `gwangjin`.

Each record must include:

```ts
{
  slug: "jongno",
  name: "종로구",
  headline: "궁궐, 전시, 골목 산책을 한 번에 고르기 좋은 도심 구",
  summary: "경복궁과 창덕궁, 서촌, 대학로처럼 역사와 문화가 가까운 권역입니다.",
  bestFor: ["궁궐 산책", "부모님과", "비 오는 날 실내"],
  keywords: ["종로구 가볼만한 곳", "종로구 아이와", "종로구 무료 행사"],
  nearbyAreas: ["광화문", "서촌", "인사동", "대학로"],
  editorialIntro: "...",
  recommendedSituations: [
    { label: "비 오는 날", href: "/situations/rainy-day", reason: "..." }
  ],
  halfDayRoutes: [
    {
      title: "광화문과 서촌을 묶는 도심 산책",
      stops: ["광화문", "경복궁", "서촌"],
      description: "..."
    }
  ],
  officialLinks: [
    { label: "종로구청", url: "https://www.jongno.go.kr" }
  ]
}
```

- [x] **Step 2: Add helpers**

Export:

```ts
export function getAllDistricts(): DistrictGuide[];
export function getDistrictBySlug(slug: string): DistrictGuide | null;
export function getDistrictSlugs(): string[];
```

Expected behavior:
- `getAllDistricts()` returns a copy of the array.
- `getDistrictBySlug("mapo")` returns 마포구.
- Unknown slugs return `null`.

### Task 2: District Reusable Components

**Files:**
- Create: `src/components/districts/DistrictCard.tsx`
- Create: `src/components/districts/DistrictMiniEventCard.tsx`
- Create: `src/components/districts/DistrictMiniBenefitCard.tsx`
- Create: `src/components/districts/DistrictSourceNotice.tsx`

- [x] **Step 1: Add `DistrictCard`**

`DistrictCard` receives a `DistrictGuide` and renders:
- name
- headline
- summary
- bestFor tags
- nearbyAreas
- link to `/districts/${slug}`

- [x] **Step 2: Add `DistrictMiniEventCard`**

`DistrictMiniEventCard` receives a `SeoulEventSummary` and renders:
- category and district chips
- title
- period
- venue
- fee/free indicator
- link to `/events/${event.id}`

Use local period formatting to avoid depending on client components.

- [x] **Step 3: Add `DistrictMiniBenefitCard`**

`DistrictMiniBenefitCard` receives a `PublicBenefitSummary` and renders:
- field and district chips
- title
- provider
- deadline via `formatBenefitDeadline`
- target summary
- link to `/benefits/${benefit.id}`

- [x] **Step 4: Add `DistrictSourceNotice`**

`DistrictSourceNotice` receives:

```ts
{
  eventsCollectedAt: string;
  benefitsCollectedAt: string;
}
```

It renders data source names, collection timestamps, and a warning that schedules and eligibility should be verified through official links.

### Task 3: District Hub Page

**Files:**
- Create: `src/app/districts/page.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Footer.tsx`

- [x] **Step 1: Create `/districts` page**

Use `getAllDistricts()` and `DistrictCard`.

Page structure:
- Hero with H1 "서울 구별 가이드"
- Short explanation that pages combine editorial guidance with current event and benefit data
- Grid of 10 `DistrictCard` items
- Bottom notice about daily data updates

- [x] **Step 2: Add metadata**

Metadata:

```ts
title: "서울 구별 가이드 | 서울시티"
description: "종로구, 마포구, 성동구, 송파구처럼 서울 주요 구별 행사, 혜택, 나들이 기준을 한곳에서 확인하세요."
```

- [x] **Step 3: Add navigation links**

Add "구별 가이드" to the desktop and mobile header navigation after "상황별 코스". Add the same link to the footer quick links.

### Task 4: District Detail Pages

**Files:**
- Create: `src/app/districts/[slug]/page.tsx`

- [x] **Step 1: Add static params and metadata**

Use `getDistrictSlugs()` for `generateStaticParams()`.

`generateMetadata()` should return:

```ts
title: `${district.name} 가이드 | 서울시티`
description: `${district.name}의 현재 행사, 혜택, 상황별 추천과 반나절 코스를 정리합니다.`
```

Unknown slugs return an empty metadata object and `notFound()` in the page.

- [x] **Step 2: Filter data**

In the page, load:

```ts
const [eventsIndex, benefitsIndex, allPosts] = await Promise.all([
  getEventsIndex(),
  getBenefitsIndex(),
  Promise.resolve(getAllPosts()),
]);
```

Filter:
- visible events where `event.district === district.name`, sorted by start date
- free events from the same district
- benefits where `benefit.district === district.name`
- related posts by matching district bestFor/keywords against post tags/title/summary where useful

- [x] **Step 3: Render page sections**

Sections:
- hero
- "이 구는 이런 사람에게 맞아요"
- current events, max 6
- free events, max 3
- benefits, max 4
- situation recommendations
- half-day routes
- official links
- source notice

For empty data:
- no events: show "현재 노출 가능한 행사가 없습니다" and link to `/events`
- no benefits: show "현재 구 단위로 연결된 혜택이 없습니다" and link to `/benefits`

### Task 5: Sitemap and Validation

**Files:**
- Modify: `src/app/sitemap.ts`

- [x] **Step 1: Add district routes to sitemap**

Import `getAllDistricts()` and append:

```ts
const districtRoutes = getAllDistricts().map((district) => ({
  url: `${siteUrl}/districts/${district.slug}`,
  lastModified: new Date(),
}));
```

Also add `/districts` to static routes.

- [x] **Step 2: Run verification**

Run:

```bash
npm run lint
npm run build
```

Expected:
- lint exits 0
- build exits 0
- build output includes `/districts` and `/districts/[slug]` with 10 generated paths
- search index still reports 17 blog entries unless a scheduled data update changed the count

- [x] **Step 3: Inspect generated content**

Run:

```bash
rg -n "/districts/(jongno|mapo|gangnam)" out/sitemap.xml out/districts/index.html
rg -n "어업인|원양|수산|귀어|근로·자녀장려금" out/blog/index.html
```

Expected:
- sitemap contains district routes
- old non-Seoul blog keywords are absent

### Task 6: Commit

**Files:**
- All created and modified files

- [x] **Step 1: Review diff**

Run:

```bash
git diff --stat
git diff -- src/lib/districts.ts src/app/districts src/components/districts src/app/sitemap.ts
```

- [x] **Step 2: Commit implementation**

Run:

```bash
git add src/lib/districts.ts src/components/districts src/app/districts src/components/Header.tsx src/components/Footer.tsx src/app/sitemap.ts docs/superpowers/plans/2026-04-29-district-landing-pages.md
git commit -m "feat: add Seoul district landing pages"
```
