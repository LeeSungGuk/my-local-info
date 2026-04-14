# Google SEO / E-E-A-T 요약

이 문서는 아래 Google 공식 문서 3개를 바탕으로 핵심 내용을 정리하고, 현재 프로젝트(`Next.js` 정적 사이트, 서울 공공정보/블로그 서비스)에 적용해야 할 SEO / E-E-A-T 최적화 항목을 목록으로 정리한 문서입니다.

참고 문서:
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data?hl=ko
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

## 1. Creating helpful, reliable, people-first content

핵심 방향:
- 검색엔진보다 사람에게 실제로 도움이 되는 콘텐츠가 우선입니다.
- 얕은 재작성, 검색 유입만 노린 확장, 원문 대비 추가 가치가 없는 글은 불리합니다.
- 콘텐츠는 `Who / How / Why`가 드러나야 합니다.

핵심 포인트:
- 누가 만들었는지 보여줘야 합니다.
- 어떻게 만들었는지 설명할 수 있어야 합니다.
- 왜 이 콘텐츠가 존재하는지 분명해야 합니다.
- E-E-A-T에서 가장 중요한 축은 `Trust`입니다.
- 독자가 읽고 목표를 달성할 수 있을 만큼 충분한 정보와 맥락이 있어야 합니다.
- 페이지 경험도 함께 중요합니다. 읽기 어렵거나 방해 요소가 많은 페이지는 불리합니다.

## 2. 구조화된 데이터 소개

핵심 방향:
- 구조화된 데이터는 Google이 페이지의 의미를 더 정확히 이해하도록 돕습니다.
- 구현 목적은 마크업 자체가 아니라 `검색 결과에서 이해 가능성`을 높이는 데 있습니다.

핵심 포인트:
- 구현 형식은 `JSON-LD`가 권장됩니다.
- 구조화된 데이터는 페이지에 실제로 보이는 내용을 설명해야 합니다.
- 보이지 않는 정보나 과장된 정보로 마크업하면 안 됩니다.
- 필수 속성뿐 아니라 권장 속성도 중요하지만, 정확성이 우선입니다.
- 배포 전에는 `Rich Results Test`, 배포 후에는 `Search Console`로 상태를 확인해야 합니다.

## 3. Build and submit a sitemap

핵심 방향:
- 사이트맵에는 검색에 노출시키고 싶은 `canonical URL`만 넣어야 합니다.
- 크롤러가 중요한 URL을 빠짐없이 찾도록 도와주는 역할입니다.

핵심 포인트:
- 사이트맵은 `UTF-8` 인코딩이어야 합니다.
- URL은 절대경로여야 합니다.
- 가능하면 사이트 루트에 두는 것이 좋습니다.
- `robots.txt` 또는 `Search Console`로 제출할 수 있습니다.
- 규모가 커지면 sitemap index 또는 여러 sitemap 파일로 나눌 수 있습니다.
- 한 sitemap 한도는 `50,000 URL` 또는 `50MB`입니다.

## 현재 프로젝트에 적용해야 할 SEO / E-E-A-T 최적화 항목

### 콘텐츠 / E-E-A-T
- 사이트의 1차 목적을 `서울 생활형 로컬 정보 서비스`로 명확하게 고정
- 블로그 글마다 `작성자`, `발행일`, `수정일`, `검토일` 표시
- 운영자/저자 소개 페이지와 블로그 저자 링크 연결 강화
- 블로그, 행사, 혜택 상세 페이지에 `공식 출처`, `원문 링크`, `기준일`, `수집 시각` 명시
- 공공정보 요약 글은 `참고용 요약` 성격을 명확히 표기
- 직접 방문하지 않은 장소 추천 글을 직접 경험처럼 서술하지 않기
- AI 보조 작성 콘텐츠는 `작성 방식`이 드러나도록 고지
- 행사/혜택 페이지에 `만료 여부`, `최종 확인일`, `정정 요청 채널` 표시
- 블로그가 단순 재작성으로 보이지 않도록 서울 생활 맥락과 추가 해설 가치 포함
- 운영 주체, 업데이트 기준, 정정 요청 경로를 더 명확하게 노출

### 구조화된 데이터
- 블로그 글에 `Article` 또는 `BlogPosting` JSON-LD 적용
- 행사 상세 페이지에 `Event` JSON-LD 적용
- 주요 페이지에 `BreadcrumbList` 적용
- 사이트 전반에 `Organization` 구조화 데이터 적용
- 구조화 데이터 값은 실제 화면에 보이는 내용과 일치하도록 유지
- 혜택 상세 페이지에는 Google 리치결과 지원 유형이 명확하지 않으므로 무리한 스키마 적용 금지
- 구조화 데이터 구현 형식은 `JSON-LD`로 통일
- 배포 전 `Rich Results Test`, 배포 후 `Search Console` 모니터링

### 기술 SEO
- 모든 주요 페이지에 `canonical` 명확히 지정
- `/events?view=...`, `/benefits?view=...`, `/search?q=...` 같은 변형 URL의 canonical 정책 정리
- 루트 기준 `sitemap.xml` 생성
- sitemap에 `canonical URL`, `lastmod`, 절대경로 포함
- 필요 시 `events`, `benefits`, `blog`별 sitemap 분리
- `robots.txt`에 sitemap 위치 명시
- Search Console에 sitemap 제출
- 페이지별 고유한 `title`, `meta description`, `Open Graph`, `Twitter card` 정리
- 행사/혜택/블로그 상세 페이지 메타데이터 자동 생성 강화
- 만료된 행사/혜택 페이지의 색인 유지 여부 정책 수립
- 내부 검색 결과 URL의 색인 정책 정리

### 페이지 경험
- 홈 검색 오버레이처럼 겹침이나 레이아웃 이동이 생기는 UI 지속 제거
- 모바일에서 검색, 필터, 카드 레이아웃 안정성 점검
- Core Web Vitals 관점에서 이미지, 폰트, 레이아웃 이동 최소화
- 과한 시각 장식보다 정보 가독성을 우선
- 정적 사이트 장점을 살려 빠른 응답과 안정적인 렌더링 유지

### 공공정보 사이트 특화 운영
- 행사/혜택 데이터의 `갱신 주기`, `수집 기준`, `삭제 기준` 문서화
- 만료 정보가 sitemap이나 추천 영역에 오래 남지 않도록 정책화
- 공식 원문과 요약 내용이 다를 수 있다는 점을 사용자에게 명확히 고지
- 각 상세 페이지에서 `최종 조건은 공식 페이지 확인` 유도 문구 유지
- 블로그 생성 시 `새로운 해설 가치`가 없는 글은 만들지 않기

