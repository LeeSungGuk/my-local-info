export default function FoodSourceNotice() {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
      <p className="font-bold text-slate-900">먹거리 정보 안내</p>
      <p className="mt-2">
        이 페이지는 카카오 API를 호출하지 않고 카카오맵 검색 결과로 연결합니다.
        영업시간, 휴무, 메뉴, 대기 여부는 방문 전 카카오맵 또는 공식 채널에서
        다시 확인해 주세요.
      </p>
    </aside>
  );
}
