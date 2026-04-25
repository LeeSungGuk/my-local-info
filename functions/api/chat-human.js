export async function onRequestPost({ request, env }) {
  const { message, sender } = await request.json();
  const timestamp = Date.now();
  const key = `msg_${timestamp}`;

  await env.CHAT_KV.put(
    key,
    JSON.stringify({
      message,
      sender,
      timestamp,
    }),
  );

  return Response.json({ ok: true });
}
