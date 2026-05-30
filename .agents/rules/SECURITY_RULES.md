# 웹 개발 기본 보안 규칙

서울시티는 공개 생활 정보 정적 사이트를 Cloudflare Pages에 배포하고, GitHub Actions로 공공 데이터 수집과 블로그 생성을 자동화합니다. 이 문서는 현재 구조에 맞춘 기본 보안 규칙입니다.

## 1. 비밀값은 서버·CI 경계 밖으로 내보내지 않는다

- 실제 API 키는 `.env.local`, GitHub Actions secrets, Cloudflare 설정에만 둔다.
- `SEOUL_OPEN_DATA_API_KEY`, `PUBLIC_DATA_API_KEY`, `GEMINI_API_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`는 코드, Markdown, 로그 예시, 테스트 fixture에 쓰지 않는다.
- 브라우저에 노출되는 `NEXT_PUBLIC_*` 값에는 공개되어도 되는 측정 ID와 광고 슬롯만 둔다. 토큰, 비공개 키, 관리자용 값은 절대 `NEXT_PUBLIC_*`로 만들지 않는다.
- 키가 로그나 커밋에 들어갔다면 삭제 커밋만으로 끝내지 말고 즉시 폐기·재발급한다.

## 2. 외부 데이터는 항상 신뢰하지 않은 입력으로 다룬다

- 서울 열린데이터광장, 공공데이터포털, Gemini 응답은 모두 외부 입력이다. 필드 존재 여부, 타입, 빈 값, 날짜 형식을 검증한 뒤 저장한다.
- 수집 스크립트는 실패 시 기존 데이터를 보존하는 동작을 우선한다. 빈 응답이나 부분 실패가 `public/data`를 깨뜨리면 배포하지 않는다.
- `public/data/events/items`, `public/data/benefits/items`, `public/data/food/items`처럼 원본성 세부 데이터는 배포 산출물에서 제거한다. 공개 페이지에 필요한 요약 데이터만 노출한다.
- 생성형 AI 응답은 JSON schema, 파싱 검증, 필수 필드 검사를 거친 뒤 Markdown 파일로 저장한다. 모델 응답을 그대로 파일명, frontmatter, HTML로 사용하지 않는다.

## 3. Markdown과 HTML 렌더링은 안전한 경로만 쓴다

- 블로그 글은 `src/content/posts/*.md`와 `src/lib/posts.ts`의 frontmatter 규칙을 따른다.
- 사용자나 AI가 만든 문자열을 `dangerouslySetInnerHTML`로 렌더링하지 않는다.
- Markdown 렌더링은 현재처럼 `react-markdown` 기반으로 유지하고, HTML raw 렌더링 플러그인을 추가하지 않는다.
- 외부 링크, 이미지 URL, 지도 링크는 필요한 도메인만 허용한다. 새 이미지 원천이 필요하면 `next.config.ts`의 `remotePatterns`를 함께 검토한다.

## 4. Cloudflare Functions API는 작게, 검증 가능하게 유지한다

- 현재 공개 API는 `functions/api/chat.js`의 `/api/chat`이다. 새 API를 추가할 때는 요청 method, JSON body, 필수 필드, 문자열 길이를 먼저 검증한다.
- Cloudflare AI는 `wrangler.toml`의 `AI` binding을 사용한다. AI 공급자 키를 클라이언트 코드나 `NEXT_PUBLIC_*` 환경변수로 넘기지 않는다.
- 사용자 질문은 system prompt가 아니라 user message로 넣는다. system prompt에는 공개 검색 데이터와 고정 지침만 둔다.
- AI 응답은 HTML로 렌더링하지 않고 plain text로 정리한다. 응답에 Markdown, 링크, 스크립트가 섞여도 실행 가능한 콘텐츠로 취급하지 않는다.
- 공개 챗봇이 트래픽을 받기 시작하면 질문 길이 제한, 요청 빈도 제한, 실패 응답 표준화를 추가한다.

## 5. CI/CD는 최소 권한과 검증을 기본값으로 둔다

- GitHub Actions secrets는 필요한 step에만 `env`로 전달한다.
- workflow에서 `pull_request_target`을 쓰지 않는다. 외부 PR 코드에 write 권한이나 배포 secrets가 닿지 않게 한다.
- 의존성 설치는 lockfile 기반 `npm ci`를 사용한다.
- 배포 전에는 `npm run lint`, `npm test`, `npm run build`를 통과해야 한다.
- 자동 커밋 step은 생성 데이터와 블로그 글 변경만 포함하는지 확인한다. 의도하지 않은 `.env`, 빌드 산출물, 도구 메타데이터가 섞이면 배포 전에 멈춘다.

## 6. 의존성은 작게 유지하고 업데이트 근거를 남긴다

- 새 패키지는 기능상 필요할 때만 추가한다. 이미 있는 Next.js, React, Node 표준 API로 해결되면 새 의존성을 넣지 않는다.
- `package-lock.json`은 의존성 변경이 있을 때만 수정한다.
- 보안 경고가 있는 직접 의존성은 업데이트하거나 대체한다. 개발 전용 도구 경고도 배포 경로에 영향을 주는지 확인한다.

## 7. 공개 페이지에는 개인정보와 운영 정보가 들어가지 않는다

- 이 서비스는 공개 생활 정보 중심이다. 사용자 개인정보, 관리자 메모, 내부 운영 토큰을 JSON이나 Markdown에 넣지 않는다.
- Google Analytics, AdSense, 쿠팡파트너스 값은 공개 가능한 식별자만 사용한다. 계정 관리용 키나 결제 정보는 저장하지 않는다.
- 오류 메시지는 사용자가 이해할 수 있는 짧은 문구로 반환하고, stack trace나 내부 파일 경로를 노출하지 않는다.

## 8. 배포 산출물 기준으로 한 번 더 확인한다

- `npm run build` 후 `out/`에 원본 raw item, `.env`, API 키, 내부 도구 폴더가 포함되지 않았는지 확인한다.
- 새 문서나 블로그 글에 실제 키, 개인 연락처, 비공개 URL이 들어가지 않았는지 확인한다.
- 보안 관련 변경은 README나 관련 docs에 반영해 다음 작업자가 같은 기준을 볼 수 있게 한다.

## 변경 전 체크리스트

- [ ] 새 환경변수가 있다면 공개값인지 비밀값인지 구분했다.
- [ ] 외부 API나 AI 응답을 저장하기 전에 타입과 필수 필드를 검증했다.
- [ ] 브라우저에 렌더링되는 콘텐츠가 HTML 실행 경로를 타지 않는다.
- [ ] 새 API는 method, body, 길이, 실패 응답을 검증한다.
- [ ] CI secrets는 필요한 step에만 전달된다.
- [ ] `npm run lint`, `npm test`, `npm run build`로 검증할 수 있다.
