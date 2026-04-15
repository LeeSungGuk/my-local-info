# 서울 블로그 주제 자동 생성/큐 관리 설계

작성일: 2026-04-15

## 목적

현재 블로그 생성은 `scripts/seoul-blog-topics.js`의 고정 배열에서 아직 사용하지 않은 주제를 하나 골라 하루 1건씩 글을 생성한다. 이 구조는 운영이 단순하지만, 주제가 모두 소진되면 더 이상 새 글을 만들 수 없고, 주제 생성과 글 생성이 분리되어 있지 않아 운영 추적성도 제한된다.

이번 변경의 목적은 다음과 같다.

- 기존의 하루 1건 자동 발행 흐름은 유지한다.
- 주제 생성과 글 생성을 분리한다.
- 주제는 파일에 저장된 큐를 통해 관리한다.
- 큐의 pending 수가 낮아지면 AI가 새 주제를 자동 보충한다.
- 이미 사용한 주제와 유사하거나 같은 주제가 다시 들어오는 것을 최대한 막는다.

## 선택한 접근

### 권장안: `seed + persisted queue + AI replenishment`

기존 고정 주제 배열은 버리지 않고 초기 seed 데이터로 유지한다. 실제 운영 상태는 별도 JSON 큐 파일로 저장한다. 블로그 생성 스크립트는 직접 `seoul-blog-topics.js`를 소비하지 않고, 큐 파일에서 `pending` 상태의 주제만 읽어 글 생성 대상으로 사용한다.

큐가 비어 있거나 pending 수가 임계값 아래로 내려가면, Gemini로 새 주제 후보를 여러 개 생성한 뒤 중복 제거를 거쳐 큐에 추가한다. 글 생성이 끝난 뒤에만 해당 주제는 `used`로 바뀐다.

이 방식의 장점은 다음과 같다.

- 현재 자동 발행 워크플로우와 잘 맞는다.
- 즉석 생성보다 중복과 품질 흔들림을 줄일 수 있다.
- 어떤 주제가 언제 생성되고 언제 사용됐는지 파일로 추적 가능하다.
- 기존 30개 seed topic을 안전한 초기 재고로 재사용할 수 있다.

## 파일 구조

- 유지: `scripts/seoul-blog-topics.js`
  - 초기 seed topic 목록으로 사용한다.
- 추가: `data/seoul-blog-topic-queue.json`
  - 실제 운영 큐 상태를 저장한다.
- 수정: `scripts/generate-blog-post.js`
  - 고정 배열 직접 소비 대신 큐 기반으로 주제를 선택한다.
- 추가: `scripts/generate-blog-post.test.js`
  - 큐 로딩, 중복 제거, 상태 전환을 테스트한다.

운영용 큐 파일은 클라이언트에서 필요하지 않으므로 `public/` 아래에 두지 않는다.

## 큐 데이터 모델

`data/seoul-blog-topic-queue.json`은 다음 구조를 가진다.

```json
{
  "version": 1,
  "lastGeneratedAt": "2026-04-15T07:30:00+09:00",
  "topics": [
    {
      "id": "seoul-rainy-day-indoor",
      "titleHint": "서울 비 오는 날 실내 나들이 추천",
      "topicCategory": "실내나들이",
      "angle": "날씨가 좋지 않은 날에도 일정이 무너지지 않도록 서울 실내 장소를 추천한다.",
      "places": ["국립중앙박물관", "서울시립미술관", "코엑스 별마당도서관"],
      "tags": ["서울실내", "비오는날", "서울나들이", "박물관", "전시"],
      "coverImage": "/blog-covers/seoul-rainy-day-indoor.svg",
      "coverAlt": "서울 비 오는 날 실내 나들이 추천을 보여주는 서울 정보글 커버 이미지",
      "status": "pending",
      "origin": "seed",
      "createdAt": "2026-04-15T07:30:00+09:00",
      "usedAt": null
    }
  ]
}
```

필드 규칙은 다음과 같다.

- `status`: `pending` | `used`
- `origin`: `seed` | `ai`
- `createdAt`: 큐에 들어간 시점
- `usedAt`: 실제 글 생성 후 확정 시점
- `id`: 큐 전체에서 유일해야 한다.

이번 단계에서는 `archived`, `failed`, `rejected` 같은 상태는 추가하지 않는다. 현재 운영 요구에는 `pending`과 `used`면 충분하다.

## 동작 흐름

### 1. 큐 로드

블로그 생성 스크립트가 시작되면 다음 순서로 큐를 준비한다.

1. `data/seoul-blog-topic-queue.json`이 있으면 읽는다.
2. 파일이 없으면 `scripts/seoul-blog-topics.js`의 seed topic들로 큐를 초기화한다.
3. 큐 초기화 시, 기존 포스트의 `sourceId`와 일치하는 seed topic은 즉시 `used`로 기록하고 나머지는 `pending`으로 넣는다.
4. 큐 파일이 이미 있어도 seed 목록에 새 topic이 추가되어 있고 큐에 없는 `id`라면, 해당 topic을 뒤에 보충한다.
5. 큐가 비정상이면 즉시 실패시키고 기존 포스트는 건드리지 않는다.

이 규칙으로 인해 기존 운영 이력과 새 큐 파일이 어긋나지 않게 맞춰진다.

### 2. 오늘 생성 가능 여부 확인

