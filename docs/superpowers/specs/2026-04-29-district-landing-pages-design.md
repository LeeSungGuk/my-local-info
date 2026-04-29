# Seoul District Landing Pages Design

## Goal

Build SEO-focused Seoul district landing pages that improve traffic quality and AdSense approval readiness by turning existing public data into useful local decision pages.

The pages should not be generic district introductions. Each page should help a visitor decide whether a district fits their current need, then show current events, benefits, related guides, and practical routes.

## Primary Outcomes

- Create durable landing pages for district-level search intent such as "종로구 아이와 갈만한 곳", "마포구 무료 행사", and "송파구 주말 나들이".
- Add enough editorial context that pages read as curated local guides, not copied public-data listings.
- Reuse the current daily data update pipeline so district pages refresh automatically after events and benefits are regenerated.
- Keep the first version focused enough to ship with quality.

## Phase 1 Scope

Phase 1 covers 10 high-value districts:

- 종로구
- 중구
- 마포구
- 성동구
- 용산구
- 강남구
- 송파구
- 영등포구
- 서대문구
- 광진구

These districts were chosen because they map well to existing Seoul travel, culture, family, shopping, river, and transit search intent.

## URL Structure

- `/districts`
- `/districts/jongno`
- `/districts/jung`
- `/districts/mapo`
- `/districts/seongdong`
- `/districts/yongsan`
- `/districts/gangnam`
- `/districts/songpa`
- `/districts/yeongdeungpo`
- `/districts/seodaemun`
- `/districts/gwangjin`

The `/districts` page is a hub that introduces the district guide system and links to each district. Each detail page is an independent static SEO landing page.

## Content Model

Add a new district metadata module at `src/lib/districts.ts`.

Each district record should include:

- `slug`
- `name`
- `headline`
- `summary`
- `bestFor`
- `keywords`
- `nearbyAreas`
- `editorialIntro`
- `recommendedSituations`
- `halfDayRoutes`
- `officialLinks`

The metadata should be hand-written for Phase 1. It is the main source of originality and should stay concise but specific.

## District Page Layout

Each district page should include:

1. Hero
   - District name
   - Clear positioning statement
   - Best-fit tags such as "아이와", "데이트", "실내", "무료", "산책"

2. "이 구는 이런 사람에게 맞아요"
   - Hand-written editorial guidance.
   - Explain why this district is useful for specific situations.

3. Current Events
   - Filter existing event data by `event.district`.
   - Show upcoming or currently visible events first.
   - Highlight free events separately when available.

4. Benefits
   - Filter existing benefit data by `benefit.district`.
   - Show a small list of district-specific benefits.
   - If there are no district-specific benefits, show a clear empty state and link to the broader benefits page.

5. Situation Recommendations
   - Map each district to useful situations such as kids, rainy-day, free, date, solo, parents, night-view, or weekend.
   - Link to existing situation pages and related blog posts when relevant.

6. Half-day Routes
   - 2 to 3 hand-written route ideas.
   - Each route should be framed as a decision aid, not a guaranteed itinerary.
   - Avoid unstable claims about exact prices, hours, or availability.

7. Source and Update Notice
   - Show event and benefit collection timestamps.
   - Explain that final schedules, eligibility, and closures must be checked at official sources.

## Dynamic Update Model

The pages should be static pages regenerated during the current build pipeline.

Current daily flow:

1. GitHub Actions fetches Seoul events.
2. GitHub Actions fetches public benefits.
3. Blog data and search index are generated.
4. `npm run build` exports the static site.
5. Cloudflare Pages deploys the generated `out` directory.

District pages should join this flow. They do not need a runtime database or server-rendered requests.

Expected behavior:

- District editorial text changes only when committed.
- District event and benefit sections update automatically after the daily data fetch and deploy.
- If a district has no current events, the page still remains useful because the editorial guide and route sections are present.

## Components

Prefer small reusable components:

- `DistrictCard` for the hub page.
- `DistrictHero` for detail pages.
- `DistrictCurrentEvents` for filtered event lists.
- `DistrictBenefits` for filtered benefit lists.
- `DistrictRoutes` for hand-written routes.
- `DistrictSourceNotice` for data timestamps and official-source warning.

Reuse existing `EventCard`, `BenefitCard`, and post card/list patterns where practical. Avoid inventing a new visual system.

## SEO and AdSense Considerations

Each district page should have:

- Unique page title and description.
- H1 that names the district and intent clearly.
- Enough original editorial text before data lists.
- Links to official sources where useful.
- Internal links to events, benefits, situations, and blog posts.
- Sitemap inclusion.

Avoid:

- Thin pages made only of filtered data.
- Mass-generated generic district copy.
- Overly promotional wording.
- Claims that require real-time verification.

## Error and Empty States

- No events: show "현재 노출 가능한 행사가 없습니다" and link to `/events`.
- No benefits: show "현재 구 단위로 연결된 혜택이 없습니다" and link to `/benefits`.
- Unknown slug: return `notFound()`.
- Missing collection timestamp: show "수집 시각 정보 없음".

## Testing

Verification should include:

- `npm run lint`
- `npm run build`
- Confirm `/districts` and all 10 detail routes are generated.
- Confirm sitemap includes the district routes.
- Confirm at least one district page shows filtered events or a correct empty state.
- Confirm old non-Seoul blog content remains absent from `/blog`.

## Rollout

Phase 1 ships 10 district pages.

Phase 2 can expand to all 25 Seoul districts after the first 10 pages are reviewed for quality, search clarity, and AdSense readiness.

Phase 3 can add richer query pages such as "district + situation" if traffic data shows demand.
