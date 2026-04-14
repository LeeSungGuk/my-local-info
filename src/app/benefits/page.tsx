import BenefitsCatalog from "@/components/BenefitsCatalog";
import { getAllBenefits } from "@/lib/public-benefits";

export const metadata = {
  title: "서울시 지원금·혜택 | 서울시티",
  description:
    "공공데이터포털 대한민국 공공서비스(혜택) 정보를 기준으로 서울시와 자치구, 서울 공공기관 혜택을 확인하세요.",
};

export default async function BenefitsPage() {
  const benefits = await getAllBenefits();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <section className="border-b border-blue-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
            공공데이터포털 지원금·혜택
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            서울 생활에 도움이 되는 혜택을
            <br />
            더 편하게 찾아보세요
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
            일상에 바로 닿는 지원과 생활 혜택만 골라 한곳에 모았습니다.
            <br />
            분야와 지역을 함께 고르면 나에게 맞는 혜택을 더 빠르게 찾을 수 있습니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {benefits.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-blue-200 bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-gray-900">혜택 데이터가 아직 없습니다.</h2>
            <p className="mt-3 text-gray-600">
              <code className="rounded bg-blue-50 px-1.5 py-0.5 text-sm text-blue-700">
                node scripts/fetch-public-benefits.js
              </code>
              를 실행해 공공데이터포털 혜택 데이터를 먼저 생성해 주세요.
            </p>
          </div>
        ) : (
          <BenefitsCatalog benefits={benefits} />
        )}
      </section>
    </div>
  );
}
