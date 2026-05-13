# 서울시 행사 데이터 수집 워크플로우 수정 기록

작성일: 2026-05-12

## 요약

GitHub Actions의 `Fetch Seoul events` 단계에서 발생한 `fetch failed` 실패는 행사 데이터가 비어 있어서 생긴 문제가 아니라, 서울 열린데이터광장 Open API에 도달하지 못한 네트워크 계층 오류로 판단했다.

이번 수정은 행사 수집 실패가 전체 배포를 불필요하게 막지 않도록 만들고, 실패 원인을 로그에서 더 정확히 볼 수 있게 한 변경이다.

## 발생 증상

실패 로그:

```text
📡 서울시 문화행사 Open API 호출 중...
❌ 서울시 행사 데이터 수집 실패: fetch failed
Error: Process completed with exit code 1.
```

이 로그만으로는 빈 데이터, 인증키 오류, 네트워크 오류를 구분하기 어렵다.

## 원인 판단

`fetch failed`는 Open API가 정상 응답을 반환한 뒤 데이터가 0건이라는 뜻이 아니다. Node.js `fetch`가 HTTP 응답을 받기 전에 실패했다는 뜻에 가깝다.

확인한 기준은 다음과 같다.

- 서울 열린데이터광장 문화행사 API는 정상 응답 시 JSON을 반환한다.
- 인증키가 잘못된 경우에는 보통 `INFO-100` 같은 코드가 담긴 XML 오류 응답을 반환한다.
- 따라서 기존 로그의 `fetch failed`는 인증키 오류나 빈 데이터보다 DNS, 연결 실패, 타임아웃, 일시적 네트워크 차단 같은 전송 계층 문제로 보는 것이 맞다.

## 변경 파일

- `.github/workflows/deploy.yml`
- `scripts/fetch-seoul-events.js`
- `scripts/fetch-seoul-events.test.js`

## 변경 내용

### 1. API 키 사용 규칙 정리

기존에는 `SEOUL_OPEN_DATA_API_KEY`가 없으면 `PUBLIC_DATA_API_KEY`를 서울시 행사 API 키처럼 재사용할 수 있었다.

이 fallback을 제거했다. 서울시 행사 수집은 반드시 `SEOUL_OPEN_DATA_API_KEY`만 사용한다.

이유:

- `PUBLIC_DATA_API_KEY`는 공공데이터포털용 키다.
- 서울 열린데이터광장 키와 성격이 다르다.
- 잘못된 키를 자동으로 섞어 쓰면 실패 원인이 흐려진다.

### 2. 명시적 실행 모드 추가

`EVENTS_DATA_MODE`를 통해 로컬/운영 실행 의도를 분리했다.

```bash
EVENTS_DATA_MODE=sample npm run fetch:seoul-events
```

샘플 모드:

- 서울 API의 `sample` 키를 사용한다.
- 로컬에서 수집 로직만 빠르게 확인할 때 쓴다.
- 기본 페이지 크기는 5건이다.

```bash
EVENTS_DATA_MODE=skip npm run fetch:seoul-events
```

스킵 모드:

- 실제 키가 없을 때 행사 수집 단계를 명시적으로 건너뛴다.
- CI 운영 기본값은 아니다.

### 3. 네트워크 실패 재시도와 타임아웃 추가

행사 API 호출에 다음 기준을 추가했다.

- 기본 타임아웃: `EVENTS_REQUEST_TIMEOUT_MS`, 기본값 `30000`
- 기본 재시도 횟수: `EVENTS_REQUEST_RETRY_COUNT`, 기본값 `2`
- 재시도 대상: 네트워크 오류, HTTP `429`, HTTP `5xx`

재시도 로그 예시:

```text
⚠️ 서울 Open API 재시도 1/2: 1-1000 (...)
```

### 4. 실패 원인 로그 개선

네트워크 오류는 가능한 경우 아래 정보를 함께 출력한다.

- `code`
- `syscall`
- `host`
- `address`
- `port`

예시:

