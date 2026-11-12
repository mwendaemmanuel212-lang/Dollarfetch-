
"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ActivationAssistantPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! 👋 Welcome to DollarFetch AI Support. I can help you with activation, payments, referrals and account questions. Your activation fee is $0.76 USD. How can I help you today?",
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = message.trim();

    if (!text || loading) return;

    const updatedMessages = [
      ...messages,
      { role: "user" as const, content: text },
    ];

    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      const token = data.session?.access_token;

      if (!token) {
        throw new Error("Please log in again to use DollarFetch AI.");
      }

      const response = await fetch("/api/activation-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const responseText = await response.text();

      let result: {
        reply?: string;
        error?: string;
      };

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Server returned an invalid response (HTTP ${response.status}). Please check the Cloudflare deployment and logs.`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.error || `Assistant error (HTTP ${response.status}).`
        );
      }

      if (!result.reply || typeof result.reply !== "string") {
        throw new Error(
          "The AI returned an empty reply. Please try again."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: result.reply!,
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
    <main className="fixed inset-0 z-[200] flex h-[100dvh] flex-col overflow-hidden bg-white text-gray-900">

      <header className="flex shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-4 py-4 shadow-sm">
        <button
          onClick={() => {
            window.location.href = "/dashboard";
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-700"
          aria-label="Back to dashboard"
        >
          ‹
        </button>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-100 text-2xl text-purple-800">
          ✦
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-gray-900">
            DollarFetch AI
          </h1>
          <p className="text-xs text-green-600">
            ● Activation Support Assistant
          </p>
        </div>

        <div className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
          AI SUPPORT
        </div>
      </header>

      <section className="shrink-0 border-b border-gray-100 bg-white px-4 py-4 text-center">
        <h2 className="text-sm font-bold text-gray-800">
          How can we help you?
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Ask anything about your DollarFetch account.
        </p>
      </section>

      <section className="flex-1 space-y-5 overflow-y-auto bg-white px-4 py-5">
        <div className="text-center">
          <span className="rounded-full bg-gray-100 px-4 py-2 text-[11px] text-gray-500">
            Your private support conversation
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
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-800">
                ✦
              </div>
            )}

            <div
              className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
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
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-800">
              ✦
            </div>

            <div className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-500">
              DollarFetch AI is typing...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </section>

      <footer className="shrink-0 border-t border-gray-100 bg-white px-3 pt-3 pb-[max(14px,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-purple-200 bg-gray-50 p-2 focus-within:border-purple-500">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Write your message..."
            rows={1}
            className="max-h-28 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-2 py-3 text-sm text-gray-800 outline-none"
          />

          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-700 text-xl font-bold text-white disabled:opacity-40"
            aria-label="Send message"
          >
            ↑
          </button>
        </div>

        <p className="mt-2 text-center text-[10px] text-gray-400">
          Never share your M-PESA PIN, OTP or password.
        </p>
      </footer>
    </main>
  );
          }
