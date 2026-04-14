import Link from "next/link";
import { notFound } from "next/navigation";
import { formatBenefitDeadline } from "@/lib/benefit-utils";
import { getAllBenefits, getBenefitById } from "@/lib/public-benefits";

export async function generateStaticParams() {
  const benefits = await getAllBenefits();
  return benefits.map((benefit) => ({
    id: benefit.id,
  }));
}

export default async function BenefitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const benefit = await getBenefitById(id);

  if (!benefit) {
    notFound();
  }

  const externalUrl = benefit.onlineUrl || benefit.detailUrl;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/benefits"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-amber-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          혜택 목록으로 돌아가기
        </Link>

        <article className="mt-8 overflow-hidden rounded-[2rem] border border-amber-100 bg-white shadow-sm">
          <div className="h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />

          <div className="p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                {benefit.field}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                {benefit.district}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                {benefit.providerType}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
              {benefit.title}
            </h1>

            <p className="mt-3 text-base font-medium text-gray-500">{benefit.provider}</p>

            <p className="mt-4 text-base leading-relaxed text-gray-600">{benefit.summary}</p>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoCard label="신청 기한" value={formatBenefitDeadline(benefit)} icon="⏰" />
              <InfoCard label="지원 유형" value={benefit.supportType} icon="💰" />
              <InfoCard label="접수 기관" value={benefit.receptionAgency} icon="🏛️" />
              <InfoCard
                label="신청 방식"
                value={
                  benefit.applicationMethodTypes.length > 0
                    ? benefit.applicationMethodTypes.join(", ")
                    : "신청 방식 정보 없음"
                }
                icon="📝"
              />
              <InfoCard label="지원 대상" value={benefit.target || benefit.targetSummary} icon="🎯" />
              <InfoCard
                label="문의"
                value={benefit.inquiryText || benefit.inquiry.join("\n") || "문의처 정보 없음"}
                icon="☎️"
              />
              {benefit.ageMin !== null || benefit.ageMax !== null ? (
                <InfoCard
                  label="연령 기준"
                  value={`${benefit.ageMin ?? "정보 없음"}세 ~ ${benefit.ageMax ?? "정보 없음"}세`}
                  icon="👤"
                />
              ) : null}
              <InfoCard label="최근 수정일" value={benefit.updatedAt || "정보 없음"} icon="🗓️" />
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-6">
                <h2 className="text-xl font-bold text-gray-900">혜택 안내</h2>
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-gray-700">
                  {benefit.purpose || benefit.supportSummary || "상세 목적 정보 없음"}
                </p>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900">지원 내용</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                    {benefit.supportContent || "지원 내용 정보 없음"}
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900">선정 기준</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                    {benefit.selectionCriteria || "선정 기준 정보 없음"}
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900">신청 방법</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                    {benefit.applicationMethod || "신청 방법 정보 없음"}
                  </p>
                </div>

                {benefit.documents || benefit.officialDocuments || benefit.identityDocuments ? (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-900">구비 서류</h3>
                    <div className="mt-2 space-y-3 text-sm leading-relaxed text-gray-600">
                      {benefit.documents ? <p className="whitespace-pre-line">{benefit.documents}</p> : null}
                      {benefit.officialDocuments ? (
                        <p className="whitespace-pre-line">공무원 확인 서류: {benefit.officialDocuments}</p>
                      ) : null}
                      {benefit.identityDocuments ? (
                        <p className="whitespace-pre-line">본인 확인 서류: {benefit.identityDocuments}</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </section>

              <section className="rounded-[1.5rem] border border-amber-100 bg-amber-50 p-6">
                <h2 className="text-xl font-bold text-gray-900">데이터 출처</h2>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  공공데이터포털{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 text-amber-700">
                    대한민국 공공서비스(혜택) 정보
                  </code>
                  를 기준으로 저장한 항목입니다.
                </p>

                <dl className="mt-5 space-y-3 text-sm text-gray-700">
                  <div>
                    <dt className="font-semibold text-gray-900">원본 식별자</dt>
                    <dd className="mt-1">{benefit.sourceId}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900">제공 기관</dt>
                    <dd className="mt-1">{benefit.provider}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900">수집 시각</dt>
                    <dd className="mt-1">{benefit.collectedAt || "수집 시각 정보 없음"}</dd>
                  </div>
                  {benefit.legalBasis.length > 0 ? (
                    <div>
                      <dt className="font-semibold text-gray-900">법령</dt>
                      <dd className="mt-1 whitespace-pre-line">{benefit.legalBasis.join("\n")}</dd>
                    </div>
                  ) : null}
                  {benefit.ordinance ? (
                    <div>
                      <dt className="font-semibold text-gray-900">자치법규</dt>
                      <dd className="mt-1 whitespace-pre-line">{benefit.ordinance}</dd>
                    </div>
                  ) : null}
                </dl>

                {externalUrl ? (
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-amber-600 hover:to-orange-600"
                  >
                    공식 상세 페이지 보기
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                ) : null}
              </section>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
          <p className="mt-1 whitespace-pre-line text-sm font-medium leading-relaxed text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
