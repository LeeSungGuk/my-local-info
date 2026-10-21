import Link from "next/link";
import type { SituationGuide } from "@/lib/situations";
import HomeUnifiedSearch from "./HomeUnifiedSearch";
import SeoulCover, { type CoverKind } from "./design/SeoulCover";

const flyers: { kind: CoverKind; href: string; label: string }[] = [
  { kind: "kids", href: "/situations/kids", label: "아이와 서울 나들이 가이드" },
  { kind: "rainy-day", href: "/situations/rainy-day", label: "비 오는 날 실내 코스 가이드" },
  { kind: "events", href: "/events", label: "서울 행사·축제 둘러보기" },
  { kind: "free", href: "/situations/free", label: "무료·저비용 나들이 가이드" },
];

export default function HomeHero({ situations }: { situations: SituationGuide[] }) {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="hero-content">
        <p className="eyebrow"><span aria-hidden="true" className="mr-2 text-base">✳</span> 서울 상황별 나들이 가이드</p>
        <h1 id="home-title" className="hero-title">오늘의 서울,<br /><span className="hero-gradient">나만의 속도로.</span></h1>
        <p className="hero-description">아이와, 비 오는 날, 무료·저비용까지.<br />지금 나에게 맞는 서울 나들이를 찾아보세요.</p>
        <HomeUnifiedSearch />
        <nav className="hero-shortcuts" aria-label="상황별 코스 바로가기">
          {situations.map((situation) => <Link key={situation.slug} href={`/search?q=${encodeURIComponent(situation.searchIntent)}`}>{situation.eyebrow}<span aria-hidden="true" className="ml-2">↗</span></Link>)}
        </nav>
      </div>
      <div className="hero-flyers">
        {flyers.map((flyer) => <Link key={flyer.kind} href={flyer.href} className="hero-flyer" aria-label={flyer.label}><SeoulCover kind={flyer.kind} /></Link>)}
      </div>
    </section>
  );
}
