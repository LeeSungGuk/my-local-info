import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatEventPeriod, getAllEvents, getEventById } from "@/lib/seoul-events";

export async function generateStaticParams() {
  const events = await getAllEvents();
  return events.map((event) => ({
    id: event.id,
  }));
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

  return (
    <div className="bg-gradient-to-b from-orange-50 via-white to-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-orange-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          행사 목록으로 돌아가기
        </Link>

        <article className="mt-8 overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-sm">
          <div className="h-2 bg-gradient-to-r from-orange-400 via-orange-500 to-rose-400" />

          <div className="p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
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

            {event.imageUrl ? (
              <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-orange-100 bg-orange-50">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  width={1600}
                  height={900}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
            ) : null}

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoCard label="일정" value={formatEventPeriod(event)} icon="📅" />
              <InfoCard label="운영 시간" value={event.timeText || "운영 시간 정보 없음"} icon="⏰" />
              <InfoCard label="장소" value={event.venue} icon="📍" />
              <InfoCard label="주최" value={event.organizer} icon="🏛️" />
              <InfoCard label="이용 대상" value={event.target} icon="👥" />
              <InfoCard label="요금" value={event.isFree ? "무료" : event.fee} icon="💸" />
              <InfoCard label="문의" value={event.inquiry} icon="☎️" />
              <InfoCard label="등록일" value={event.registeredAt || "등록일 정보 없음"} icon="🗓️" />
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-6">
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
              </section>

              <section className="rounded-[1.5rem] border border-orange-100 bg-orange-50 p-6">
                <h2 className="text-xl font-bold text-gray-900">데이터 출처</h2>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  서울 열린데이터광장{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 text-orange-700">서울시 문화행사 정보</code>
                  {" "}데이터를 기준으로 저장한 항목입니다.
                </p>

                <dl className="mt-5 space-y-3 text-sm text-gray-700">
                  <div>
                    <dt className="font-semibold text-gray-900">출처 기준</dt>
                    <dd className="mt-1">서울특별시 전체 행사·축제</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900">수집 시각</dt>
                    <dd className="mt-1">{event.collectedAt || "수집 시각 정보 없음"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900">원본 식별자</dt>
                    <dd className="mt-1">{event.sourceId}</dd>
                  </div>
                </dl>

                {externalUrl ? (
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-orange-600 hover:to-rose-600"
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
    <div className="rounded-2xl border border-orange-100 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-lg">
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
