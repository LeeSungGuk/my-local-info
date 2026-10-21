import type { DistrictSlug } from "@/lib/districts";

const covers: Record<DistrictSlug, { tone: string; art: "bowl" | "cup" | "picnic"; number: string }> = {
  jongno: { tone: "peach", art: "bowl", number: "01" },
  jung: { tone: "lavender", art: "cup", number: "02" },
  mapo: { tone: "sage", art: "picnic", number: "03" },
  seongdong: { tone: "teal", art: "cup", number: "04" },
  yongsan: { tone: "sage", art: "bowl", number: "05" },
  gangnam: { tone: "lavender", art: "picnic", number: "06" },
  songpa: { tone: "peach", art: "picnic", number: "07" },
  yeongdeungpo: { tone: "teal", art: "bowl", number: "08" },
  seodaemun: { tone: "peach", art: "cup", number: "09" },
  gwangjin: { tone: "sage", art: "bowl", number: "10" },
};

export default function FoodGuideCover({
  districtSlug,
  districtName,
  area,
}: {
  districtSlug: DistrictSlug;
  districtName: string;
  area: string;
}) {
  const cover = covers[districtSlug];

  return (
    <div className={`seoul-cover food-guide-cover food-cover-${cover.tone}`} aria-hidden="true">
      <div className="seoul-cover-meta"><span>SEOUL TABLE</span><span>NO. {cover.number}</span></div>
      <svg className="seoul-cover-art" viewBox="0 0 200 160" fill="none">
        {cover.art === "bowl" ? (
          <>
            <ellipse cx="96" cy="81" rx="57" ry="14" stroke="currentColor" strokeWidth="3" />
            <path d="M39 82c5 35 25 50 57 50s52-15 57-50M77 134h38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M79 58c-13-14 10-18 0-32m20 32c-13-14 10-18 0-32m20 32c-13-14 10-18 0-32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".65" />
            <path d="m148 28 19 89m-9-91 19 89" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M28 147h145" stroke="currentColor" opacity=".3" />
          </>
        ) : cover.art === "cup" ? (
          <>
            <circle cx="56" cy="44" r="24" fill="currentColor" opacity=".15" />
            <path d="M60 66h76v35a34 34 0 0 1-34 34h-8a34 34 0 0 1-34-34V66Zm76 6h9a18 18 0 0 1 0 36h-12M46 143h105" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="98" cy="66" rx="38" ry="8" stroke="currentColor" strokeWidth="2" />
            <path d="M84 47c-13-14 11-18 0-33m25 33c-13-14 11-18 0-33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".7" />
            <path d="m162 34 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="currentColor" />
          </>
        ) : (
          <>
            <circle cx="145" cy="39" r="22" fill="currentColor" opacity=".2" />
            <path d="m49 135 15-65h77l15 65H49Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
            <path d="M77 70V54a26 26 0 0 1 52 0v16M60 91h87M55 111h96M77 74l-5 60m27-60v60m23-60 5 60" stroke="currentColor" strokeWidth="2" opacity=".75" />
            <path d="M31 145h138M39 41h12m-6-6v12" stroke="currentColor" strokeLinecap="round" opacity=".5" />
          </>
        )}
      </svg>
      <p className="seoul-cover-title">{districtName},<br />산책과 한 끼</p>
      <p className="seoul-cover-note">{area}</p>
    </div>
  );
}
