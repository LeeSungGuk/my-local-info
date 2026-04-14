"use client";

const partnerId = process.env.NEXT_PUBLIC_COUPANG_PARTNER_ID?.trim() ?? "";
const isConfigured = Boolean(partnerId && partnerId !== "나중에_입력");
const coupangLink = "https://link.coupang.com/a/eoJZPn";

interface CoupangBannerProps {
  className?: string;
}

export default function CoupangBanner({ className = "" }: CoupangBannerProps) {
  if (!isConfigured) {
    return null;
  }

  return (
    <section
      className={className}
      data-partner-id={partnerId}
    >
      <div className="rounded-[1.75rem] border border-sky-100 bg-white/95 p-6 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-sky-700">
          제휴 광고
        </span>
        <p className="text-sm font-semibold leading-6 text-slate-900">
          이 영역은 제휴 광고를 포함하고 있으며, 링크를 통해 일정액의 수수료를 제공받을 수 있습니다.
        </p>

        <div className="mt-5 rounded-[1.5rem] border border-sky-100 bg-[linear-gradient(180deg,#f8fbff_0%,#f0f9ff_100%)] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
                추천 준비물
              </p>
              <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                서울 나들이 전에 가볍게 둘러볼 만한 준비물
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                산책, 전시, 주말 외출처럼 가볍게 움직이는 날에 참고할 수 있는 관련 상품을 쿠팡에서 확인할 수 있습니다.
              </p>
            </div>

            <a
              href={coupangLink}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              referrerPolicy="unsafe-url"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
            >
              쿠팡 제휴 링크 보기
            </a>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["보조배터리", "텀블러", "우산", "가벼운 외출 소품"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full border border-sky-100 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-500">
          외부 제휴 링크로 이동하며, 상품 구성과 가격은 쿠팡 페이지에서 변경될 수 있습니다. 이 영역은 편집 정보 본문과 구분된 제휴 광고 영역입니다.
        </div>
      </div>
    </section>
  );
}
