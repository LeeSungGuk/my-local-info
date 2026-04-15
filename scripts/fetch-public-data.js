/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-3-flash-preview";

const LOCAL_INFO_PATH = path.join(__dirname, "..", "public", "data", "local-info.json");
const SEOUL_KEYWORDS = ["서울", "서울특별시"];

// ─── 1단계: 공공데이터포털 API에서 데이터 가져오기 ───
async function fetchPublicData() {
  const url = new URL("https://api.odcloud.kr/api/gov24/v3/serviceList");
  url.searchParams.set("page", "1");
  url.searchParams.set("perPage", "20");
  url.searchParams.set("returnType", "JSON");
  url.searchParams.set("serviceKey", PUBLIC_DATA_API_KEY);

  console.log("📡 공공데이터포털 API 호출 중...");
  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`공공데이터 API 오류: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const items = json.data || [];
  console.log(`✅ ${items.length}건의 데이터를 가져왔습니다.`);

  // 필터링: 서울 관련 데이터만 사용
  const searchFields = ["서비스명", "서비스목적요약", "지원대상", "소관기관명"];

  const seoulItems = items.filter((item) =>
    searchFields.some((field) =>
      SEOUL_KEYWORDS.some((keyword) => item[field] && item[field].includes(keyword))
    )
  );
  if (seoulItems.length > 0) {
    console.log(`🔍 '서울' 관련 데이터 ${seoulItems.length}건 발견`);
    return seoulItems;
  }

  console.log("⚠️ 서울 관련 데이터를 찾지 못했습니다.");
  return [];
}

// ─── 2단계: 기존 데이터와 비교 ───
function loadExistingData() {
  try {
    const raw = fs.readFileSync(LOCAL_INFO_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    // 파일이 없으면 기본 구조 반환
    return { events: [], benefits: [], lastUpdated: "" };
  }
}

function getExistingNames(data) {
  const names = new Set();
  for (const item of data.events) names.add(item.title || item.name);
  for (const item of data.benefits) names.add(item.title || item.name);
  return names;
}

function filterNewItems(apiItems, existingNames) {
  return apiItems.filter((item) => {
    const name = item["서비스명"] || "";
    return !existingNames.has(name);
  });
}

// ─── 3단계: Gemini AI로 가공 ───
async function processWithGemini(rawItem) {
  const prompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜, endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

데이터:
${JSON.stringify(rawItem, null, 2)}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  console.log("🤖 Gemini AI로 데이터 가공 중...");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API 오류: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // 마크다운 코드블록 제거 후 JSON 파싱
  const cleaned = text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}

// ─── 4단계: 기존 데이터에 추가 ───
function addToLocalInfo(existingData, newItem) {
  // 새 ID는 기존 데이터의 최대 ID + 1
  const allIds = [
    ...existingData.events.map((e) => e.id || 0),
    ...existingData.benefits.map((b) => b.id || 0),
  ];
  const maxId = allIds.length > 0 ? Math.max(...allIds) : 0;
  newItem.id = maxId + 1;

  // category에 따라 events 또는 benefits에 추가
  const entry = {
    id: newItem.id,
    title: newItem.name,
    category: newItem.category,
    startDate: newItem.startDate,
    endDate: newItem.endDate,
    location: newItem.location,
    target: newItem.target,
    summary: newItem.summary,
    url: newItem.link || "",
  };

  if (newItem.category === "행사") {
    existingData.events.push(entry);
  } else {
    existingData.benefits.push(entry);
  }

  // 마지막 업데이트 날짜 갱신
  const today = new Date().toISOString().split("T")[0];
  existingData.lastUpdated = today;

  return existingData;
}

// ─── 메인 실행 ───
async function main() {
  try {
    if (!PUBLIC_DATA_API_KEY) {
      throw new Error("환경변수 PUBLIC_DATA_API_KEY가 설정되지 않았습니다.");
    }
    if (!GEMINI_API_KEY) {
      throw new Error("환경변수 GEMINI_API_KEY가 설정되지 않았습니다.");
    }

    // 1단계: API 데이터 가져오기
    const apiItems = await fetchPublicData();
    if (apiItems.length === 0) {
      console.log("⚠️ API에서 가져온 데이터가 없습니다.");
      return;
    }

    // 2단계: 기존 데이터와 비교
    const existingData = loadExistingData();
    const existingNames = getExistingNames(existingData);
    const newItems = filterNewItems(apiItems, existingNames);

    if (newItems.length === 0) {
      console.log("새로운 데이터가 없습니다");
      return;
    }

    console.log(`🆕 새로운 항목 ${newItems.length}건 중 1건을 처리합니다.`);

    // 3단계: 첫 번째 새 항목을 Gemini로 가공
    const processed = await processWithGemini(newItems[0]);
    console.log(`✅ 가공 완료: ${processed.name}`);

    // 4단계: 기존 데이터에 추가 후 저장
    const updatedData = addToLocalInfo(existingData, processed);
    fs.writeFileSync(LOCAL_INFO_PATH, JSON.stringify(updatedData, null, 2), "utf8");
    console.log(`💾 local-info.json 업데이트 완료!`);
    console.log(`📌 추가된 항목: [${processed.category}] ${processed.name}`);
  } catch (error) {
    console.error("❌ 오류 발생:", error.message);
    console.log("기존 local-info.json을 유지합니다.");
    process.exit(1);
  }
}

main();
