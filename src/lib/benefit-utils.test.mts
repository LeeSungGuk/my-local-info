import assert from "node:assert/strict";
import test from "node:test";
import {
  getBenefitHighlight,
  pickFeaturedBenefits,
  type BenefitHighlightShape,
  type FeaturedBenefitShape,
} from "./benefit-utils.ts";

type Benefit = FeaturedBenefitShape & BenefitHighlightShape & { id: string };

function makeBenefit(overrides: Partial<Benefit>): Benefit {
  return {
    id: overrides.id ?? "benefit",
    title: overrides.title ?? "혜택",
    district: overrides.district ?? "마포구",
    field: overrides.field ?? "생활안정",
    updatedAt: overrides.updatedAt ?? "2026-10-01",
    targetSummary: overrides.targetSummary ?? "",
    summary: overrides.summary ?? "",
    supportSummary: overrides.supportSummary ?? "",
  };
}

test("drops the templated provider sentence from benefit summaries", () => {
  const benefit = makeBenefit({
    summary: "서울특별시 강북구에서 제공하는 보건·의료 혜택입니다. 아동의 어금니 홈을 메워 충치를 예방합니다.",
  });

  assert.equal(getBenefitHighlight(benefit), "아동의 어금니 홈을 메워 충치를 예방합니다.");
});

test("falls back to a cleaned support summary when the summary is only the template", () => {
  const benefit = makeBenefit({
    summary: "강북구도시관리공단에서 제공하는 문화·환경 혜택입니다.",
    supportSummary: "○ 강북웰빙스포츠센터 체육프로그램 수강 시 할인 제공\n  ※ 일부 프로그램 제외\n\n1. 보훈 대상자",
  });

  assert.equal(getBenefitHighlight(benefit), "강북웰빙스포츠센터 체육프로그램 수강 시 할인 제공 일부 프로그램 제외 보훈 대상자");
});

test("strips source bullets left in the summary after the template sentence", () => {
  const benefit = makeBenefit({
    summary: "서울특별시 강서구에서 제공하는 보건·의료 혜택입니다. ○ 장애인 이동보조기기 수리비를 지원합니다.\n※ 연 1회 한정",
    supportSummary: "수리비 지원",
  });

  assert.equal(getBenefitHighlight(benefit), "장애인 이동보조기기 수리비를 지원합니다. 연 1회 한정");
});

test("keeps dates and numbered names at the start of the summary", () => {
  const highlight = (summary: string) => getBenefitHighlight(makeBenefit({ summary: `강남구에서 제공하는 생활안정 혜택입니다. ${summary}` }));

  assert.equal(highlight("6.25 참전유공자 위문금 지급"), "6.25 참전유공자 위문금 지급");
  assert.equal(highlight("2025. 1. 1.이후 출생아, 1년 뒤 첫돌축하금 신청."), "2025. 1. 1.이후 출생아, 1년 뒤 첫돌축하금 신청.");
});

test("featured benefits spread across districts and fields and skip statute-heavy eligibility", () => {
  const benefits = [
    makeBenefit({ id: "a", district: "강북구", field: "문화·환경", updatedAt: "2026-10-30", targetSummary: "「국가유공자 등 예우 및 지원에 관한 법률 시행령」 제86조" }),
    makeBenefit({ id: "b", district: "강북구", field: "보건·의료", updatedAt: "2026-10-29" }),
    makeBenefit({ id: "c", district: "강북구", field: "생활안정", updatedAt: "2026-10-28" }),
    makeBenefit({ id: "d", district: "마포구", field: "보건·의료", updatedAt: "2026-10-27" }),
    makeBenefit({ id: "e", district: "성동구", field: "보육·교육", updatedAt: "2026-10-26" }),
    makeBenefit({ id: "f", district: "종로구", field: "생활안정", updatedAt: "2026-10-25" }),
    makeBenefit({ id: "g", district: "용산구", field: "주거·자립", updatedAt: "2026-10-24" }),
  ];

  assert.deepEqual(pickFeaturedBenefits(benefits, 4).map((benefit) => benefit.id), ["b", "e", "f", "g"]);
});

test("featured benefits fill remaining slots when variety runs out", () => {
  const benefits = [
    makeBenefit({ id: "a", district: "강북구", field: "생활안정" }),
    makeBenefit({ id: "b", district: "강북구", field: "생활안정" }),
  ];

  assert.deepEqual(pickFeaturedBenefits(benefits, 4).map((benefit) => benefit.id), ["a", "b"]);
});
