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
