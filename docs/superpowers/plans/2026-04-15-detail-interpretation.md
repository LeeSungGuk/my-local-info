# Detail Interpretation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 이벤트/혜택 상세 페이지에 규칙 기반 해석 안내 블록을 추가한다.

**Architecture:** 순수 유틸 함수가 상세 데이터에서 해석 문구 배열을 만들고, 상세 페이지는 해당 결과를 렌더링만 한다. 테스트는 유틸에 집중해서 규칙 조합이 의도대로 나오는지 검증한다.

**Tech Stack:** TypeScript, Next.js App Router, Node test runner

---

### Task 1: Add failing tests for interpretation helpers

**Files:**
- Create: `src/lib/detail-interpretation.test.ts`
- Test: `src/lib/detail-interpretation.test.ts`

- [ ] **Step 1: Write the failing tests**
- [ ] **Step 2: Run `node --test src/lib/detail-interpretation.test.ts` and verify failure**
- [ ] **Step 3: Commit once helper tests and implementation are green**

### Task 2: Implement rule-based interpretation helpers

**Files:**
- Create: `src/lib/detail-interpretation.ts`
- Test: `src/lib/detail-interpretation.test.ts`

- [ ] **Step 1: Implement event interpretation helper**
- [ ] **Step 2: Implement benefit interpretation helper**
- [ ] **Step 3: Run `node --test src/lib/detail-interpretation.test.ts` and verify pass**

### Task 3: Render interpretation blocks in detail pages

**Files:**
- Modify: `src/app/events/[id]/page.tsx`
- Modify: `src/app/benefits/[id]/page.tsx`
- Test: `src/lib/detail-interpretation.test.ts`

- [ ] **Step 1: Wire event helper output into event detail page**
- [ ] **Step 2: Wire benefit helper output into benefit detail page**
- [ ] **Step 3: Run `npm run build` and verify pass**
