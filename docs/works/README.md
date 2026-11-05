# Works 작업 현황

이 폴더는 아이디어 및 개선 과제를 `intent.md` → `spec.md` → `plan.md` 흐름으로 정리하고 진행 상태를 추적하는 공간입니다.

## 업무 목록

| 업무 | 목적 요약 | 현재 상태 | 완료된 범위 | 남은 작업 | 문서 |
| --- | --- | --- | --- | --- | --- |
| `seo_indexing_fixes` | 운영 사이트 SEO 분석에서 나온 사이트맵 주소, canonical, lastmod, 혜택 페이지 색인 문제 바로잡기 | 운영 배포 및 확인 완료, Google·네이버 검색 등록 완료 | • 분석 6개 항목을 코드·운영 사이트에서 확인<br>• 승인 범위: 사이트맵 끝 슬래시, 페이지별 canonical·og:url, 실제 날짜 lastmod, 혜택 상세 전체 noindex·사이트맵 제외<br>• PRD 11절, SRS `REQ-NF-007`·`010` 보완, `REQ-NF-013`~`015` 추가<br>• 테스트 134개·타입 검사·변경 파일 린트·빌드·산출물 전수 검사 통과<br>• Search Console 도메인 속성 DNS 인증, 사이트맵 제출(상태 성공)<br>• PR #20 병합·배포·운영 확인(사이트맵 347개)<br>• 네이버 서치어드바이저 소유확인 태그 PR #21 병합·배포, 소유확인·사이트맵 제출 | • 배포 2~4주 뒤 Search Console·네이버 색인 보고서 확인 | [plan](./seo_indexing_fixes/plan.md) |
| `design_critique_fixes` | 운영 사이트 디자인 검사(21/40)에서 나온 문제를 4단계로 개선. 1단계는 빈 결과와 틀린 숫자 바로잡기 | 1~4단계 운영 배포 및 확인 완료 | • 운영 사이트 디자인 검사와 4단계 개선 순서 정리<br>• 1단계 승인 후 명세(`FIX-01`~`FIX-07`)·로컬 구현<br>• 검색 군더더기 단어 제외·일부 단어 결과, 홈 상황 바로가기, 이번 주 마감 혜택 0개 처리, 구 페이지 구 이름 일치·전체 개수, 데이터 없음 문구<br>• SRS REQ-FUNC-018 보완·REQ-FUNC-034 추가<br>• 테스트 124개·타입 검사·린트·빌드·실제 화면 `AC-01`~`AC-10` 통과<br>• 1단계 PR #13 병합·배포·운영 확인<br>• 2단계 PR #14 병합·배포<br>• 3단계 PR #15 병합·배포<br>• 3단계 후속: 혜택 카드 문구의 원문 기호(`○`·`※`) 제거, 문장 첫 날짜 유지, 테스트 134개 통과, PR #18 병합·배포·운영 확인<br>• 4단계 `DESIGN.md`, 사이트 이름 ‘서울시티’, 선 아이콘·칩·링크 문구 통일, PR #16 병합·배포·운영 확인 | 운영 후속 작업 없음 (추가 제안은 [plan.md 9절](./design_critique_fixes/plan.md#9-남은-후속-제안)) | [intent](./design_critique_fixes/intent.md) · [spec](./design_critique_fixes/spec.md) · [plan](./design_critique_fixes/plan.md) |
| `home_district_tile_map` | 홈에서 25개 구를 타일 지도로 골라 구별 행사·혜택·먹거리로 이동 | 운영 배포 및 확인 완료 | • 구별 데이터 분포 확인<br>• 시안 비교 후 타일 지도로 결정, 로컬 화면 검토 후 5×5 정사각형 배치로 변경<br>• 혜택 수 기본 색, 상황별 코스 아래 배치, 행사·혜택 구 필터 연결, 홈만 적용 결정<br>• PRD 8.1·8.3, SRS REQ-FUNC-032·033 갱신<br>• 구현 승인 후 로컬 구현(`W-01`~`W-06`)<br>• 테스트 115개·타입 검사·변경 파일 린트·빌드·실제 화면 31개 항목 통과<br>• 커밋·푸시(`931fc3b99`) 및 [PR #8](https://github.com/LeeSungGuk/my-local-info/pull/8) 생성<br>• PR #8 병합(`d75fd1927`)·자동 배포 성공<br>• 운영 홈·혜택 목록 31개 항목 확인 | 운영 후속 작업 없음 | [intent](./home_district_tile_map/intent.md) · [spec](./home_district_tile_map/spec.md) · [plan](./home_district_tile_map/plan.md) |
| `blog_cover_diversity` | 블로그 표지 이미지 181개의 주제 적합성 개선 및 반복 감소 | 표지 다양화·캐시 재발 방지 운영 배포 및 확인 완료 | • 24개 주제군·85개 장면과 기존 181개 표지 반영<br>• PR #2 병합 및 자동 검사·배포 성공<br>• 운영 SVG 181개 해시 일치 확인<br>• 캐시 방지 버전 주소 구현 및 테스트(103개)·린트·빌드·실제 화면 검증 통과<br>• 수정 커밋·푸시(`e88f00419`) 및 PR #3 병합·자동 배포<br>• 운영 홈·목록·상세와 표지 181개 버전·내용 일치 확인 | 운영 후속 작업 없음 | [intent](./blog_cover_diversity/intent.md) · [spec](./blog_cover_diversity/spec.md) · [plan](./blog_cover_diversity/plan.md) |

## 문서 작성 및 체크 규칙

- **`intent.md`**: 해결할 문제, 대상 사용자, 기대 결과, 범위와 유지 조건을 정의하고 명세로 넘길 결정 사항의 확정 여부를 체크합니다.
- **`spec.md`**: 요구사항(`COV-*`)과 수용 기준(`AC-*`)을 정의하고 각 항목의 충족·검증 상태를 표시합니다.
- **`plan.md`**: 상단에 전체 단계별 진행 요약(완료된 작업 vs 남은 작업)을 두고, 본문에서 세부 작업(`W-*`) 체크리스트와 검증 결과를 관리합니다.
