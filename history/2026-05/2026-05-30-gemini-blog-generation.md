# 2026-05-30 작업 기록

## 요약

- GitHub Actions의 Node.js 20 런타임 경고 원인을 확인했다.
- Gemini 기반 블로그 글 생성 스크립트의 JSON 파싱 안정성을 개선했다.
- 실제 Gemini 키로 블로그 생성 흐름을 검증하고, 중복 생성 상황을 확인했다.
- `design/ui-refresh` 브랜치를 `main`에 병합하고 원격에 푸시했다.
- TypeScript LSP를 설치해 JS/TS 진단 도구가 동작하도록 했다.
- 홈 UI 리프레시 작업 계획 문서를 추가했다.
- 블로그 목록 탭 title의 브랜드 표기를 `Seoul City`로 변경했다.

## 상세

### GitHub Actions 경고 확인

- `actions/checkout@v4`, `actions/setup-node@v4`가 Node.js 20 기반 액션이라 경고가 발생하는 것을 확인했다.
- 프로젝트 실행용 `node-version: 24`와 액션 자체 런타임은 별개임을 정리했다.
- 권장 대응은 액션을 Node.js 24 지원 버전으로 올리는 것이다.

### Gemini 블로그 생성 안정화

- `scripts/generate-blog-post.js`에서 Gemini 응답이 단일 JSON 객체가 아닐 때 `JSON.parse`가 실패하는 문제를 조사했다.
- Gemini 요청에 `responseSchema`를 추가했다.
- `finishReason`이 `STOP`이 아닌 경우 JSON 파싱 전에 명확히 실패하도록 했다.
- 첫 번째 완전한 JSON 객체만 안전하게 추출하도록 파서를 보강했다.
- 모델이 문자열 `\\n`을 그대로 반환하는 경우 실제 줄바꿈으로 정규화했다.
- 모델이 파일명 날짜를 잘못 반환해도 실행 날짜 prefix를 강제하도록 했다.
- `scripts/generate-blog-post.test.js`에 회귀 테스트를 추가했다.

### 실제 생성 검증과 중복 처리

- `.env.local`의 Gemini 키로 `node scripts/generate-blog-post.js`를 실행해 생성 흐름을 검증했다.
- 로컬 브랜치에서 `2026-05-30-seoul-stationery-tour.md`가 생성됐지만, `main`에는 이미 같은 `sourceId`의 `2026-05-28-seoul-stationery-tour.md`가 있었다.
- 최종 `main` 병합에서는 중복 글을 피하기 위해 기존 `main`의 블로그 글을 유지하고 코드 안정화만 반영했다.
- `sourceId`는 블로그 화면에 노출되는 값이 아니라 주제 큐 동기화, 중복 생성 방지, 커버 이미지 연결에 쓰는 내부 메타데이터임을 확인했다.

### 병합과 푸시

- `design/ui-refresh` 브랜치를 `main`에 병합했다.
- 충돌 파일은 기존 `main`의 생성 데이터를 유지하는 방식으로 해결했다.
- `main`을 `origin/main`에 푸시했다.

### 도구와 문서

- `typescript-language-server`와 `typescript`를 전역 설치했다.
- LSP diagnostics가 정상 동작하는 것을 확인했다.
- `docs/tasks/home_ui_refresh.md`에 홈 UI 리프레시 작업 계획을 저장했다.
- `src/app/blog/page.tsx`의 metadata title을 `서울 생활 정보 블로그 | Seoul City`로 변경했다.

## 검증

- `npm test`: 통과, 61개 테스트 pass
- `npm run lint`: 통과
- `npm run build`: 통과
- LSP diagnostics: 주요 변경 파일에서 문제 없음

## 주요 커밋

- `62ee8326` Gemini 정보글 JSON 응답 파싱 안정화
- `9443c178` 서울 문구 투어 정보글 생성
- `2446751a` 정보글 검색 인덱스 갱신
- `050e23b2` design/ui-refresh 브랜치 main 병합
- `5b8400ee` 홈 UI 리프레시 작업 계획 문서 추가
- `b7f21b42` 블로그 탭 브랜드명을 Seoul City로 변경
