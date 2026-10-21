# Security Policy

서울시티는 서울 생활 정보를 보여주는 Next.js 정적 사이트입니다. Cloudflare Pages에 배포하고, GitHub Actions로 공공 데이터 수집과 블로그 글 생성을 자동화합니다. 이 문서는 기여자와 에이전트가 가장 먼저 확인하는 보안 정책입니다.

## 문서 역할과 우선순위

- 이 파일은 보안 정책을 정의합니다. 에이전트의 승인 절차와 작업 범위는 `AGENTS.md`만 정의합니다.
- 상세 기준은 `.agents/rules/SECURITY_RULES.md`를 따르고, 어떤 절을 읽을지는 `.agents/README.md`의 `Rule Routing`으로 고릅니다.
- 지침이 충돌하면 더 엄격한 안전 기준을 선택합니다.
- 승인 정의를 이 문서에 복사하지 않습니다.

## 적용 범위

- 운영 코드, 테스트, fixture
- `functions/api`의 Cloudflare Functions
- GitHub Actions workflow, `wrangler.toml` 등 배포·운영 설정
- `public/data`, `src/content/posts`, `docs`, `history`, 로컬 메모
- 서울 열린데이터광장, 공공데이터포털, Gemini, Cloudflare Workers AI 연동
- Git 커밋, 풀 리퀘스트, 작업 계획, 완료 보고

## 민감 정보 정책

아래 값은 코드, 테스트, 로그, 문서, 커밋 메시지, PR 설명, 로컬 메모에 쓰지 않습니다.

- API 키, 토큰, 비밀번호, 인증 정보
- `.env.local` 등 `.env*` 파일의 내용
- Cloudflare 계정 ID, API 토큰, KV namespace ID 등 계정 연결 값
- 개인정보나 비공개 연락처
- 챗봇 사용자 질문 원문, 프롬프트 원문, LLM 응답 원문
- 개인정보나 비밀값이 섞일 수 있는 외부 API 응답 원문

보안 점검 결과는 비밀값 없이 아래 메타데이터로만 기록합니다.

- 파일 경로, 줄 번호
- 비밀값 종류, 발견 건수
- 상태: `active`, `revoked`, `rotated`, `false positive`, `unknown`

맥락상 값을 언급해야 하면 `<redacted>` 또는 `<masked>`로 대체합니다.

## 비밀값 관리

| 구분 | 변수 | 보관 위치 |
| --- | --- | --- |
| 비공개 | `SEOUL_OPEN_DATA_API_KEY`, `PUBLIC_DATA_API_KEY`, `GEMINI_API_KEY` | `.env.local`, GitHub Actions secrets |
| 비공개 | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions secrets |
| 공개 가능 | `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_ADSENSE_*`, `NEXT_PUBLIC_COUPANG_PARTNER_ID` | `.env.local`, GitHub Actions secrets |

- 비밀값은 Git에 커밋하지 않습니다. `.env*`는 `.gitignore`로 추적에서 제외합니다.
- `NEXT_PUBLIC_*`는 빌드 결과물에 포함되어 브라우저에 노출됩니다. 공개되어도 되는 측정 ID와 광고 슬롯만 둡니다. 토큰, 비공개 키, 관리자용 값은 `NEXT_PUBLIC_*`로 만들지 않습니다.
- GitHub Actions secrets는 필요한 step에만 `env`로 전달합니다.
- 문서에는 변수 이름과 주입 경로만 적고 값은 적지 않습니다.
- 값이 노출됐다면 코드에서 지우는 것만으로 끝내지 않고 폐기하거나 재발급합니다.

## 외부 API·AI 안전

수집 스크립트, Gemini 블로그 생성, `/api/chat`(Workers AI)을 변경하기 전에 확인합니다.

- API 키를 코드에 하드코딩하지 않았다.
- 서울 열린데이터광장, 공공데이터포털, Gemini 응답은 외부 입력으로 취급하고 타입, 필수 필드, 빈 값, 날짜 형식을 검증한 뒤 저장한다.
- 수집이 실패하거나 빈 응답이 와도 `public/data`를 깨뜨리지 않고 기존 데이터를 유지한다(`keep-existing`).
- LLM 출력을 실행 코드, 셸 명령, HTML로 신뢰하지 않는다. 모델 응답을 그대로 파일명, frontmatter, HTML로 쓰지 않고 파싱·필수 필드 검증을 거쳐 Markdown으로 저장한다.
- `/api/chat`은 사용자 질문을 system prompt가 아니라 user message로만 전달한다.
- 챗봇 요청은 method, JSON body, 질문 길이를 검증한다. 트래픽이 늘면 요청 빈도 제한을 추가한다.
- 타임아웃, 재시도, 실패 응답을 명시한다.

## 로그와 오류 처리

로그와 오류 응답에 아래 내용을 남기지 않습니다.

- 비밀값, `.env*` 내용
- 챗봇 질문 원문, 프롬프트 원문, LLM 응답 원문
- stack trace, 내부 파일 경로, 민감한 설정이 포함된 오류 객체

