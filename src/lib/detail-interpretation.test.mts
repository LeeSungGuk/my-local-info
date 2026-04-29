import assert from "node:assert/strict";
import test from "node:test";
import {
  getBenefitInterpretationSections,
  getEventInterpretationSections,
} from "./detail-interpretation.ts";

test("event interpretation builds audience and checklist sections from existing fields", () => {
  const sections = getEventInterpretationSections({
    title: "서울 야외 영화제",
    category: "축제",
    district: "마포구",
    venue: "문화비축기지",
    startDate: "2026-04-20",
    endDate: "2026-04-22",
    timeText: "18:00~21:00",
    target: "가족, 연인, 일반 시민",
    isFree: true,
    fee: "",
    detailUrl: "https://example.com/event",
    organizerUrl: "",
  });

  assert.deepEqual(sections, [
    {
      title: "이런 분께 먼저 맞아요",
      items: [
        "가족, 연인, 일반 시민 안내가 있어 대상에 맞는지 먼저 가볍게 확인하기 좋습니다.",
        "무료 행사라 일정만 맞으면 부담 없이 들러보기 좋습니다.",
        "마포구 일정과 함께 묶어 보기 쉬운 행사입니다.",
      ],
    },
    {
      title: "방문 전에 확인할 것",
      items: [
        "운영 시간은 현장 사정으로 달라질 수 있어 방문 직전에 다시 확인하는 편이 안전합니다.",
        "행사 세부 일정이나 변경 여부는 공식 상세 페이지에서 한 번 더 확인하세요.",
      ],
    },
  ]);
});

test("benefit interpretation builds who-and-checklist sections from current fields", () => {
  const sections = getBenefitInterpretationSections({
    title: "청년 이사비 지원",
    district: "성동구",
    target: "성동구 거주 청년 1인 가구",
    targetSummary: "성동구 청년",
    supportType: "현금지원",
    supportSummary: "이사비 일부 지원",
    applicationMethod: "온라인 신청",
    applicationMethodTypes: ["온라인"],
    isAlwaysOpen: true,
    deadlineText: "상시신청",
    receptionAgency: "성동구청 청년정책과",
    inquiry: ["02-1234-5678"],
    inquiryText: "02-1234-5678",
    onlineUrl: "https://example.com/benefit",
    detailUrl: "",
  });

  assert.deepEqual(sections, [
    {
      title: "이 혜택을 먼저 볼 분",
      items: [
        "성동구 거주 청년 1인 가구에 해당하는지 먼저 확인해 보면 판단이 빠릅니다.",
        "온라인 신청 흐름이 있어 자격 확인부터 비교적 빠르게 시작하기 좋습니다.",
      ],
    },
    {
      title: "신청 전에 확인할 것",
      items: [
        "상시신청으로 보여도 실제 접수 가능 여부나 예산 상황은 달라질 수 있어 공식 안내를 다시 보는 편이 안전합니다.",
        "접수 기관이 성동구청 청년정책과로 표시되어 있어 문의나 방문 전에 담당 부서를 먼저 확인하기 좋습니다.",
        "문의처가 열려 있으니 세부 자격이나 제출 서류는 신청 전에 한 번 확인해 두는 편이 안전합니다.",
      ],
    },
  ]);
});

test("benefit interpretation skips placeholder agency text", () => {
  const sections = getBenefitInterpretationSections({
    title: "임시 혜택",
    district: "종로구",
    target: "종로구 청년",
    targetSummary: "",
    supportType: "현금지원",
    supportSummary: "",
    applicationMethod: "방문 신청",
    applicationMethodTypes: ["방문"],
    isAlwaysOpen: true,
    deadlineText: "상시신청",
    receptionAgency: "접수기관 정보 없음",
    inquiry: [],
    inquiryText: "",
    onlineUrl: "",
    detailUrl: "",
  });

  assert.deepEqual(sections, [
    {
      title: "이 혜택을 먼저 볼 분",
      items: ["종로구 청년에 해당하는지 먼저 확인해 보면 판단이 빠릅니다."],
    },
    {
      title: "신청 전에 확인할 것",
      items: [
        "상시신청으로 보여도 실제 접수 가능 여부나 예산 상황은 달라질 수 있어 공식 안내를 다시 보는 편이 안전합니다.",
      ],
    },
  ]);
});
