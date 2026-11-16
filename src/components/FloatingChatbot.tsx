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

type FloatingChatbotProps = {
  items: ChatItem[];
};

export default function FloatingChatbot({ items }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const nextId = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const openButtonRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const closeChatbot = () => {
    const dialog = dialogRef.current;
    if (dialog) {
      if (typeof dialog.hidePopover === "function" && dialog.matches(":popover-open")) {
        dialog.hidePopover();
      } else if (dialog.open) {
        dialog.close();
      }
    }
    setIsOpen(false);
    requestAnimationFrame(() => {
      openButtonRef.current?.focus();
    });
  };

  const openChatbot = () => {
    const dialog = dialogRef.current;
    if (dialog) {
      if (typeof dialog.showPopover === "function") {
        if (!dialog.matches(":popover-open")) {
          dialog.showPopover();
        }
      } else if (!dialog.open) {
        dialog.show();
      }
    }
    setIsOpen(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeChatbot();
      }
    }

    const mobileQuery = window.matchMedia("(max-width: 639px)");
    const landmarks = Array.from(
      document.querySelectorAll<HTMLElement>("body > header, body > main, body > footer"),
    );

    const syncMobileInert = () => {
      const shouldInert = mobileQuery.matches;
      for (const element of landmarks) {
        element.inert = shouldInert;
      }
    };

    syncMobileInert();
    document.addEventListener("keydown", onKeyDown);
    mobileQuery.addEventListener("change", syncMobileInert);

    return () => {
      for (const element of landmarks) {
        element.inert = false;
      }
      document.removeEventListener("keydown", onKeyDown);
      mobileQuery.removeEventListener("change", syncMobileInert);
    };
  }, [isOpen]);

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
    setIsSuggestionOpen(false);
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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

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
      <dialog
        ref={dialogRef}
        id="chatbot-dialog"
        {...({ popover: "manual" } as Record<string, string>)}
        aria-labelledby="chatbot-title"
        className="animate-fade-in fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none flex-col overflow-hidden border-0 bg-white p-0 shadow-2xl open:flex [&:popover-open]:flex sm:inset-auto sm:right-6 sm:bottom-4 sm:h-[456px] sm:w-[332px] sm:rounded-2xl sm:border sm:border-sky-100"
      >
        <header className="flex items-center justify-between border-b border-sky-100 bg-white px-5 py-4">
          <div>
            <h2 id="chatbot-title" className="text-base font-bold text-slate-950">
              서울 정보 도우미
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              공식 정보 기준 안내
            </p>
          </div>
          <button
            type="button"
            aria-label="채팅창 닫기"
            onClick={closeChatbot}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-sky-50 hover:text-slate-900"
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

          <div className="flex-1 overflow-y-auto bg-sky-50/60 px-4 py-5">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-start">
                    <p className="max-w-[84%] rounded-2xl rounded-tl-md bg-white px-4 py-2.5 text-sm leading-relaxed text-slate-800 shadow-sm ring-1 ring-sky-100/70">
                      원하는 조건을 고르거나 직접 질문해 주세요.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    {items.map((item) => (
                      <button
                        key={item.question}
                        type="button"
                        onClick={() => handleQuestionClick(item)}
                        className="w-full rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
                      >
                        {item.question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
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
                      "max-w-[84%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                      message.role === "user"
                        ? "rounded-tr-md bg-sky-600 text-white"
                        : "rounded-tl-md bg-white text-slate-800 ring-1 ring-sky-100/70",
                    ].join(" ")}
                  >
                    {message.text}
                  </p>
                </div>
              ))}
              {isLoading ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm ring-1 ring-sky-100/70">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                  </div>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-sky-100 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-3">
            {messages.length === 0 ? null : (
              <div className="rounded-2xl border border-sky-100 bg-sky-50/80">
                <button
                  type="button"
                  onClick={() => setIsSuggestionOpen((current) => !current)}
                  aria-expanded={isSuggestionOpen}
                  aria-controls="chatbot-suggestions"
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold text-slate-700"
                >
                  <span>추천 질문</span>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    {isSuggestionOpen ? "접기" : "보기"}
                    <svg
                      aria-hidden="true"
                      className={[
                        "h-4 w-4 transition-transform",
                        isSuggestionOpen ? "rotate-180" : "",
                      ].join(" ")}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </button>
                <div
                  id="chatbot-suggestions"
                  hidden={!isSuggestionOpen}
                  className="chatbot-suggestions grid max-h-44 gap-2 overflow-y-auto px-3 pb-3"
                >
                  {items.map((item) => (
                    <button
                      key={item.question}
                      type="button"
                      onClick={() => handleQuestionClick(item)}
                      className="w-full rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
                    >
                      {item.question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
              <label htmlFor="chatbot-question-input" className="sr-only">
                서울 정보 질문 입력
              </label>
              <input
                ref={inputRef}
                id="chatbot-question-input"
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="서울 정보에 대해 질문하세요"
                className="min-w-0 flex-1 rounded-xl border border-sky-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#80573c]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
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
      </dialog>

      {!isOpen ? (
        <button
          ref={openButtonRef}
          type="button"
          aria-label="서울 정보 도우미 열기"
          aria-expanded={isOpen}
          aria-controls="chatbot-dialog"
          onClick={openChatbot}
          className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg shadow-slate-950/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#80573c]"
        >
          <svg
            aria-hidden="true"
            className="h-7 w-7"
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
      ) : null}
    </div>
  );
}
