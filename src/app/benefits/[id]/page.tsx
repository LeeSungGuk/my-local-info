import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DetailFacts from "@/components/detail/DetailFacts";
import { formatKstDateTime } from "@/lib/detail-facts";
import { getBenefitInterpretationSections } from "@/lib/detail-interpretation";
import { formatBenefitDeadline, getBenefitHighlight } from "@/lib/benefit-utils";
import { getAllBenefits, getBenefitById } from "@/lib/public-benefits";

export async function generateStaticParams() {
  const benefits = await getAllBenefits();
  return benefits.map((benefit) => ({
    id: benefit.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const benefit = await getBenefitById(id);

  if (!benefit) {
    return {};
  }

  return {
    title: `${benefit.title} | 서울시티`,
    description: getBenefitHighlight(benefit) || benefit.summary,
  };
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
  const targetText = (benefit.target || benefit.targetSummary).trim();
  const interpretationSections = getBenefitInterpretationSections({
    title: benefit.title,
    district: benefit.district,
    target: benefit.target,
    targetSummary: benefit.targetSummary,
    supportType: benefit.supportType,
    supportSummary: benefit.supportSummary,
    applicationMethod: benefit.applicationMethod,
    applicationMethodTypes: benefit.applicationMethodTypes,
    isAlwaysOpen: benefit.isAlwaysOpen,
    deadlineText: benefit.deadlineText,
    receptionAgency: benefit.receptionAgency,
    inquiry: benefit.inquiry,
    inquiryText: benefit.inquiryText,
    onlineUrl: benefit.onlineUrl,
    detailUrl: benefit.detailUrl,
  });

  return (
    <div className="site-page min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/benefits"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-blue-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          혜택 목록으로 돌아가기
        </Link>

        <article className="detail-article mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">

          <div className="p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
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

            <DetailFacts
              variant="key"
              className="mt-8"
              facts={[
                { label: "신청 기한", value: formatBenefitDeadline(benefit) },
                { label: "지원 유형", value: benefit.supportType },
                {
                  label: "신청 방식",
                  value: benefit.applicationMethodTypes.join(", "),
                },
              ]}
            />

            {externalUrl ? (
              <div className="mt-6">
                <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="button-primary">
                  공식 페이지에서 신청 정보 보기
                  <span className="sr-only">(새 창)</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            ) : null}

            <DetailFacts
              className="mt-8"
              facts={[
                { label: "접수 기관", value: benefit.receptionAgency },
                { label: "문의", value: benefit.inquiryText || benefit.inquiry.join("\n") },
                {
                  label: "연령 기준",
                  value:
                    benefit.ageMin !== null || benefit.ageMax !== null
                      ? `${benefit.ageMin ?? "정보 없음"}세 ~ ${benefit.ageMax ?? "정보 없음"}세`
                      : "",
                },
              ]}
            />

            {targetText ? (
              <details className="mt-6 border-t border-slate-200 pt-4">
                <summary className="inline-flex min-h-11 items-center text-sm font-bold text-slate-900">
                  자격 조건 보기
                </summary>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{targetText}</p>
              </details>
            ) : null}

            <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-6">
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

                {interpretationSections.length > 0 ? (
                  <div className="mt-6 space-y-4">
                    {interpretationSections.map((section) => (
                      <section
                        key={section.title}
                        className="rounded-2xl border border-blue-100 bg-white p-5"
                      >
                        <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-600">
                          {section.items.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="mt-1 text-blue-500">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="rounded-[1.25rem] border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-bold text-gray-900">데이터 출처</h2>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  공공데이터포털{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 text-blue-700">
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
                    <dd className="mt-1">{formatKstDateTime(benefit.collectedAt) || "수집 시각 정보 없음"}</dd>
                  </div>
                  {benefit.updatedAt ? (
                    <div>
                      <dt className="font-semibold text-gray-900">최근 수정일</dt>
                      <dd className="mt-1">{benefit.updatedAt}</dd>
                    </div>
                  ) : null}
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

              </section>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
