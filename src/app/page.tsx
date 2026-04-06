import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";

// JSON 데이터 타입 정의
interface LocalData {
  events: Array<{
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
  lastUpdated: string;
}

// 서버 컴포넌트에서 데이터 로드
async function getLocalData(): Promise<LocalData> {
  const filePath = path.join(process.cwd(), "public", "data", "local-info.json");
  const fileContents = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContents);
}

export default async function Home() {
  const data = await getLocalData();

  return (
    <div>
      {/* 히어로 섹션 (따뜻한 오렌지/코랄 톤 그라데이션) */}
      <section className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6 shadow-sm border border-white/10">
              🏘️ 살기 좋은 우리 동네
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-6 tracking-tight">
              서울시티,
              <br />
              <span className="text-amber-100">한눈에 확인하세요</span>
            </h1>
            <p className="text-lg sm:text-xl text-orange-50 max-w-2xl mx-auto leading-relaxed">
              행사, 축제부터 꼭 필요한 지원금 혜택까지!
              <br />
              서울 시민을 위한 생활 정보를 한곳에 모아드립니다.
            </p>
          </div>
        </div>
        
        {/* 하단 물결 무늬 구분선 효과 */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-white/10 backdrop-blur-sm" />
      </section>

      {/* 행사/축제 섹션 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-3xl">🎉</span> 이번 달 행사/축제
            </h2>
            <p className="mt-2 text-gray-500">
              서울 곳곳에서 열리는 행사와 프로그램을 살펴보세요
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.events.map((event, index) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-orange-100/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* 카드 상단 색상 바 */}
              <div className="h-1.5 bg-gradient-to-r from-orange-400 to-rose-400" />
              
              <div className="p-6">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-50 text-orange-600 mb-4">
                  행사 안내
                </span>
                
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-3">
                  {event.title}
                </h3>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-5 leading-relaxed">
                  {event.summary}
                </p>
                
                <div className="space-y-2 mb-6 bg-gray-50/50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-orange-400">📅</span>
                    <span className="font-medium">{event.startDate} ~ {event.endDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-orange-400">📍</span>
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
                
                <Link
                  href={`/events/${event.id}`}
                  className="inline-flex w-full items-center justify-center text-sm font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 px-4 py-2.5 rounded-xl transition-colors"
                >
                  자세히 보기
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 지원금/혜택 섹션 */}
      <section className="bg-orange-50/30 border-t border-orange-100/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex items-center justify-between mb-8 sm:mb-10">
            <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-3xl">💰</span> 놓치면 아쉬운 혜택
            </h2>
            <p className="mt-2 text-gray-500">
              서울 생활에 도움이 되는 지원 정보를 확인하세요
            </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.benefits.map((benefit, index) => (
              <div
                key={benefit.id}
                className="bg-white rounded-2xl border border-amber-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full group animate-slide-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="p-1 pl-6 pt-6 flex justify-between items-start">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-600">
                    지원 혜택
                  </span>
                </div>
                
                <div className="px-6 pt-3 pb-6 flex-1 flex flex-col">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors mb-4 line-clamp-2">
                    {benefit.title}
                  </h3>
                  
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100/50 mb-5 text-sm text-gray-700 font-medium flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    {benefit.target}
                  </div>
                  
                  <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1">
                    {benefit.summary}
                  </p>
                  
                  <Link
                    href={`/benefits/${benefit.id}`}
                    className="inline-flex items-center text-sm font-semibold text-amber-600 hover:text-amber-700"
                  >
                    자세히 보기
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
                
                {/* 하단 강조 선 */}
                <div className="h-1 bg-amber-400/20 group-hover:bg-amber-400 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 하단 데이터 출처 구역 */}
      <section className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            본 사이트는 공공데이터포털(data.go.kr)의 OPEN API를 활용하여 제작되었습니다.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-500 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            마지막 업데이트: {data.lastUpdated}
          </div>
        </div>
      </section>
    </div>
  );
}
