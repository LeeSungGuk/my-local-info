import type { Metadata } from "next";
import EventPoster from "@/components/design/EventPoster";
import DetailFacts from "@/components/detail/DetailFacts";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildGoogleCalendarUrl, formatKstDateTime } from "@/lib/detail-facts";
import { getEventInterpretationSections } from "@/lib/detail-interpretation";
import { buildKakaoMapSearchUrl } from "@/lib/food";
import { formatEventPeriod, getAllEvents, getEventById } from "@/lib/seoul-events";

export async function generateStaticParams() {
  const events = await getAllEvents();
  return events.map((event) => ({
    id: event.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return {};
  }

  return {
    title: `${event.title} | 서울시티`,
    description: event.summary,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const externalUrl = event.detailUrl || event.organizerUrl;
  const calendarUrl = buildGoogleCalendarUrl({
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    location: event.venue,
  });
  const interpretationSections = getEventInterpretationSections({
    title: event.title,
    category: event.category,
    district: event.district,
    venue: event.venue,
    startDate: event.startDate,
    endDate: event.endDate,
    timeText: event.timeText,
    target: event.target,
    isFree: event.isFree,
    fee: event.fee,
    detailUrl: event.detailUrl,
    organizerUrl: event.organizerUrl,
  });

  return (
    <div className="site-page min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-sky-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          행사 목록으로 돌아가기
        </Link>

        <article className="detail-article mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">

          <div className="p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
                {event.category}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                {event.district}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                {event.isFree ? "무료" : "유료"}
              </span>
            </div>

            <h1 className="mt-5 text-3xl sm:text-4xl font-extrabold leading-tight text-gray-900">
              {event.title}
            </h1>

            <p className="mt-4 text-base leading-relaxed text-gray-600">
              {event.summary}
            </p>

            <DetailFacts
              variant="key"
              className="mt-8"
              facts={[
                { label: "일정", value: formatEventPeriod(event) },
                { label: "장소", value: event.venue },
                { label: "요금", value: event.isFree ? "무료" : event.fee },
              ]}
            />

            <div className="mt-6 flex flex-wrap gap-3">
              {externalUrl ? (
                <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="button-primary">
                  공식 상세 페이지 보기
                  <span className="sr-only">(새 창)</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
              {event.venue ? (
                <a
                  href={buildKakaoMapSearchUrl(event.venue)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-secondary"
                >
                  지도에서 장소 보기
                  <span className="sr-only">(카카오맵, 새 창)</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
              {calendarUrl ? (
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="button-secondary">
                  구글 캘린더에 추가
                  <span className="sr-only">(새 창)</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>

            <EventPoster imageUrl={event.imageUrl} title={event.title} className="mt-8" />

            <DetailFacts
              className="mt-8"
              facts={[
                { label: "운영 시간", value: event.timeText },
                { label: "이용 대상", value: event.target },
                { label: "주최", value: event.organizer },
                { label: "문의", value: event.inquiry },
              ]}
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-xl font-bold text-gray-900">행사 안내</h2>
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-gray-700">
                  {event.description || "서울 열린데이터광장에서 별도 상세 설명을 제공하지 않아 공식 상세 페이지 확인이 필요합니다."}
                </p>

                {event.program ? (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-900">프로그램</h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                      {event.program}
                    </p>
                  </div>
                ) : null}

                {event.performer ? (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-900">출연자</h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                      {event.performer}
                    </p>
                  </div>
                ) : null}

                {interpretationSections.length > 0 ? (
                  <div className="mt-6 space-y-4">
                    {interpretationSections.map((section) => (
                      <section
                        key={section.title}
                        className="rounded-2xl border border-sky-100 bg-white p-5"
                      >
                        <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-600">
                          {section.items.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="mt-1 text-sky-500">•</span>
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
                  서울 열린데이터광장{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 text-sky-700">서울시 문화행사 정보</code>
                  {" "}데이터를 기준으로 저장한 항목입니다.
                </p>

                <dl className="mt-5 space-y-3 text-sm text-gray-700">
                  <div>
                    <dt className="font-semibold text-gray-900">출처 기준</dt>
                    <dd className="mt-1">서울특별시 전체 행사·축제</dd>
                  </div>
                  {event.registeredAt ? (
                    <div>
                      <dt className="font-semibold text-gray-900">등록일</dt>
                      <dd className="mt-1">{event.registeredAt}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="font-semibold text-gray-900">수집 시각</dt>
                    <dd className="mt-1">{formatKstDateTime(event.collectedAt) || "수집 시각 정보 없음"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900">원본 식별자</dt>
                    <dd className="mt-1">{event.sourceId}</dd>
                  </div>
                </dl>

              </section>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
