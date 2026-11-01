export interface BenefitSortShape {
  updatedAt: string;
  district: string;
  field: string;
  title: string;
}

export interface BenefitDeadlineShape {
  deadlineText: string;
  isAlwaysOpen: boolean;
}

export function sortBenefits<T extends BenefitSortShape>(benefits: T[]) {
  return [...benefits].sort((a, b) => {
    const byUpdatedAt = (b.updatedAt || "").localeCompare(a.updatedAt || "");

    if (byUpdatedAt !== 0) {
      return byUpdatedAt;
    }

    const byDistrict = (a.district || "").localeCompare(b.district || "", "ko");

    if (byDistrict !== 0) {
      return byDistrict;
    }

    const byField = (a.field || "").localeCompare(b.field || "", "ko");

    if (byField !== 0) {
      return byField;
    }

    return (a.title || "").localeCompare(b.title || "", "ko");
  });
}

export function formatBenefitDeadline(benefit: BenefitDeadlineShape) {
  if (benefit.isAlwaysOpen) {
    return "상시신청";
  }

  return benefit.deadlineText || "상세페이지 확인";
}

export interface BenefitHighlightShape {
  summary: string;
  supportSummary: string;
}

// 수집 스크립트가 모든 요약 앞에 붙이는 "○○에서 제공하는 ○○ 혜택입니다." 문장
const TEMPLATE_SENTENCE = /^.*?에서 제공하는 \S+ 혜택입니다\.\s*/;
const STATUTE_PATTERN = /「|제\d+조/;

function cleanBenefitText(value: string) {
  return value
    .replace(/[○※□■▶•]\s*/g, "")
    .replace(/(^|\n)\s*(\d+[.)]|-)\s*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function getBenefitHighlight(benefit: BenefitHighlightShape) {
  const summary = benefit.summary.replace(TEMPLATE_SENTENCE, "").trim();

  return summary || cleanBenefitText(benefit.supportSummary);
}

export interface FeaturedBenefitShape extends BenefitSortShape {
  targetSummary: string;
}

export function pickFeaturedBenefits<T extends FeaturedBenefitShape>(benefits: T[], limit: number) {
  const sorted = sortBenefits(benefits);
  const picked: T[] = [];
  const districts = new Set<string>();
  const fields = new Set<string>();

  // 홈에서 한 구·한 분야에 몰리지 않고, 법조문이 앞서는 혜택은 뒤로 미룬다
  for (const benefit of sorted) {
    if (picked.length >= limit) break;
    if (STATUTE_PATTERN.test(benefit.targetSummary)) continue;
    if (districts.has(benefit.district) || fields.has(benefit.field)) continue;

    picked.push(benefit);
    districts.add(benefit.district);
    fields.add(benefit.field);
  }

  for (const benefit of sorted) {
    if (picked.length >= limit) break;
    if (!picked.includes(benefit)) picked.push(benefit);
  }

  return picked;
}
