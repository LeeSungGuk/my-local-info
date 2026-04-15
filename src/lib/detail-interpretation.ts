export interface InterpretationSection {
  title: string;
  items: string[];
}

interface EventInterpretationInput {
  title: string;
  category: string;
  district: string;
  venue: string;
  startDate: string;
  endDate: string;
  timeText: string;
  target: string;
  isFree: boolean;
  fee: string;
  detailUrl: string;
  organizerUrl: string;
}

interface BenefitInterpretationInput {
  title: string;
  district: string;
  target: string;
  targetSummary: string;
  supportType: string;
  supportSummary: string;
  applicationMethod: string;
  applicationMethodTypes: string[];
  isAlwaysOpen: boolean;
  deadlineText: string;
  receptionAgency: string;
  inquiry: string[];
  inquiryText: string;
  onlineUrl: string;
  detailUrl: string;
}

function normalizeText(value: string) {
  return value.trim();
}

const PLACEHOLDER_TEXTS = new Set([
  "정보 없음",
  "접수기관 정보 없음",
  "문의처 정보 없음",
  "신청 방식 정보 없음",
  "운영 시간 정보 없음",
  "수집 시각 정보 없음",
  "등록일 정보 없음",
  "최근 수정일 정보 없음",
]);

function hasText(value: string) {
  return normalizeText(value).length > 0;
}

function hasMeaningfulText(value: string) {
  const normalized = normalizeText(value);
  return normalized.length > 0 && !PLACEHOLDER_TEXTS.has(normalized);
}

function hasOnlineFlow(applicationMethod: string, applicationMethodTypes: string[], onlineUrl: string) {
  return (
    applicationMethodTypes.some((item) => item.includes("온라인")) ||
    applicationMethod.includes("온라인") ||
    hasMeaningfulText(onlineUrl)
  );
}

function createSection(title: string, items: string[]): InterpretationSection | null {
  const visibleItems = items.filter((item) => hasText(item));

  if (visibleItems.length === 0) {
    return null;
  }

  return { title, items: visibleItems };
}

export function getEventInterpretationSections(
  event: EventInterpretationInput
): InterpretationSection[] {
  const audienceSection = createSection("이런 분께 먼저 맞아요", [
    hasMeaningfulText(event.target)
      ? `${normalizeText(event.target)} 안내가 있어 대상에 맞는지 먼저 가볍게 확인하기 좋습니다.`
      : "",
    event.isFree
      ? "무료 행사라 일정만 맞으면 부담 없이 들러보기 좋습니다."
      : hasMeaningfulText(event.fee)
        ? `유료 행사이므로 방문 전에 비용 정보를 먼저 확인하는 편이 좋습니다.`
        : "",
    hasMeaningfulText(event.district) ? `${normalizeText(event.district)} 일정과 함께 묶어 보기 쉬운 행사입니다.` : "",
  ]);

  const checklistSection = createSection("방문 전에 확인할 것", [
    hasMeaningfulText(event.timeText)
      ? "운영 시간은 현장 사정으로 달라질 수 있어 방문 직전에 다시 확인하는 편이 안전합니다."
      : hasMeaningfulText(event.startDate) || hasMeaningfulText(event.endDate)
        ? "행사 일정은 변경될 수 있어 방문 전에 한 번 더 확인하는 편이 안전합니다."
        : "",
    hasMeaningfulText(event.detailUrl) || hasMeaningfulText(event.organizerUrl)
      ? "행사 세부 일정이나 변경 여부는 공식 상세 페이지에서 한 번 더 확인하세요."
      : "",
  ]);

  return [audienceSection, checklistSection].filter(
    (section): section is InterpretationSection => section !== null
  );
}

export function getBenefitInterpretationSections(
  benefit: BenefitInterpretationInput
): InterpretationSection[] {
  const targetText = hasMeaningfulText(benefit.target)
    ? normalizeText(benefit.target)
    : hasMeaningfulText(benefit.targetSummary)
      ? normalizeText(benefit.targetSummary)
      : "";
  const audienceSection = createSection("이 혜택을 먼저 볼 분", [
    hasText(targetText)
      ? `${targetText}에 해당하는지 먼저 확인해 보면 판단이 빠릅니다.`
      : "",
    hasOnlineFlow(benefit.applicationMethod, benefit.applicationMethodTypes, benefit.onlineUrl)
      ? "온라인 신청 흐름이 있어 자격 확인부터 비교적 빠르게 시작하기 좋습니다."
      : "",
  ]);

  const hasAlwaysOpenSignal =
    benefit.isAlwaysOpen || benefit.deadlineText.includes("상시");
  const inquiryText = hasMeaningfulText(benefit.inquiryText)
    ? normalizeText(benefit.inquiryText)
    : benefit.inquiry.map(normalizeText).filter(hasMeaningfulText).join(", ");
  const checklistSection = createSection("신청 전에 확인할 것", [
    hasAlwaysOpenSignal
      ? "상시신청으로 보여도 실제 접수 가능 여부나 예산 상황은 달라질 수 있어 공식 안내를 다시 보는 편이 안전합니다."
      : "",
    hasMeaningfulText(benefit.receptionAgency)
      ? `접수 기관이 ${normalizeText(benefit.receptionAgency)}로 표시되어 있어 문의나 방문 전에 담당 부서를 먼저 확인하기 좋습니다.`
      : "",
    hasMeaningfulText(inquiryText)
      ? "문의처가 열려 있으니 세부 자격이나 제출 서류는 신청 전에 한 번 확인해 두는 편이 안전합니다."
      : "",
  ]);

  return [audienceSection, checklistSection].filter(
    (section): section is InterpretationSection => section !== null
  );
}
