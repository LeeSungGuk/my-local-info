"use client";

import { useEffect, useRef, useState } from "react";

type ChatItem = {
  question: string;
  answer: string;
};

type ChatMessage = {
  id: number;
  role: "user" | "bot";
  text: string;
};

type FloatingChatbotProps = {
  items: ChatItem[];
};

export default function FloatingChatbot({ items }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const nextId = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleQuestionClick = (item: ChatItem) => {
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
            <h2 className="text-base font-bold text-slate-950">AI 상담원</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              온라인
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
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white p-3 pb-24 sm:pb-3">
          <div className="grid gap-2">
            {items.map((item) => (
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
