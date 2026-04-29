interface DistrictSourceNoticeProps {
  eventCollectedAt?: string;
  benefitCollectedAt?: string;
}

export default function DistrictSourceNotice({
  eventCollectedAt,
  benefitCollectedAt,
}: DistrictSourceNoticeProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
      <p className="font-bold text-slate-900">데이터 확인 안내</p>
      <p className="mt-2">
        행사 정보는 서울 열린데이터광장, 지원금·혜택 정보는 공공데이터포털
        기준으로 정리합니다. 일정, 장소, 신청 조건은 변경될 수 있으므로 방문
        또는 신청 전 공식 상세 페이지를 확인해 주세요.
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
        {eventCollectedAt ? <span>행사 수집: {eventCollectedAt}</span> : null}
        {benefitCollectedAt ? <span>혜택 수집: {benefitCollectedAt}</span> : null}
      </div>
    </aside>
  );
}
