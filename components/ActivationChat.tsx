
"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ActivationChat({
  memberName,
}: {
  memberName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello ${memberName || "there"}! 👋 I'm the DollarFetch Activation Assistant. I can help you with account activation. The one-time activation fee is $0.76 USD. How can I help you today?`,
    },
  ]);

  const conversationEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationEnd.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading, open]);

  async function sendMessage() {
    const text = message.trim();

    if (!text || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", content: text },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        throw new Error("Please log in again to use the assistant.");
      }

      const response = await fetch("/api/activation-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: "user", content: text },
          ],
        }),
      });

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          "The assistant service did not return a valid response. Please try again."
        );
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "The assistant is temporarily unavailable."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            result.reply ||
            "Sorry, I couldn't process that. Please try again.",
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[100] flex h-[100dvh] flex-col bg-white text-gray-900">
          {/* Header */}
          <header className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-purple-900 to-purple-700 px-4 py-4 text-white shadow-md">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-2xl"
            >
              ‹
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-purple-800">
              ✦
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold">
                DollarFetch AI
              </h2>
              <p className="text-xs text-purple-100">
                Activation Support Assistant
              </p>
            </div>

            <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold">
              ONLINE
            </span>
          </header>

          {/* Welcome strip */}
          <div className="border-b border-purple-100 bg-purple-50 px-4 py-3 text-center">
            <p className="text-xs font-semibold text-purple-900">
              Welcome to DollarFetch Support
            </p>
            <p className="mt-1 text-[11px] text-gray-500">
              Ask us anything about activating your account.
            </p>
          </div>

          {/* Conversation */}
          <div className="flex-1 space-y-5 overflow-y-auto bg-white px-4 py-5">
            <div className="text-center">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] text-gray-500">
                Your conversation
              </span>
            </div>

            {messages.map((item, index) => (
              <div
                key={index}
                className={`flex w-full items-end gap-2 ${
                  item.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {item.role === "assistant" && (
                  <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-800">
                    ✦
                  </div>
                )}

                <div
                  className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-[14px] leading-6 shadow-sm ${
                    item.role === "user"
                      ? "rounded-br-md bg-purple-700 text-white"
                      : "rounded-bl-md border border-gray-100 bg-gray-50 text-gray-800"
                  }`}
                >
                  {item.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-800">
                  ✦
                </div>

                <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 text-sm text-gray-500">
                  DollarFetch AI is typing…
                </div>
              </div>
            )}

            <div ref={conversationEnd} />
          </div>

          {/* Message input */}
          <div className="shrink-0 border-t border-gray-100 bg-white px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
            <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-purple-200 bg-gray-50 p-2 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100">
              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Write your message..."
                rows={1}
                className="max-h-28 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />

              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-700 text-lg font-bold text-white shadow-sm disabled:opacity-40"
              >
                ↑
              </button>
            </div>

            <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-gray-400">
              Never share your M-PESA PIN, OTP or password.
            </p>
          </div>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-900 to-purple-600 px-5 py-3 font-bold text-white shadow-xl transition hover:scale-[1.02]"
        >
          <span className="text-lg">✦</span>
          Ask DollarFetch AI
        </button>
      )}
    </>
  );
}
