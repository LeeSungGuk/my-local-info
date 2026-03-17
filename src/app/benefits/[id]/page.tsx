import Link from "next/link";
import { notFound } from "next/navigation";
import { promises as fs } from "fs";
import path from "path";

// JSON 데이터 타입 정의
interface LocalData {
  benefits: Array<{
    id: number;
    title: string;
    category: string;
    startDate: string;
    endDate: string;
    location: string;
    target: string;
    summary: string;
    url: string;
  }>;
}

// 서버 컴포넌트에서 데이터 로드
async function getLocalData(): Promise<LocalData> {
  const filePath = path.join(process.cwd(), "public", "data", "local-info.json");
  const fileContents = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContents);
}

// 정적 경로 생성
export async function generateStaticParams() {
  const data = await getLocalData();
  return data.benefits.map((benefit) => ({
    id: String(benefit.id),
  }));
}

export default async function BenefitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getLocalData();
  const benefit = data.benefits.find((b) => b.id === Number(id));

  if (!benefit) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* 뒤로가기 */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-amber-600 transition-colors mb-8"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        목록으로 돌아가기
      </Link>

      <article className="animate-fade-in">
        {/* 카테고리 */}
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm font-bold shadow-sm">
          💰 {benefit.category}
        </span>

        {/* 제목 */}
        <h1 className="mt-5 text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
          {benefit.title}
        </h1>

        {/* 정보 카드 */}
        <div className="mt-8 bg-white rounded-2xl border border-amber-100/50 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-start gap-4">
             <div className="flex bg-amber-50 p-3 rounded-xl">
              <span className="text-xl">👤</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">지원 대상</p>
              <p className="text-base text-gray-900 font-medium">{benefit.target}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-100" />
          
          <div className="flex items-start gap-4">
             <div className="flex bg-amber-50 p-3 rounded-xl">
              <span className="text-xl">⏰</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">신청 기간</p>
              <p className="text-base text-gray-900 font-medium">
                {benefit.startDate === "상시" ? "상시 신청 가능" : `${benefit.startDate} ~ ${benefit.endDate}`}
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-100" />
          
          <div className="flex items-start gap-4">
             <div className="flex bg-amber-50 p-3 rounded-xl">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">신청 방법 / 장소</p>
              <p className="text-base text-gray-900 font-medium">{benefit.location}</p>
            </div>
          </div>
        </div>

        {/* 상세 설명 */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block"></span>
            지원금 상세 안내
          </h2>
          <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-2xl border border-amber-100/50 p-6 sm:p-8">
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
              {benefit.summary}
            </p>
          </div>
        </div>

        {/* 원본 사이트 링크 버튼 */}
        <div className="mt-12 text-center">
            <a 
              href={benefit.url}
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto"
            >
                자세히 보기
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
            <p className="mt-4 text-sm text-gray-400">공식 신청 페이지로 이동합니다.</p>
        </div>
      </article>
    </div>
  );
}
