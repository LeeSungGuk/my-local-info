# 서울시티

서울시티는 서울 생활 정보를 한곳에서 찾기 위한 Next.js App Router 프로젝트입니다. 행사, 공공 혜택, 먹거리, 블로그 정보글을 정적 사이트로 묶어 Cloudflare Pages에 배포합니다.

## 주요 기능

- 서울시 행사·축제 목록과 상세 페이지
- 공공데이터포털 기반 지원금·혜택 목록과 상세 페이지
- 서울 구별 먹거리 가이드와 카카오맵 검색 연결
- 구별 가이드와 상황별 코스 페이지
- 행사, 혜택, 먹거리, 블로그를 함께 찾는 통합 검색
- Markdown 기반 서울 생활 정보 블로그
- Cloudflare AI 기반 간단한 서울 정보 도우미 챗봇
- Google Analytics, AdSense, 쿠팡파트너스 운영 준비 설정

## 기술 스택

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Markdown, `gray-matter`, `react-markdown`, `remark-gfm`
- Cloudflare Pages, Wrangler
- GitHub Actions 자동 수집 및 배포

## 프로젝트 구조

```text
src/app                 App Router 페이지와 레이아웃
src/components          공통 UI 컴포넌트
src/lib                 데이터 로더, 검색, 정렬, 요약 로직
src/content/posts       블로그 Markdown 파일
public/data/events      서울 행사 JSON 데이터
public/data/benefits    공공 혜택 JSON 데이터
public/data/food        서울 먹거리 JSON 데이터
public/data/search      통합 검색 인덱스
scripts                 데이터 수집, 검색 인덱스 생성, 블로그 생성 스크립트
functions/api           Cloudflare Functions API
history                 날짜별 작업 기록
docs                    운영·SEO 관련 보조 문서
```

## 주요 페이지

| 경로 | 설명 |
| --- | --- |
| `/` | 홈, 상황별 코스, 추천 글, 오늘의 서울 요약, 행사·혜택 하이라이트 |
| `/events` | 서울 행사·축제 목록 |
| `/events/[id]` | 행사 상세 |
| `/benefits` | 지원금·혜택 목록 |
| `/benefits/[id]` | 혜택 상세 |
| `/food` | 서울 구별 먹거리 가이드 |
| `/districts` | 구별 가이드 목록 |
| `/districts/[slug]` | 구별 상세 가이드 |
| `/districts/[slug]/food` | 구별 먹거리 상세 가이드 |
| `/situations/[slug]` | 아이와, 비 오는 날, 무료·저비용 같은 상황별 가이드 |
| `/search` | 통합 검색 |
| `/blog` | 서울 생활 정보글 목록 |
| `/blog/[slug]` | 블로그 상세 |
| `/about`, `/notice`, `/privacy`, `/contact`, `/disclosure` | 서비스 소개와 운영 고지 |

## 데이터 소스

이 프로젝트는 두 종류의 콘텐츠를 함께 사용합니다.

1. 구조화 JSON 데이터
   - `public/data/events`: 서울 열린데이터광장 `서울시 문화행사 정보`
   - `public/data/benefits`: 공공데이터포털 `대한민국 공공서비스(혜택) 정보`
   - `public/data/food`: 서울 열린데이터광장 `서울시 일반음식점 인허가 정보`
   - `public/data/search/index.json`: 행사, 혜택, 먹거리, 블로그를 합친 통합 검색 인덱스

2. Markdown 블로그 글
   - `src/content/posts/*.md`
   - `src/lib/posts.ts`는 `.md` 파일만 읽습니다.
   - 공개 노출 대상은 frontmatter의 `region`이 `서울`, `sourceType`이 `정보글`인 글입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 자주 쓰는 명령

```bash
npm run dev                 # 개발 서버 실행
npm run lint                # ESLint 검사
npm test                    # Node test runner 기반 테스트
npm run build:search-index  # 통합 검색 인덱스 생성
npm run build               # 검색 인덱스 생성 후 Next.js 정적 빌드
```

## 데이터 수집 명령

아래 명령은 API 키가 필요합니다. 실행하면 `public/data` 아래 JSON 파일이 대량으로 바뀔 수 있으니 목적을 확인한 뒤 실행하세요.

```bash
npm run fetch:seoul-events     # 서울 행사 데이터 수집
npm run fetch:public-benefits  # 공공 혜택 데이터 수집
npm run fetch:seoul-food       # 서울 먹거리 데이터 수집
```

검색 인덱스는 수집 데이터와 블로그 글을 합쳐 만듭니다.

```bash
npm run build:search-index
```

## 환경변수

민감한 값은 `.env.local` 또는 GitHub Actions secrets에만 둡니다. 코드, 문서, 예시 출력에 실제 키를 남기지 마세요.

| 변수 | 용도 |
| --- | --- |
| `SEOUL_OPEN_DATA_API_KEY` | 서울 열린데이터광장 행사·먹거리 수집 |
| `PUBLIC_DATA_API_KEY` | 공공데이터포털 혜택 수집 |
| `GEMINI_API_KEY` | 블로그 글 생성 |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 측정 ID |
| `NEXT_PUBLIC_ADSENSE_ID` | Google AdSense publisher ID |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | AdSense 활성화 플래그 |
| `NEXT_PUBLIC_ADSENSE_SLOT_HOME` | 홈 광고 슬롯 |
| `NEXT_PUBLIC_ADSENSE_SLOT_BLOG` | 블로그 광고 슬롯 |
| `NEXT_PUBLIC_COUPANG_PARTNER_ID` | 쿠팡파트너스 제휴 ID |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Pages 배포 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Pages 배포 |

Cloudflare Functions의 `/api/chat`은 `wrangler.toml`의 `AI` binding을 사용합니다.

## 빌드와 배포

`next.config.ts`는 정적 배포를 위해 다음 기준을 사용합니다.

- `output: "export"`
- `images.unoptimized: true`
- `trailingSlash: true`

운영 배포는 Cloudflare Pages 기준입니다.

```bash
npm run build
npx wrangler pages deploy out --project-name=my-local-info
```

GitHub Actions는 다음 흐름으로 동작합니다.

- `push` to `main`: lint, test, build, Cloudflare Pages 배포
- 매일 UTC 22:30, 한국시간 오전 7:30: 행사·혜택·먹거리 수집, 블로그 글 생성, lint, test, build, 변경사항 커밋, Cloudflare Pages 배포
- 수동 실행: 동일한 수집·생성·배포 흐름 실행

워크플로우 파일은 `.github/workflows/deploy.yml`입니다.

## 문서와 작업 기록

- `history/`: 날짜별 작업 기록
- `change_log.md`: 주요 변경 기록
- `docs/prd/`: 제품 요구사항 문서
- `docs/srs/`: PRD에서 변환한 소프트웨어 요구사항 명세
- `.agents/rules/SECURITY_RULES.md`: 웹 개발 기본 보안 규칙
- `docs/`: SEO, 수집 워크플로우 등 보조 문서
- `AGENTS.md`: 에이전트 작업 원칙과 프로젝트 구조

## 작업 시 주의사항

- UI 문구는 기본적으로 한국어 톤을 유지합니다.
- 데이터 원천이 JSON인지 Markdown인지 먼저 확인한 뒤 수정합니다.
- `.env.local`과 API 키는 절대 노출하지 않습니다.
- 생성 산출물이나 의존성 디렉터리는 커밋하지 않습니다.
- `package-lock.json`은 의존성 변경이 있을 때만 수정합니다.
