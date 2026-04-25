export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const sender = url.searchParams.get("sender");
  const list = await env.CHAT_KV.list();
  const messages = [];

  for (const key of list.keys) {
    const value = await env.CHAT_KV.get(key.name);

    if (!value) {
      continue;
    }

    const message = JSON.parse(value);

    if (sender && message.sender !== sender) {
      continue;
    }

    messages.push({
      id: key.name,
      ...message,
    });
  }

  messages.sort((a, b) => a.timestamp - b.timestamp);

  return Response.json({ messages });
}
