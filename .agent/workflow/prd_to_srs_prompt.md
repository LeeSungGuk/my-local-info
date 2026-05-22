# PRD to SRS 변환 프롬프트

서울시티 프로젝트의 PRD를 SRS(Software Requirements Specification) 문서로 변환할 때 사용하는 재사용 프롬프트입니다.

## 권장 설정 위치

- 워크플로우 원본: `.agent/workflow/prd_to_srs_prompt.md`
- PRD 입력 문서: `docs/prd/*_prd.md`
- SRS 출력 문서: `docs/srs/*_srs.md`
- 운영 규칙: `AGENTS.md`의 `Documentation Rules`

`.agent/workflow/`는 에이전트 전용 워크플로우 위치입니다. `.omo/`와 `.antigravitycli/`는 도구/세션 메타데이터이므로 프롬프트나 SRS의 기준 위치로 사용하지 않습니다.

## Prompt

```text
You are a senior software requirements engineer.

Convert the provided PRD into a Software Requirements Specification (SRS) for the Seoulcity project.

Follow ISO/IEC/IEEE 29148:2018-style discipline: requirements must be necessary, implementation-independent, unambiguous, singular, feasible, verifiable, and traceable.

## Project Context

Seoulcity is a Next.js App Router static site for Seoul local information. It combines:

- structured JSON data under `public/data/events`, `public/data/benefits`, `public/data/food`, and `public/data/search`
- Markdown posts under `src/content/posts`
- App Router pages under `src/app`
- reusable UI components under `src/components`
- Cloudflare Pages deployment and a Cloudflare Functions `/api/chat` endpoint

The product language is primarily Korean. Keep user-facing requirement wording concise and natural in Korean unless the PRD explicitly requires another language.

## Inputs

- Source PRD path: `<prd-path>`
- Output directory: `docs/srs`
- Output filename: `<topic>_srs.md`

Use the PRD as the only source of truth for product scope, users, goals, non-goals, success criteria, and open questions.

You may use the project context above only to organize technical categories and name known repository areas. Do not invent product requirements that are not grounded in the PRD.

## Hard Rules

1. Do not add features, flows, metrics, policies, or data sources that are absent from the PRD.
2. If the PRD is ambiguous or incomplete, record it under `Open Questions` or `Assumptions`, not as a confirmed requirement.
3. Keep PRD intent separate from implementation details. The SRS may reference known project surfaces such as routes, data files, Markdown posts, search index, build, and deployment only when the PRD supports them.
4. Preserve Seoulcity safety constraints:
   - never expose `.env.local` values or API keys
   - treat public data as reference information, not legal/administrative advice
   - keep official source links and correction paths visible where the PRD requires trust or freshness
   - keep static-export compatibility unless the PRD explicitly changes deployment architecture
5. Requirements must use stable IDs:
   - `REQ-FUNC-xxx` for functional requirements
   - `REQ-NF-xxx` for non-functional requirements
   - `REQ-IF-xxx` for interface requirements
   - `REQ-DATA-xxx` for data requirements
   - `REQ-CON-xxx` for constraints
6. Each requirement must include:
   - ID
   - Requirement statement
   - Source PRD section
   - Priority: `Must`, `Should`, or `Could`
   - Verification method: `Test`, `Review`, `Inspection`, or `Analysis`
   - Acceptance criteria
7. Use `TBD` only when the PRD does not contain enough information. Every `TBD` must also appear in `Open Questions`.
8. Do not write code, migration steps, issue tickets, or project plans. Produce only the SRS document.

## Required SRS Structure

Write the output in Markdown with this structure:

1. `# <Product or Feature Name> SRS`
2. `## 1. Document Control`
   - Source PRD path
   - Generated date
   - Output path
   - Status: Draft
3. `## 2. References`
   - Source PRD
   - README or other source artifact only when it clarifies repository context without changing product scope
   - Related data or operations docs only when explicitly referenced by the PRD
4. `## 3. Purpose and Scope`
   - Product purpose
   - In scope
   - Out of scope
5. `## 4. Product Context`
   - User groups
   - Operating context
   - Relevant Seoulcity surfaces such as home, events, benefits, food, districts, situations, search, blog, static build, and Cloudflare chat only if supported by the PRD
6. `## 5. Definitions`
   - Define project terms from the PRD, for example event, benefit, food candidate, district guide, situation guide, public data, official link, correction request
7. `## 6. Functional Requirements`
   - Group by product area or user flow
   - Use `REQ-FUNC-xxx`
8. `## 7. Non-Functional Requirements`
   - Performance, reliability, SEO, accessibility, privacy, security, maintainability, deployment, and localization requirements grounded in the PRD
   - Use `REQ-NF-xxx`
9. `## 8. Interface Requirements`
   - User interface surfaces
   - External links and official source links
   - Cloudflare Functions or API interfaces only if present in the PRD
   - Use `REQ-IF-xxx`
10. `## 9. Data Requirements`
   - JSON data sources
   - Markdown post metadata
   - Search index expectations
   - Data freshness, source attribution, expiry handling, and sensitive value handling
   - Use `REQ-DATA-xxx`
11. `## 10. Constraints`
    - Static export, deployment, secrets, source-of-truth documents, content tone, and known non-goals
    - Use `REQ-CON-xxx`
12. `## 11. User Flow Diagrams`
    - Include Mermaid sequence diagrams for the main PRD-supported flows.
    - For Seoulcity, typical diagrams may include integrated search, official-info confirmation, data refresh/build/deploy, and blog/content publishing when those flows are present in the PRD.
13. `## 12. Traceability Matrix`
    - Map each SRS requirement ID to PRD section, source artifact, user scenario, and verification method.
14. `## 13. Verification Plan`
    - List how each requirement category can be verified without relying on hidden secrets or production-only access.
15. `## 14. Assumptions`
16. `## 15. Open Questions`

## Requirement Wording Guide

- Prefer Korean requirement statements for user-facing behavior.
- Use `해야 한다` / `제공해야 한다` / `표시해야 한다` for mandatory requirements.
- Avoid vague words such as `빠르게`, `사용하기 쉽게`, or `적절히` unless the PRD provides measurable criteria.
- Split compound requirements into separate IDs.
- Do not encode implementation tasks such as `create component`, `write script`, or `refactor file` as product requirements.

## Traceability Matrix Format

Use this table format:

| Requirement ID | Requirement | PRD Section | Source Artifact | User Scenario / Goal | Priority | Verification Method | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| REQ-FUNC-001 | `<requirement>` | `<section>` | `<artifact>` | `<scenario>` | `<priority>` | `<method>` | `<notes>` |

## Mermaid Diagram Rules

- Use valid Mermaid fenced blocks starting with three backticks followed by `mermaid`.
- Keep actor and system names stable and Korean-friendly.
- Do not include implementation details not supported by the PRD.
- If a flow is not described clearly enough, add it to `Open Questions` instead of drawing an invented flow.
- Prefer diagrams that clarify requirements: `flowchart` for user journeys or data flow, `sequenceDiagram` for search/content loading/chat request flows, `erDiagram` only when data entities matter, and `stateDiagram` only when content lifecycle states are explicit.

## Output Requirement

Save the completed SRS as:

`docs/srs/<topic>_srs.md`

Before saving, verify that:

- every requirement has a stable ID
- every requirement maps back to a PRD section
- every `TBD` appears in `Open Questions`
- the output contains no API keys, `.env.local` values, or private credentials
- the document does not treat `.omo/` or `.antigravitycli/` as source-of-truth documentation
```
