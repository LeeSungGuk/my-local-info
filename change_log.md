# 변경 기록 (Change Log)

## 2026-03-17

### 1. 프로젝트 설계도 작성
- **파일**: `PROJECT_PLAN.md`
- **내용**: 프로젝트 전체 설계도 작성
  - 목표: 공공데이터 자동 수집 → AI 블로그 자동 작성 → 수익화 웹사이트
  - 기술 스택: Next.js, TypeScript, Tailwind CSS, Gemini API, GitHub Actions, Cloudflare Pages
  - 페이지 구성: 메인, 상세, 블로그 목록, 블로그 상세 (총 4개)
  - 수익화: Google AdSense + 쿠팡 파트너스
  - 자동화: GitHub Actions (매일 아침 7시 실행)
  - 환경변수: GEMINI_API_KEY, PUBLIC_DATA_API_KEY, NEXT_PUBLIC_ADSENSE_ID, NEXT_PUBLIC_GA_ID
- **비고**: 이후 삭제됨

---

### 2. Next.js 프로젝트 생성
- **폴더**: `my-local-info/`
- **명령어**: `npx -y create-next-app@latest my-local-info --typescript --tailwind --app --src-dir --eslint --use-npm`
- **적용된 설정**:
  - ✅ TypeScript 사용
  - ✅ Tailwind CSS 사용
  - ✅ App Router 사용
  - ✅ src 디렉토리 안에 코드 배치
  - ✅ ESLint (코드 품질 검사) 포함
  - ✅ npm 패키지 매니저 사용
- **결과**: 360개 패키지 설치 완료, 취약점 0개, Git 저장소 자동 초기화

---

### 3. 추가 패키지 설치
- **설치 명령어**:
  - `npm install next-sitemap`
  - `npm install -D wrangler`
- **설치된 패키지**:
  - `next-sitemap` — 검색엔진용 사이트맵 자동 생성 (일반 의존성)
  - `wrangler` — Cloudflare 배포용 도구 (개발 의존성)
- **결과**: 정상 설치 완료

---

### 4. 웹사이트 페이지 구조 구현
- **생성된 파일**:
  - `src/data/dummy.ts` — 더미 데이터 (행사 4개, 혜택 4개, 블로그 3개)
  - `src/components/Header.tsx` — 반응형 헤더 (모바일 햄버거 메뉴 포함)
  - `src/components/Footer.tsx` — 3컬럼 반응형 푸터
  - `src/components/EventCard.tsx` — 행사/축제 카드 컴포넌트
  - `src/components/BenefitCard.tsx` — 지원금/혜택 카드 컴포넌트
- **수정된 파일**:
  - `src/app/globals.css` — Noto Sans KR 폰트, 애니메이션 추가
  - `src/app/layout.tsx` — 한국어 설정, Header/Footer 적용
  - `src/app/page.tsx` — 메인 페이지 (히어로 + 행사/혜택 카드 + 블로그 미리보기)
- **새 페이지**:
  - `src/app/events/[id]/page.tsx` — 행사 상세 페이지
  - `src/app/benefits/[id]/page.tsx` — 혜택 상세 페이지
  - `src/app/blog/page.tsx` — 블로그 목록 페이지
  - `src/app/blog/[slug]/page.tsx` — 블로그 상세 페이지
- **결과**: 빌드 성공 (TypeScript 에러 0개), 개발 서버 정상 실행

---

### 5. Cloudflare Pages 정적 배포 설정
- **기능 추가**:
  - `next.config.ts`에 `output: "export"`, `images.unoptimized: true`, `trailingSlash: true` 설정 추가
  - 프로젝트 루트에 배포 설정용 `wrangler.toml` 파일 생성 (`my-local-info`, `out` 디렉토리 지정)
- **버그 수정**:
  - 동적 라우팅 페이지(`events/[id]`, `benefits/[id]`, `blog/[slug]`)가 정적 빌드(`export`) 환경에서 작동하도록 `generateStaticParams` 함수 추가
- **결과**: `npm run build`를 통한 정적 HTML 추출(Static Export) 빌드 성공

---

### 6. 성남시 맞춤 메인 페이지 리뉴얼
- **샘플 데이터 추가**:
  - `public/data/local-info.json` 파일 생성
  - 성남시 행사 3건, 지원금/혜택 2건 샘플 데이터 등재
- **메인 페이지 UI 개편**:
  - `src/app/page.tsx` 리뉴얼
  - 기존 더미 데이터(`dummy.ts`) 대신 서버 컴포넌트 환경에서 `local-info.json` 파일 직접 로드 (`fs.readFile`) 적용 (Static Export 호환 확인 완료)
  - 히어로 섹션 타이틀 "성남시 생활 정보, 한눈에 확인하세요"로 변경
  - 페이지 색상 테마를 따뜻하고 친근한 주황/코랄 계열(amber, orange, rose)로 전면 수정
  - 페이지 하단에 "데이터 출처: 공공데이터포털", "마지막 업데이트 날짜" 정보 추가
- **검증 완료**: 개발 서버(`localhost:3000`) 브라우저 검증 및 정적 빌드 성공

---

### 7. 성남시 행사 및 혜택 상세 페이지 리뉴얼
- **데이터 연동 및 정적 경로 생성**:
  - `events/[id]/page.tsx`와 `benefits/[id]/page.tsx` 로직 수정
  - `dummy.ts` 제거 및 `local-info.json` 직접 로드 (`fs.readFile`)
  - `generateStaticParams` 함수도 `local-info.json` 기반으로 추출하도록 개선 
- **페이지 UI/UX 개편**:
  - 행사 페이지: 따뜻한 **오렌지/로즈** 테마, `< 목록으로 돌아가기` 버튼 추가, 행사 정보 카드, `자세히 보기 →` 원본 링크 버튼 추가
  - 혜택 페이지: 따뜻한 **앰버/오렌지** 테마, `< 목록으로 돌아가기` 버튼, 혜택 정보 카드(지원 대상, 기간, 장소 등), `자세히 보기 →` 버튼 추가
- **검증 완료**: `npm run build`를 통한 정적 HTML (Static Export) 생성 검증 완료

---

### 8. GitHub 원격 저장소 업로드
- **작업 내용**:
  - `git add .` 및 `git commit`을 통해 현재까지의 변경점 로컬 저장소에 저장
  - GitHub CLI(`gh`)를 활용해 `my-local-info`라는 공개(Public) 저장소 생성
  - 메인 브랜치에 코드 업로드(Push) 완료
- **보안 사항**: `.gitignore` 파일을 통해 자동으로 `.env` 파일과 민감한 보안 키 정보 등이 업로드되지 않도록 완벽히 차단함

---

### 9. Cloudflare Pages 온라인 배포
- **배포 내역**:
  - `npm run build`를 통해 `out` 폴더에 정적 사이트(Static HTML) 성공적으로 추출 (SSG 반영 완료)
  - `npx wrangler pages deploy out` 명령어를 통해 Cloudflare Pages에 97개의 파일 업로드 및 배포 완료
- **사이트 URL**: [https://364a364e.my-local-info-6ny.pages.dev](https://364a364e.my-local-info-6ny.pages.dev) (또는 `https://my-local-info-6ny.pages.dev`)
- **결과**: 로컬 환경을 넘어 실제 인터넷에 첫 라이브 서비스 배포 성공
