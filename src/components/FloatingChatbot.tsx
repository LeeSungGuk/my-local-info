"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

type ChatItem = {
  question: string;
  answer: string;
};

type ChatMessage = {
  id: number;
  role: "user" | "bot";
  text: string;
};

type AdminChatMessage = {
  id?: string | number;
  sender?: string;
  text?: string;
  message?: string;
  content?: string;
};

type FloatingChatbotProps = {
  items: ChatItem[];
};

export default function FloatingChatbot({ items }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHumanMode, setIsHumanMode] = useState(false);
  const nextId = useRef(1);
  const seenAdminMessageIds = useRef(new Set<string>());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isHumanMode) {
      return;
    }

    const pollAdminMessages = async () => {
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
        const adminMessages = rawMessages
          .filter((message: AdminChatMessage) => message.sender === "admin")
          .map((message: AdminChatMessage, index: number) => {
            const text = message.text || message.message || message.content || "";
            const id = String(message.id ?? `${text}-${index}`);

            return {
              id,
              text,
            };
          })
          .filter((message: { id: string; text: string }) => {
            return message.text && !seenAdminMessageIds.current.has(message.id);
          });

        if (adminMessages.length === 0) {
          return;
        }

        adminMessages.forEach((message: { id: string }) => {
          seenAdminMessageIds.current.add(message.id);
        });

        setMessages((currentMessages) => [
          ...currentMessages,
          ...adminMessages.map((message: { text: string }) => ({
            id: nextId.current++,
            role: "bot" as const,
            text: message.text,
          })),
        ]);
      } catch {
        // Polling failures are ignored so the chat UI stays usable.
      }
    };

    pollAdminMessages();
    const intervalId = window.setInterval(pollAdminMessages, 2000);

    return () => window.clearInterval(intervalId);
  }, [isHumanMode]);

  const handleHumanModeClick = () => {
    setIsHumanMode(true);
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: nextId.current++,
        role: "bot",
        text: "상담원 연결을 요청했습니다. 메시지를 남겨주시면 확인 후 답변드리겠습니다.",
      },
    ]);
  };

  const handleQuestionClick = (item: ChatItem) => {
    if (isHumanMode) {
      return;
    }

    const userMessage: ChatMessage = {
      id: nextId.current++,
      role: "user",
      text: item.question,
    };
    const botMessage: ChatMessage = {
      id: nextId.current++,
      role: "bot",
      text: item.answer,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      botMessage,
    ]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const question = inputValue.trim();

    if (!question || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: nextId.current++,
      role: "user",
      text: question,
    };

    setInputValue("");
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(isHumanMode ? "/api/chat-human" : "/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isHumanMode ? { sender: "user", message: question } : { question },
        ),
      });

      if (isHumanMode) {
        return;
      }

      const data = await response.json();
      const answer =
        response.ok && typeof data.answer === "string"
          ? data.answer
          : "AI 답변을 불러오지 못했습니다.";

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: nextId.current++,
          role: "bot",
          text: answer,
        },
      ]);
    } catch {
      if (isHumanMode) {
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: nextId.current++,
            role: "bot",
            text: "메시지를 전송하지 못했습니다. 잠시 후 다시 시도해주세요.",
          },
        ]);

        return;
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: nextId.current++,
          role: "bot",
          text: "AI 답변을 불러오지 못했습니다.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-x-4 bottom-4 z-[70] sm:inset-x-auto sm:right-6 sm:bottom-6">
      <section
        aria-label="AI 상담 채팅창"
        className={[
          "fixed inset-0 flex h-dvh w-screen flex-col overflow-hidden bg-white shadow-2xl transition-all duration-300 ease-out sm:inset-auto sm:right-6 sm:bottom-24 sm:h-[500px] sm:w-[360px] sm:rounded-2xl sm:border sm:border-slate-200",
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0",
        ].join(" ")}
      >
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              {isHumanMode ? "상담원 대기" : "AI 상담원"}
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {isHumanMode ? "상담원 연결 대기 중" : "온라인"}
            </p>
          </div>
          <button
            type="button"
            aria-label="채팅창 닫기"
            onClick={() => setIsOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-100 px-4 py-5">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={[
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                ].join(" ")}
              >
                <p
                  className={[
                    "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                    message.role === "user"
                      ? "rounded-tr-md bg-blue-600 text-white"
                      : "rounded-tl-md bg-white text-slate-800",
                  ].join(" ")}
                >
                  {message.text}
                </p>
              </div>
            ))}
            {isLoading ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white p-3 pb-24 sm:pb-3">
          <div className="grid gap-2">
            {isHumanMode
              ? null
              : items.map((item) => (
                  <button
                    key={item.question}
                    type="button"
                    onClick={() => handleQuestionClick(item)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {item.question}
                  </button>
                ))}
          </div>
          <button
            type="button"
            onClick={handleHumanModeClick}
            disabled={isHumanMode}
            className="mt-3 w-full rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-default disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
          >
            {isHumanMode ? "상담원 연결 대기 중" : "상담원 연결"}
          </button>
          <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder={
                isHumanMode
                  ? "상담원에게 보낼 메시지"
                  : "직접 질문을 입력하세요"
              }
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              aria-label="질문 전송"
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
        </div>
      </section>

      <button
        type="button"
        aria-label={isOpen ? "채팅창 닫기" : "채팅창 열기"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="ml-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
      >
        <svg
          aria-hidden="true"
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5a8.5 8.5 0 0 1 17 0Z" />
          <path d="M9 10h.01" />
          <path d="M12 10h.01" />
          <path d="M15 10h.01" />
        </svg>
      </button>
    </div>
  );
}
