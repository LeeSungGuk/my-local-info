const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
};

function stripMarkdown(value) {
  return String(value || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[\s>*-]*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[*_~>#|]/g, "")
    .replace(/-{3,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return stripMarkdown(value)
    .toLowerCase()
    .split(/[^0-9a-z가-힣]+/)
    .filter((word) => word.length >= 2);
}

function getSearchText(item) {
  return stripMarkdown(
    item.searchText || [item.title, item.summary, item.content].join(" "),
  );
}

function scoreItem(item, questionWords) {
  const searchText = getSearchText(item).toLowerCase();

  return questionWords.reduce((score, word) => {
    if (!searchText.includes(word)) {
      return score;
    }

    const title = stripMarkdown(item.title).toLowerCase();
    const summary = stripMarkdown(item.summary).toLowerCase();
    const titleWeight = title.includes(word) ? 3 : 0;
    const summaryWeight = summary.includes(word) ? 2 : 0;

    return score + 1 + titleWeight + summaryWeight;
  }, 0);
}

async function getRelevantBlogData(request, question) {
  const indexUrl = `${new URL(request.url).origin}/data/search-index.json`;
  const response = await fetch(indexUrl);

  if (!response.ok) {
    return "";
  }

  const searchIndex = await response.json();
  const items = Array.isArray(searchIndex) ? searchIndex : [];
  const questionWords = tokenize(question);

  return items
    .map((item) => ({
      item,
      score: scoreItem(item, questionWords),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ item }, index) => {
      const title = stripMarkdown(item.title);
      const summary = stripMarkdown(item.summary);

      return `${index + 1}. 제목: ${title}\n요약: ${summary}`;
    })
    .join("\n\n");
}

function buildSystemPrompt(blogData) {
  return `You are an AI assistant for a Korean local information blog.
Answer ONLY in Korean. Keep answers to 2-3 sentences maximum.
Do NOT use any markdown symbols (**, *, #, -). Plain text only.
Base your answer ONLY on the following blog data. If not relevant, reply: 해당 내용은 블로그에서 확인이 어렵습니다. 다른 질문을 해주세요.

[블로그 데이터]
${blogData}`;
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const question =
      typeof body.question === "string" ? body.question.trim() : "";

    if (!question) {
      return Response.json(
        { error: "질문을 입력해 주세요." },
        { status: 400, headers: jsonHeaders },
      );
    }

    const blogData = await getRelevantBlogData(request, question);
    const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(blogData),
        },
        {
          role: "user",
          content: question,
        },
      ],
      max_tokens: 150,
    });

    const answer =
      typeof result.response === "string"
        ? stripMarkdown(result.response)
        : "답변을 생성하지 못했습니다.";

    return Response.json({ answer }, { headers: jsonHeaders });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "AI 답변을 불러오지 못했습니다." },
      { status: 500, headers: jsonHeaders },
    );
  }
}
