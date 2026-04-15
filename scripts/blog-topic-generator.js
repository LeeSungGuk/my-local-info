function stripMarkdownCodeFence(value) {
  return String(value || "")
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function parseTopicCandidatesText(value) {
  const normalized = stripMarkdownCodeFence(value);
  const arrayStartIndex = normalized.indexOf("[");
  const arrayEndIndex = normalized.lastIndexOf("]");

  if (arrayStartIndex === -1 || arrayEndIndex === -1 || arrayEndIndex < arrayStartIndex) {
    throw new Error("주제 후보 JSON 배열을 찾지 못했습니다.");
  }

  const jsonText = normalized.slice(arrayStartIndex, arrayEndIndex + 1);
  const parsed = JSON.parse(jsonText);

  if (!Array.isArray(parsed)) {
    throw new Error("주제 후보 응답이 배열이 아닙니다.");
  }

  return parsed;
}

function buildTopicCandidatesPrompt({ count, existingTopics }) {
  const existingTopicSummary = existingTopics
    .map((topic) => ({
      id: topic.id,
      titleHint: topic.titleHint,
      topicCategory: topic.topicCategory,
      places: Array.isArray(topic.places) ? topic.places.slice(0, 3) : [],
    }))
    .slice(-40);

  return `서울 전용 생활형 정보글 주제를 ${count}개 생성해줘.

조건:
- 서울 시민이나 서울 방문자가 실제로 참고할 수 있는 생활형 정보글 주제여야 한다.
- 행사 일정 안내, 축제 홍보, 지원금/혜택 공지형 주제는 금지한다.
- "서울에서 가볼만한 곳", "구별 분위기", "짧은 코스", "실내 대안", "저비용 선택지", "생활 취향별 추천" 같은 정보글에 맞춘다.
- 이미 존재하는 주제와 표현이나 장소 조합이 너무 비슷하면 안 된다.
- 각 항목은 아래 필드를 모두 포함한다.
  - id: 영문 소문자와 하이픈만 사용
  - titleHint
  - topicCategory
  - angle
  - places: 서울 관련 장소 3~5개
  - tags: 3~5개
- Markdown 설명 없이 JSON 배열만 출력한다.

이미 존재하는 최근 주제:
${JSON.stringify(existingTopicSummary, null, 2)}`;
}

async function generateTopicCandidates({
  apiKey,
  model,
  count,
  existingTopics,
  fetchImpl,
}) {
  const prompt = buildTopicCandidatesPrompt({ count, existingTopics });
  const response = await fetchImpl(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API 오류: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!text) {
    throw new Error("Gemini 주제 응답이 비어있습니다.");
  }

  return parseTopicCandidatesText(text);
}

module.exports = {
  buildTopicCandidatesPrompt,
  generateTopicCandidates,
  parseTopicCandidatesText,
};