```text
서울 Open API 네트워크 오류: fetch failed code=ENOTFOUND syscall=getaddrinfo host=openapi.seoul.go.kr
```

이제 `fetch failed` 하나만 보고 추측하지 않아도 된다.

### 5. XML 오류 응답 파싱 추가

서울 열린데이터광장 API가 JSON 대신 XML 오류를 반환할 때 `CODE`, `MESSAGE`를 추출해 출력한다.

예시:

```text
서울 Open API 응답 오류: INFO-100 인증키가 유효하지 않습니다.
```

이 경우는 네트워크 실패가 아니라 Open API 응답 오류로 취급한다.

### 6. CI 실패 완화 옵션 추가

GitHub Actions의 `Fetch Seoul events` 단계에 다음 값을 추가했다.

```yaml
EVENTS_FETCH_FAILURE_MODE: "keep-existing"
```

이 모드는 다음 조건을 모두 만족할 때만 성공 처리한다.

- 실패가 재시도 가능한 네트워크 계층 오류다.
- 기존 `public/data/events/index.json`에 저장된 행사 데이터가 있다.

이 경우 기존 행사 데이터를 유지하고 다음 단계로 넘어간다.

로그 예시:

```text
⚠️ 서울시 행사 데이터 수집에 실패해 기존 행사 데이터를 유지합니다.
- 실패 원인: 서울 Open API 네트워크 오류: ...
- 기존 저장 총건수: 661
```

의도:

- 서울 API 또는 GitHub runner 네트워크가 일시적으로 흔들려도 전체 배포가 막히지 않게 한다.
- 단, 인증키 오류나 응답 형식 오류처럼 설정 문제에 가까운 실패는 계속 실패 처리한다.

## 운영 방법

### GitHub Actions 필수 secret

행사 수집에는 다음 secret이 필요하다.

```text
SEOUL_OPEN_DATA_API_KEY
```

`PUBLIC_DATA_API_KEY`는 행사 수집에 사용하지 않는다.

### 로컬 샘플 확인

```bash
EVENTS_DATA_MODE=sample npm run fetch:seoul-events
```

### 실제 키로 로컬 수집

`.env.local` 또는 쉘 환경에 다음 값을 넣는다.

```text
SEOUL_OPEN_DATA_API_KEY=...
```

그 다음 실행한다.

```bash
npm run fetch:seoul-events
```

### 실패 로그 해석

`SEOUL_OPEN_DATA_API_KEY가 필요합니다.`

- 실제 키가 설정되지 않았다.
- GitHub Actions secret 또는 `.env.local`을 확인한다.

`INFO-100 인증키가 유효하지 않습니다.`

- API 서버에는 도달했다.
- 키 값이 잘못됐거나 서울 열린데이터광장용 키가 아니다.

`서울 Open API 네트워크 오류: fetch failed ...`

- HTTP 응답을 받기 전 실패했다.
- DNS, 연결, 타임아웃, GitHub runner 네트워크 문제를 우선 확인한다.
- CI에서는 기존 행사 데이터가 있으면 `keep-existing` 정책으로 배포가 계속될 수 있다.

`서울 Open API JSON 파싱 실패`

- API 응답 형식이 예상과 다르다.
- 원본 응답 형식 변경 가능성을 확인한다.

## 검증

수정 후 다음 명령을 통과했다.

```bash
npm test
npm run lint
npm run build
```

검증 결과:

- 테스트 53개 통과
- ESLint 통과
- Next.js 정적 빌드 통과
- 빌드 기준 정적 페이지 1814개 생성

## 남은 운영 리스크

이 수정은 외부 API 장애 자체를 없애는 변경이 아니다. 외부 API나 GitHub runner 네트워크가 실패할 수 있다는 전제를 코드에 반영한 것이다.

앞으로 봐야 할 지표:

- `keep-existing` 로그가 반복되는지
- 실제 행사 데이터 갱신 주기가 과도하게 밀리는지
- 서울 열린데이터광장 API 응답 형식이 바뀌는지
- `SEOUL_OPEN_DATA_API_KEY` secret이 만료되거나 교체되는지
