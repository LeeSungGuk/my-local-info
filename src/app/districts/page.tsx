import type { Metadata } from "next";
import Link from "next/link";
import DistrictCard from "@/components/districts/DistrictCard";
import DistrictSourceNotice from "@/components/districts/DistrictSourceNotice";
import { getAllDistricts } from "@/lib/districts";
import { getEventsIndex } from "@/lib/seoul-events";
import { getBenefitsIndex } from "@/lib/public-benefits";

export const metadata: Metadata = {
  title: "서울 구별 가이드 | 서울시티",
  description:
    "종로구, 마포구, 성동구, 강남구 등 서울 주요 구별로 가볼 만한 권역, 상황별 코스, 최신 행사와 혜택을 정리합니다.",
};

export default async function DistrictsPage() {
  const [eventsIndex, benefitsIndex] = await Promise.all([
    getEventsIndex(),
    getBenefitsIndex(),
  ]);
  const districts = getAllDistricts();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_34%,#f8fbff_100%)]">
      <section className="border-b border-sky-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
            서울 구별 랜딩 가이드
          </span>
          <h1 className="mt-5 max-w-4xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            서울을 구별로 나눠
            <br />
            행사, 혜택, 코스를 함께 봅니다
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            서울 전체 목록만 보면 선택지가 너무 넓습니다. 자주 찾는 구를 기준으로
            최신 행사, 공공 혜택, 반나절 코스, 상황별 추천을 한 페이지에서
            확인할 수 있게 정리했습니다.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <SummaryStat label="가이드 구" value={`${districts.length}개`} />
            <SummaryStat
              label="행사 데이터"
              value={`${eventsIndex.items.length.toLocaleString("ko-KR")}건`}
            />
            <SummaryStat
              label="혜택 데이터"
              value={`${benefitsIndex.items.length.toLocaleString("ko-KR")}건`}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <section>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
                Districts
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">
                먼저 볼 구를 선택하세요
              </h2>
            </div>
            <Link
              href="/events"
              className="inline-flex min-h-11 items-center rounded-xl border border-sky-200 bg-white px-4 text-sm font-bold text-sky-700 transition-colors hover:bg-sky-50"
            >
              서울 전체 행사 보기
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {districts.map((district) => (
              <DistrictCard key={district.slug} district={district} />
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-soft sm:p-8">
            <h2 className="text-2xl font-extrabold text-slate-950">
              왜 구별 페이지가 필요한가요?
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <ReasonCard
                title="검색 의도"
                text="사람들은 보통 '서울 행사'보다 '마포구 무료 행사', '종로구 아이와'처럼 좁게 찾습니다."
              />
              <ReasonCard
                title="체류 시간"
                text="행사만 보여주지 않고 주변 권역과 코스를 붙이면 다음 클릭 이유가 생깁니다."
              />
              <ReasonCard
                title="최신성"
                text="행사와 혜택 데이터가 갱신되면 구 페이지의 목록도 빌드 시점에 함께 바뀝니다."
              />
            </div>
          </div>

          <DistrictSourceNotice
            eventCollectedAt={eventsIndex.source.collectedAt}
            benefitCollectedAt={benefitsIndex.source.collectedAt}
          />
        </section>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white/80 p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-slate-950">{value}</p>
    </div>
  );
}

function ReasonCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <h3 className="font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
