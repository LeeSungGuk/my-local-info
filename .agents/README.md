# Agent Workflow Index

이 폴더는 에이전트 전용 작업 워크플로우와 공통 규칙을 보관합니다. 사용자/팀이 보는 제품 문서는 `docs/`에 두고, 에이전트가 반복해서 쓰는 프롬프트와 검토 절차는 `.agents/workflow/`에 둡니다.

## Workflows

- PRD를 SRS로 변환: `.agents/workflow/prd_to_srs_prompt.md`
- 생성된 SRS 충족 여부 검토: `.agents/workflow/prd_to_srs_review_prompt.md`

## Rules

- `docs/prd/*_prd.md`: 제품 요구사항 문서
- `docs/srs/*_srs.md`: 소프트웨어 요구사항 명세 산출물
- `.agents/workflow/*_prompt.md`: 에이전트 전용 워크플로우
- `.agents/rules/*_RULES.md`: 프로젝트 공통 규칙
- `.omo/`와 `.antigravitycli/`는 도구/세션 메타데이터이므로 source-of-truth로 사용하지 않습니다.