현재와 동일하게, 오늘 날짜의 `region === "서울"` + `sourceType === "정보글"` 포스트가 이미 있으면 종료한다. 이 규칙은 유지한다.

### 3. topic 보충

`pending` topic 수가 임계값 미만이면 AI로 새 주제 후보를 생성한다.

권장 기본값:

- `minimumPendingTopics = 7`
- `targetPendingTopics = 15`
- 한 번의 보충 호출에서 최대 `8~10개` 후보 생성

보충은 글 생성 전에 수행하되, AI 호출 실패가 있어도 기존 `pending` topic이 남아 있으면 글 생성은 계속 진행한다. 반대로 `pending`이 0이고 보충도 실패하면 그날 글 생성을 중단한다.

### 4. 중복 제거

AI가 만든 topic 후보는 아래 기준으로 필터링한다.

- 기존 포스트의 `sourceId`와 같은 `id`는 버린다.
- 큐 안의 기존 `pending`/`used` topic과 같은 `id`는 버린다.
- `titleHint`를 정규화했을 때 같은 값이면 버린다.
- `topicCategory + 주요 place 조합`이 기존 topic과 지나치게 겹치면 버린다.

이번 단계의 목표는 완벽한 의미 중복 탐지가 아니라, 운영상 눈에 띄는 중복을 줄이는 것이다. 따라서 문자열 정규화 기반 필터와 간단한 place overlap 규칙으로 제한한다.

### 5. topic 선택

글 생성 대상은 큐의 `pending` topic 중 가장 오래된 항목 하나를 선택한다. 현재처럼 "아직 안 쓴 첫 topic" 규칙을 유지하되, 대상 소스만 배열에서 큐로 바꾼다.

### 6. 글 생성 및 상태 확정

선택된 topic으로 기존 글 생성 프롬프트를 수행한다. 글이 정상적으로 저장된 뒤에만 다음을 수행한다.

- 해당 topic의 `status`를 `used`로 변경
- `usedAt` 기록
- 큐 파일 저장

글 생성이나 파일 저장이 실패하면 topic 상태는 그대로 `pending`으로 남긴다. 이 규칙으로 인해 중간 실패가 있어도 주제가 사라지지 않는다.

큐 저장은 가능하면 임시 파일에 먼저 쓴 뒤 `rename`하는 방식으로 처리한다. 이렇게 하면 스케줄 실행 중 예외가 발생해도 JSON이 반쯤 써진 상태로 남을 가능성을 줄일 수 있다.

## AI 주제 생성 규칙

주제 생성 프롬프트는 글 생성 프롬프트와 분리한다. 출력은 Markdown이 아니라 JSON 배열만 허용한다.

주요 요구사항:

- 서울 전용 생활형 정보글 주제만 생성
- 행사/축제/지원금 공지형 주제 금지
- 기존 seed topic과 너무 비슷한 표현 반복 금지
- 각 topic은 `id`, `titleHint`, `topicCategory`, `angle`, `places`, `tags`를 반드시 포함
- `id`는 영문 소문자와 하이픈만 허용
- 장소는 실제 서울 맥락에 맞는 3~5개만 포함

주제 생성 단계에서는 `coverImage`, `coverAlt`를 반드시 생성할 필요는 없다. 누락되면 기존 `ensureTopicCoverAsset()`가 기본 커버를 만들도록 유지한다.

## 오류 처리

- 큐 파일 파싱 실패: 종료
- topic 보충 실패 + 기존 pending 존재: 경고 로그 후 기존 pending으로 계속 진행
- topic 보충 실패 + 기존 pending 없음: 종료
- 글 생성 실패: 종료, topic은 `pending` 유지
- 큐 저장 실패: 종료, 포스트 저장 이후라면 명시적 오류 로그를 남긴다

이번 단계에서는 파일 잠금이나 동시 실행 제어는 추가하지 않는다. 현재 GitHub Actions 스케줄은 단일 실행 전제로 충분하다.

## 테스트 전략

`node:test` 기반으로 다음을 검증한다.

- 큐 파일이 없을 때 seed topic으로 초기화된다.
- 이미 사용한 `sourceId`는 다음 선택 대상에서 제외된다.
- `pending` 수가 낮을 때만 보충이 트리거된다.
- AI 후보 중 `id` 또는 정규화된 제목이 겹치면 제외된다.
- 글 저장 성공 후에만 topic 상태가 `used`로 바뀐다.
- 글 저장 실패 시 topic이 `pending`으로 유지된다.

AI 호출 자체는 테스트에서 실제 네트워크를 사용하지 않고 함수 경계에서 stub 처리한다.

## 구현 범위

이번 변경은 다음까지만 포함한다.

- persisted topic queue 도입
- seed topic 자동 마이그레이션
- pending 임계값 기반 AI topic 보충
- 큐 기반 topic 선택/사용 처리
- 관련 테스트 추가

이번 변경에 포함하지 않는 항목:

- 관리자용 주제 승인 UI
- topic 품질 점수화
- 의미 기반 임베딩 중복 탐지
- 여러 도시/지역으로의 일반화

## 승인 후 구현 순서

1. 큐 로더/세이버와 중복 판별 유틸 추가
2. failing test 작성
3. `generate-blog-post.js`를 큐 기반 흐름으로 전환
4. topic 보충 프롬프트 및 JSON 파서 추가
5. 테스트/린트로 검증
