/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const LOCAL_INFO_PATH = path.join(__dirname, "..", "public", "data", "local-info.json");
const POSTS_DIR = path.join(__dirname, "..", "src", "content", "posts");

// ─── 1단계: 최신 데이터 확인 ───
function getLatestItem() {
  const raw = fs.readFileSync(LOCAL_INFO_PATH, "utf8");
  const data = JSON.parse(raw);

  // events와 benefits 중 마지막 항목 찾기
  const allItems = [...data.events, ...data.benefits];
  if (allItems.length === 0) {
    return null;
  }

  return allItems[allItems.length - 1];
}

function isAlreadyWritten(itemName) {
  if (!fs.existsSync(POSTS_DIR)) {
    return false;
  }

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    if (content.includes(itemName)) {
      return true;
    }
  }
  return false;
}

// ─── 2단계: Gemini AI로 블로그 글 생성 ───
async function generateBlogPost(item) {
  const today = new Date().toISOString().split("T")[0];

  const prompt = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(item, null, 2)}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: ${today}
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: ${today}-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  console.log("🤖 Gemini AI로 블로그 글 생성 중...");
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

  if (!text) {
    throw new Error("Gemini 응답이 비어있습니다.");
  }

  return text;
}

// ─── 3단계: 파일 저장 ───
function savePost(geminiResponse) {
  // FILENAME 줄 분리
  const lines = geminiResponse.trim().split("\n");
  let filename = "";
  let content = "";

  // 마지막에서 FILENAME: 찾기
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim().startsWith("FILENAME:")) {
      filename = lines[i].trim().replace("FILENAME:", "").trim();
      // FILENAME 줄 제거한 본문
      content = lines.slice(0, i).join("\n").trim();
      break;
    }
  }

  if (!filename) {
    // FILENAME을 못 찾으면 기본 파일명 사용
    const today = new Date().toISOString().split("T")[0];
    filename = `${today}-public-service`;
    content = geminiResponse.trim();
  }

  // 마크다운 코드블록 제거
  content = content
    .replace(/^```markdown\s*/i, "")
    .replace(/^```md\s*/i, "")
    .replace(/```\s*$/g, "")
    .trim();

  // 파일명에서 .md 확장자 제거 (이미 있으면)
  filename = filename.replace(/\.md$/, "");

  // posts 디렉토리 생성
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }

  const filePath = path.join(POSTS_DIR, `${filename}.md`);
  fs.writeFileSync(filePath, content + "\n", "utf8");

  return { filename, filePath };
}

// ─── 메인 실행 ───
async function main() {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("환경변수 GEMINI_API_KEY가 설정되지 않았습니다.");
    }

    // 1단계: 최신 항목 확인
    const latestItem = getLatestItem();
    if (!latestItem) {
      console.log("⚠️ local-info.json에 데이터가 없습니다.");
      return;
    }

    const itemName = latestItem.title || latestItem.name || "";
    console.log(`📋 최신 항목: ${itemName}`);

    if (isAlreadyWritten(itemName)) {
      console.log("이미 작성된 글입니다");
      return;
    }

    // 2단계: Gemini로 블로그 글 생성
    const geminiResponse = await generateBlogPost(latestItem);

    // 3단계: 파일 저장
    const { filename, filePath } = savePost(geminiResponse);
    console.log(`✅ 블로그 글 생성 완료!`);
    console.log(`📄 파일명: ${filename}.md`);
    console.log(`📂 경로: ${filePath}`);
  } catch (error) {
    console.error("❌ 오류 발생:", error.message);
    console.log("기존 파일을 유지합니다.");
    process.exit(1);
  }
}

main();
