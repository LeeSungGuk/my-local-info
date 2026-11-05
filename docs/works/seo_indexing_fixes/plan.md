# 검색 색인 설정 바로잡기 구현 계획

- 상태: 운영 배포 및 확인 완료(PR #20), 네이버 서치어드바이저 소유확인 진행 중
- 작성일: 2026-11-05
- 상위 목록: [works 현황](../README.md)
- 입력: 운영 사이트 SEO 분석 결과(2026-11-05, 대화로 전달), [PRD 11절](../../prd/seoulcity_prd.md#11-seo와-신뢰-요구사항), [SRS](../../srs/seoulcity_srs.md) `REQ-NF-007`·`REQ-NF-010`

## 진행 체크 요약

완료한 작업:

- [x] 분석 결과 6개 항목을 코드와 운영 사이트에서 확인 (1절)
- [x] 운영 코드 변경 승인 (2026-11-05, A·B·C와 혜택 상세 전체 noindex)
- [x] `W-01` ~ `W-04` 로컬 구현
- [x] `W-05` 검증 (lint·test·build·빌드 산출물 전수 검사, 4절)
- [x] `W-06` PRD 11절, SRS `REQ-NF-007`·`REQ-NF-010`·`REQ-NF-013`~`REQ-NF-015`, `change_log.md` 갱신

남은 작업:

- [x] [PR #20](https://github.com/LeeSungGuk/my-local-info/pull/20) Cursor 검사 3개 통과, squash 병합(`3dd9d7e99`), [자동 배포 41997194125](https://github.com/LeeSungGuk/my-local-info/actions/runs/41997194125) 성공
- [x] 운영 확인(2026-11-05): 사이트맵 347개 주소 모두 끝 슬래시, 혜택 상세 0개, 시각형 lastmod 0개. `/blog/` 200 응답. `/`, `/blog/`, `/situations/kids/`의 canonical·`og:url`이 자기 주소이고 `/events/?view=ongoing`은 `/events/`를 가리킴. 혜택 상세는 `noindex, follow`, 혜택 목록은 색인 대상 유지
- [x] Google Search Console 도메인 속성 `seoulcities.net` 등록. Cloudflare DNS에 TXT 레코드(`@`, `google-site-verification=…`) 추가 후 소유권 확인 (2026-11-05, 운영자 승인·로그인 후 진행). 공용 DNS 1.1.1.1·8.8.8.8 조회로 반영 확인, 기존 CNAME과 사이트 200 응답 유지. 확인을 유지하려면 이 TXT 레코드를 지우지 않는다
- [x] `https://seoulcities.net/sitemap.xml` 제출, 상태 ‘성공’, 발견된 페이지 1,450개 (2026-11-05, 배포 전 기존 사이트맵 기준)
- [x] 네이버 서치어드바이저에 `https://seoulcities.net` 등록 (2026-11-05, 운영자 약관 동의 후 진행)
- [x] 소유확인용 HTML 태그를 `src/app/layout.tsx`의 `verification.other`에 추가. 파일 업로드 방식은 Cloudflare Pages가 `.html` 주소를 308로 리다이렉트해서(`/404.html` → `/404`) 쓰지 않음
- [ ] 태그 배포 후 네이버 소유확인, 사이트맵(`https://seoulcities.net/sitemap.xml`)과 robots.txt 제출
- [ ] (운영자) 배포 2~4주 뒤 Search Console ‘페이지 색인 생성’ 보고서에서 색인 수와 ‘크롤링됨 - 현재 색인 생성되지 않음’ 수 확인

## 1. 확인 결과

| 분석 항목 | 판단 | 근거 (2026-11-05 확인) |
| --- | --- | --- |
| 검색 등록 인증 태그 없음 | 사실 | 운영 HTML에 `google-site-verification`, `naver-site-verification` 없음. 등록과 제출은 운영자 계정 작업 |
| 사이트맵 주소 끝 슬래시 | 사실 | `/blog` 요청이 308로 `/blog/` 이동. `next.config.ts`는 `trailingSlash: true`, `src/app/sitemap.ts`는 슬래시 없이 생성 |
| canonical 없음 | 사실 | 모든 페이지에 canonical 없음. 추가로 모든 페이지의 `og:url`이 홈 주소였음 (루트 레이아웃 `openGraph.url` 상속) |
| 혜택 페이지 비중 | 사실 | 운영 사이트맵 1,450개 중 혜택 상세 1,104개(76%). 본문 중앙값 253자, 200자 미만 424개, 300자 미만 659개, 메타 설명이 제목과 같은 페이지 18개. 긴 페이지도 정부24 원문 위주 |
| lastmod 동일 시각 | 사실 | 150개가 `2026-11-05T02:42:04.350Z`. 빌드 시각이 아니라 행사 수집 시각을 행사 122개·구 20개·상황 3개·목록 5개에 똑같이 넣고 있었음 |
| 도메인 나이 | 코드 대상 아님 | 시간과 외부 링크가 필요 |

## 2. 결정

- **혜택 상세는 전체 `noindex, follow`, 사이트맵 제외.** 짧은 페이지만 빼면 원문 위주 페이지 445개가 남기 때문이다. 페이지는 그대로 남아 목록·구 페이지·통합 검색에서 볼 수 있고, 혜택 목록(`/benefits/`)은 색인 대상이다. 내용을 보강한 페이지는 나중에 개별로 다시 색인할 수 있다.
- **canonical은 루트 레이아웃 한 곳에서 지정.** `alternates.canonical: "./"`를 Next.js가 각 페이지 경로로 풀고 `trailingSlash`에 맞춰 끝 슬래시를 붙인다 (`node_modules/next/dist/lib/metadata/resolvers/resolve-url.js`의 `resolveRelativeUrl`·`resolveAbsoluteUrlWithPathname`). 쿼리 주소(`/events/?view=ongoing`)는 원래 주소(`/events/`)를 가리킨다. 새 페이지도 자동으로 적용된다.
- **`og:url`도 `"./"`.** openGraph를 따로 지정하는 블로그 상세·구·상황 페이지는 레이아웃 값을 덮어쓰므로 각각 `url: "./"`를 넣었다.
- **lastmod는 실제 콘텐츠 날짜만.** 근거 날짜가 없으면 생략한다.

| 주소 | lastmod |
| --- | --- |
| 행사 상세 | 행사 등록일 `registeredAt` (원천 `RGSTDATE`) |
| 블로그 상세 | `updatedAt`, 없으면 `date` |
| `/blog/` · `/events/` · `/benefits/` | 담긴 글·행사·혜택 중 가장 최근 날짜 |
| `/` | 위 세 목록 중 가장 최근 날짜 |
| `/districts/`, `/food/`, 구·구 먹거리·상황 페이지 | 생략 |

한계: 원천 행사 데이터에는 수정일이 없어서, 등록 후 원천에서 바뀐 행사는 lastmod에 반영되지 않는다.

## 3. 작업 단위와 변경 파일

| 작업 | 파일 | 변경 내용 |
| --- | --- | --- |
| `W-01` 사이트맵 주소·lastmod·혜택 제외 | `src/app/sitemap.ts` | 경로와 실제 날짜 목록을 만든 뒤 한 함수에서 끝 슬래시를 붙임. 혜택 상세 제외, 수집 시각과 빌드 시각 대체값 제거 |
| `W-02` canonical·og:url | `src/app/layout.tsx` | `alternates.canonical: "./"`, `openGraph.url: "./"` |
| `W-03` openGraph 덮어쓰는 페이지 | `src/app/blog/[slug]/page.tsx`, `src/app/districts/[slug]/page.tsx`, `src/app/situations/[slug]/page.tsx` | `openGraph.url: "./"` |
| `W-04` 혜택 상세 noindex | `src/app/benefits/[id]/page.tsx` | `robots: { index: false, follow: true }` |
| `W-05` 검증 | 없음 | 4절 |
| `W-06` 문서 | 이 문서, `docs/works/README.md`, PRD 11절, SRS, `change_log.md` | 결정과 결과 기록 |

## 4. 검증 결과 (2026-11-05, 로컬)

- `npx eslint` 변경 파일 6개 통과, `npx tsc --noEmit` 통과, `npm test` 134개 통과.
- `npm run lint` 전체는 오류 6개가 남지만 모두 Git에서 제외된 로컬 복사본 `.codex/plugins/superpowers/` 파일이다. 저장소 추적 파일은 통과.
- `npm run build` 성공. 빌드가 다시 만든 `public/data/search/index.json`은 로컬 미추적 데이터 때문에 바뀐 것이라 되돌렸다.
- 빌드 산출물 `out/` 전수 검사 결과:
  - `sitemap.xml` 356개 주소 모두 끝 슬래시 포함, 모두 실제 `index.html`이 있음, 혜택 상세 0개.
  - lastmod에 시각형 값 없음. 같은 날짜가 가장 많은 경우가 15개(`2026-10-16`, `2026-10-23`). lastmod 생략 25개(`/districts/`, `/food/`, 구 10개, 구 먹거리 10개, 상황 3개).
  - `index.html` 1,467개 중 1,465개의 canonical과 `og:url`이 자기 주소와 일치. 예: `/` → `https://seoulcities.net/`, `/events/` → `https://seoulcities.net/events/`.
  - 혜택 상세 1,103개 모두 `<meta name="robots" content="noindex, follow">`. 그 밖에 noindex인 페이지는 404 페이지뿐.
  - 나머지 2개는 `404/`·`_not-found/` 페이지로, canonical이 `/_not-found/`다. Next.js 기본 404 페이지라 원래 `noindex`이고 색인되지 않는다.
- 로컬 데이터 기준 수치다. 운영 배포 시 그날 수집 데이터에 따라 행사·글 수가 달라진다.
- PR 전 최신 `origin/main`(자동 수집 커밋 `d5c09582f`) 위에서 다시 확인: `npm test` 134개 통과, 빌드 성공, 사이트맵 347개, `index.html` 1,458개 중 404 페이지 2개 외 canonical·`og:url` 일치, 혜택 상세 1,103개 noindex.

## 5. 남은 후속 제안

- 행사 상세(로컬 133개)도 서울문화포털 원문을 옮긴 성격이다. 배포 후 색인 보고서에서 행사 페이지 상태를 보고 같은 정책을 적용할지 정한다.
- 통합 검색 `/search/?q=`는 이제 canonical이 `/search/`로 모인다. 검색 결과 주소 자체를 noindex로 둘지는 SRS 15절 열린 질문으로 남긴다.
- 404 페이지의 canonical(`/_not-found/`)은 noindex라 영향이 없어 그대로 둔다.
