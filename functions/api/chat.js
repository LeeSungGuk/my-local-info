const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
};

const systemPrompt =
  "You are an AI assistant for a Korean local information blog. Answer in Korean.";

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

    const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: question,
        },
      ],
      max_tokens: 300,
    });

    const answer =
      typeof result.response === "string"
        ? result.response
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
