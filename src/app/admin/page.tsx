"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  sender: "user" | "admin";
  text: string;
};

type RawChatMessage = {
  id?: string | number;
  sender?: string;
  text?: string;
  message?: string;
  content?: string;
};

const adminPassword = "admin1234";

function normalizeMessages(rawMessages: RawChatMessage[]) {
  return rawMessages
    .filter((message) => message.sender === "user" || message.sender === "admin")
    .map((message, index) => {
      const text = message.text || message.message || message.content || "";
      const id = String(message.id ?? `${message.sender}-${text}-${index}`);

      return {
        id,
        sender: message.sender as "user" | "admin",
        text,
      };
    })
    .filter((message) => message.text);
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const seenMessageIds = useRef(new Set<string>());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const pollMessages = async () => {
      try {
        const response = await fetch("/api/chat-poll");

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const rawMessages = Array.isArray(data.messages)
          ? data.messages
          : Array.isArray(data)
            ? data
            : [];
        const newMessages = normalizeMessages(rawMessages).filter((message) => {
          return !seenMessageIds.current.has(message.id);
        });

        if (newMessages.length === 0) {
          return;
        }

        newMessages.forEach((message) => seenMessageIds.current.add(message.id));
        setMessages((currentMessages) => [...currentMessages, ...newMessages]);
      } catch {
        // Polling failures are ignored so the page can keep retrying.
      }
    };

    pollMessages();
    const intervalId = window.setInterval(pollMessages, 2000);

    return () => window.clearInterval(intervalId);
  }, [isAuthenticated]);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password === adminPassword) {
      setIsAuthenticated(true);
      setAuthError("");
      return;
    }

    setAuthError("비밀번호가 올바르지 않습니다.");
  };

  const handleReplySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = reply.trim();

    if (!message || isSending) {
      return;
    }

    const localMessage: ChatMessage = {
      id: `admin-local-${Date.now()}`,
      sender: "admin",
      text: message,
    };

    setReply("");
    setIsSending(true);
    seenMessageIds.current.add(localMessage.id);
    setMessages((currentMessages) => [...currentMessages, localMessage]);

    try {
      await fetch("/api/chat-human", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: "admin",
          message,
        }),
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-12 sm:px-6">
        <section className="mx-auto flex min-h-[70vh] max-w-md items-center">
          <form
            onSubmit={handleLogin}
            className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h1 className="text-2xl font-bold text-slate-950">관리자 상담</h1>
            <p className="mt-2 text-sm text-slate-500">
              상담 내역을 확인하려면 비밀번호를 입력하세요.
            </p>
            <label className="mt-6 block text-sm font-semibold text-slate-700">
              비밀번호
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </label>
            {authError ? (
              <p className="mt-3 text-sm font-medium text-red-600">{authError}</p>
            ) : null}
            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              접속하기
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <section className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <header className="border-b border-slate-200 bg-white px-5 py-4">
          <h1 className="text-lg font-bold text-slate-950">관리자 상담</h1>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            방문자 메시지 확인 중
          </p>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-100 px-4 py-5">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={[
                  "flex",
                  message.sender === "user" ? "justify-end" : "justify-start",
                ].join(" ")}
              >
                <p
                  className={[
                    "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                    message.sender === "user"
                      ? "rounded-tr-md bg-blue-600 text-white"
                      : "rounded-tl-md bg-white text-slate-800",
                  ].join(" ")}
                >
                  {message.text}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form
          onSubmit={handleReplySubmit}
          className="flex gap-2 border-t border-slate-200 bg-white p-3"
        >
          <input
            type="text"
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder="방문자에게 답장하기"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!reply.trim() || isSending}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="답장 전송"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </form>
      </section>
    </main>
  );
}
