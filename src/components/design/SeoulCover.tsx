import type { SituationSlug } from "@/lib/situations";

export type CoverKind = SituationSlug | "events";

const covers = {
  kids: { number: "01", title: "함께 걷는 서울", note: "아이와 만드는 주말의 기억" },
  "rainy-day": { number: "02", title: "비 오는 날의 산책", note: "날씨에 구애받지 않는 하루" },
  free: { number: "03", title: "가벼운 하루, 서울", note: "부담 없이 발견하는 작은 즐거움" },
  events: { number: "04", title: "오늘, 서울에서", note: "전시와 공연 사이의 새로운 발견" },
};

export default function SeoulCover({ kind, title }: { kind: CoverKind; title?: string }) {
  const cover = covers[kind];
  return (
    <div className={`seoul-cover cover-${kind}`} aria-hidden="true">
      <div className="seoul-cover-meta"><span>SEOUL CITY</span><span>NO. {cover.number}</span></div>
      <svg className="seoul-cover-art" viewBox="0 0 200 160" fill="none">
        {kind === "kids" ? (
          <>
            <circle cx="100" cy="77" r="59" stroke="currentColor" strokeOpacity=".25" />
            <circle cx="100" cy="77" r="47" stroke="currentColor" strokeOpacity=".3" strokeDasharray="2 6" />
            <path d="m100 16 15 46 46 15-46 15-15 46-15-46-46-15 46-15Z" fill="currentColor" opacity=".9" />
            <path d="m100 42 8 27 27 8-27 8-8 27-8-27-27-8 27-8Z" fill="#f5e4ca" />
            <circle cx="100" cy="77" r="8" fill="currentColor" />
            <path d="M24 28h12m-6-6v12m134 87h12m-6-6v12" stroke="currentColor" strokeOpacity=".65" />
          </>
        ) : kind === "rainy-day" ? (
          <>
            <path d="M39 79a61 61 0 0 1 122 0H39Z" fill="currentColor" opacity=".75" />
            <path d="M100 18c-20 15-29 37-29 61m29-61c20 15 29 37 29 61M100 18v106a15 15 0 0 1-30 0" stroke="#f6f0fc" strokeWidth="4" strokeLinecap="round" />
            <path d="m37 103-4 9m24-4-4 9m87-14-4 9m25-4-4 9M91 2v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M36 147c25-7 45-7 66 0s40 7 62 0" stroke="currentColor" strokeOpacity=".4" />
          </>
        ) : kind === "free" ? (
          <>
            <circle cx="144" cy="38" r="24" fill="#bc8262" opacity=".85" />
            <path d="M29 139V113h27V87h27V61h27V35h27v104H29Z" fill="currentColor" />
            <path d="M37 139v-18h27V95h27V69h27V43h19" stroke="#f2f2d9" strokeOpacity=".35" />
            <path d="M158 139V92m0 23c-26 0-26-26 0-23m0 15c23 0 28-28 4-25" stroke="currentColor" strokeWidth="2" />
          </>
        ) : (
          <>
            <circle cx="100" cy="74" r="49" stroke="currentColor" strokeOpacity=".3" />
            <path d="M112 25a49 49 0 1 0 24 85 43 43 0 0 1-24-85Z" fill="currentColor" />
            <path d="m156 42 3 10 10 3-10 3-3 10-3-10-10-3 10-3Zm-118 5 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="currentColor" />
            <path d="M27 133c22-7 46-7 70 0s48 7 76 0M27 142c22-7 46-7 70 0s48 7 76 0" stroke="currentColor" strokeOpacity=".45" />
          </>
        )}
      </svg>
      <p className="seoul-cover-title">{title || cover.title}</p>
      <p className="seoul-cover-note">{cover.note}</p>
    </div>
  );
}
