import type { FoodSource } from "@/lib/food";

export default function FoodSourceNotice({ source }: { source?: FoodSource }) {
  const collectedAt = source?.collectedAt ? source.collectedAt.slice(0, 10) : "";

  return (
    <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
      <p className="font-bold text-slate-900">먹거리 정보 안내</p>
      <p className="mt-2">
        음식점 후보는 서울 열린데이터광장 일반음식점 인허가 정보에서 영업 상태
        항목만 추려 보여줍니다. 한시적·임시성 신호는 낮추고 구별, 동네, 업태가
        과하게 몰리지 않게 정리하지만, 서울 열린데이터 안내 기준으로 원천 데이터는
        3일 전 자료일 수 있습니다. 영업시간, 휴무, 메뉴, 대기 여부는 방문 전
        카카오맵 또는 공식 채널에서 다시 확인해 주세요.
      </p>
      {collectedAt ? (
        <p className="mt-2 text-xs font-semibold text-slate-500">
          최근 수집일: {collectedAt} · {source?.syncSchedule}
        </p>
      ) : null}
    </aside>
  );
}