사용자에게는 이해하기 쉬운 짧은 오류 문구만 반환합니다. 실패 보고에는 원인, 영향, 검증 근거를 적고 민감한 값은 복사하지 않습니다.

## 배포·CI 보안

- 배포 전 `npm run lint`, `npm test`, `npm run build`를 통과해야 합니다.
- 의존성 설치는 lockfile 기반 `npm ci`를 사용합니다.
- workflow에서 `pull_request_target`을 쓰지 않아 외부 PR 코드에 쓰기 권한이나 배포 secrets가 닿지 않게 합니다.
- 자동 커밋은 `data/seoul-blog-topic-queue.json`, `public/blog-covers`, `public/data`, `src/content/posts`만 허용합니다. 그 밖의 변경이 감지되면 커밋과 배포를 중단합니다.
- 배포 전 `out/data/{events,benefits,food}/items`의 원본성 세부 데이터를 제거합니다.
- 빌드 후 `out/`에 `.env`, API 키, 도구 메타데이터(`.omo/`, `.antigravitycli/` 등)가 없는지 확인합니다.

## 필수 보안 검토

운영 코드나 문서를 바꿀 때는 `.agents/rules/SECURITY_RULES.md`의 공통 기준(1·7절)을 적용하고, 대상에 맞는 절을 추가합니다. 아래 작업은 해당 절을 확인한 뒤 진행합니다.

- 키, 토큰, `.env*`, 환경변수, `wrangler.toml` 변경
- 수집 스크립트, Gemini 블로그 생성, `/api/chat` 변경
- Markdown·HTML·외부 URL·이미지 도메인(`remotePatterns`) 렌더링 변경
- GitHub Actions, 자동 커밋, 배포 권한 변경
- 의존성 추가·업데이트, 보안 경고 대응
- 보안 핫픽스, 키 교체, 시크릿 스캔, 배포 산출물 검증

기본 모드는 조회·검토입니다. 사용자가 명시적으로 요청하기 전에는 파일을 수정하지 않습니다. 보안 검토 자체가 수정, 배포, 실제 외부 서비스 호출, 인증 정보 작업의 승인을 뜻하지는 않습니다. 승인 기준은 `AGENTS.md`를 따릅니다.

## 사고 대응

비밀값이나 개인정보 노출이 의심되면 다음 순서로 진행합니다.

1. 노출된 값을 채팅, 이슈, 문서, 보고서에 복사하지 않습니다.
2. 파일 경로, 줄 번호, 비밀값 종류, 상태만 기록합니다.
3. 값이 `active`, `revoked`, `rotated`, `false positive`, `unknown` 중 어느 상태인지 판단합니다.
4. 활성 상태로 노출된 값은 폐기하거나 재발급합니다. 해당 서비스의 콘솔은 소유자가 직접 처리합니다.
5. 코드, 문서, 테스트, 로그에서 안전하지 않은 원본을 제거합니다.
6. 시크릿 스캔을 실행하고 건수와 경로만 보고합니다.

Git 히스토리 재작성, force push, 운영 인증 정보 변경처럼 되돌리기 어려운 작업은 승인된 사고 범위를 벗어나기 전에 멈추고 사용자에게 확인합니다.

## 취약점 제보

취약점이나 노출된 비밀값을 발견하면 공개 이슈나 PR에 상세 내용을 올리지 말고 저장소 소유자에게 비공개로 전달해 주세요. 제보에는 비밀값 자체가 아니라 파일 경로, 줄 번호, 영향 범위만 포함합니다.

## 검증

보안 관련 변경은 주장을 증명하는 가장 작은 검증을 사용합니다.

- 안전한 경로로 분류한 대상에 `git diff --check -- <path>`
- 변경 파일의 문법 검사와 대상 테스트(`npm test`)
- 값을 가린 시크릿 패턴 스캔
- `.env*`가 Git에 추적되지 않는지 확인(`git ls-files`)
- 로그와 오류 응답에 키, 토큰, 질문·응답 원문이 없는지 확인
- 실제 외부 API(Gemini, 공공데이터, Cloudflare)를 호출하기 전에 mock이나 fixture로 먼저 검증

실제 외부 서비스 호출이 꼭 필요하면 이유를 설명하고 명시적 승인을 받은 뒤 진행합니다. 수집 스크립트는 API 키와 대량의 `public/data` 변경이 따르므로 목적을 확인한 뒤 실행합니다.

## 보안 보고서

보안 작업의 계획이나 보고서를 명시적으로 요청받으면 다음 내용을 담습니다. 위치와 보관 방식은 `AGENTS.md`의 문서 규칙을 따릅니다.

- 범위
- 변경하거나 검토한 파일
- 검증 결과
- 비밀값을 가린 시크릿 스캔 결과
- 키 폐기·교체 상태(해당 시)
- 남은 위험
- 후속 결정

실제 비밀값, 인증 정보, 개인정보, 프롬프트·LLM 응답 원문은 보안 문서에 저장하지 않습니다.
