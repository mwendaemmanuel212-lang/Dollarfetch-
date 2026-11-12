
"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
  role: "user" | "assistant";
  content: string;
  time?: string;
};

export default function ActivationAssistantPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! 👋 Welcome to DollarFetch AI. I can help you with activation, payments, spin rolls, referrals and scratch cards. Your activation fee is $0.76 USD. How can I help you today?",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = message.trim();

    if (!text || loading) return;

    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
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
        throw new Error("Please log in again to use DollarFetch Support.");
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
          `Server returned an invalid response (HTTP ${response.status}). Please try again.`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.error || `Assistant error (HTTP ${response.status}).`
        );
      }

      if (!result.reply || typeof result.reply !== "string") {
        throw new Error("The AI returned an empty reply. Please try again.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: result.reply!,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
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
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="fixed inset-0 z-[200] flex h-[100dvh] flex-col overflow-hidden bg-[#efeae2] text-gray-900">

      <header className="flex shrink-0 items-center gap-3 bg-[#075e54] px-3 py-3 text-white shadow-md">
        <button
          onClick={() => {
            window.location.href = "/dashboard";
          }}
          className="flex h-10 w-9 shrink-0 items-center justify-center rounded-full text-3xl leading-none text-white"
          aria-label="Back to dashboard"
        >
          ‹
        </button>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl font-black text-[#075e54]">
          D
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold text-white">
            DollarFetch AI
          </h1>
          <p className="text-xs text-green-100">
            Online · AI assistant
          </p>
        </div>

        <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold tracking-wide text-white">
          SUPPORT
        </span>
      </header>

      <section
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-4 sm:px-5"
        style={{
          backgroundColor: "#efeae2",
          backgroundImage:
            "radial-gradient(rgba(90,75,55,0.07) 0.8px, transparent 0.8px)",
          backgroundSize: "18px 18px",
        }}
      >
        <div className="self-center rounded-lg bg-white/80 px-3 py-1.5 text-[11px] text-gray-500 shadow-sm">
          Your private DollarFetch conversation
        </div>

        {messages.map((item, index) => (
          <div
            key={index}
            className="flex w-full items-end gap-2"
            style={{
              justifyContent:
                item.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {item.role === "assistant" && (
              <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#075e54] text-xs font-black text-white shadow-sm">
                D
              </div>
            )}

            <div
              className="flex w-fit flex-col rounded-2xl px-3 py-2 shadow-sm"
              style={{
                maxWidth: "82%",
                marginLeft: item.role === "user" ? "auto" : "0",
                marginRight: item.role === "assistant" ? "auto" : "0",
                alignSelf:
                  item.role === "user" ? "flex-end" : "flex-start",
                backgroundColor:
                  item.role === "user" ? "#d9fdd3" : "#ffffff",
                color: item.role === "user" ? "#172b20" : "#333333",
                borderBottomRightRadius:
                  item.role === "user" ? "4px" : "16px",
                borderBottomLeftRadius:
                  item.role === "assistant" ? "4px" : "16px",
              }}
            >
              {item.role === "assistant" && (
                <span className="mb-1 text-[10px] font-bold text-[#075e54]">
                  DollarFetch AI
                </span>
              )}

              <p className="whitespace-pre-wrap break-words text-[14px] leading-[1.55]">
                {item.content}
              </p>

              {item.time && (
                <span className="mt-1 self-end text-[10px] text-gray-500">
                  {item.time}
                </span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div
            className="flex w-full items-end gap-2"
            style={{ justifyContent: "flex-start" }}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#075e54] text-xs font-black text-white">
              D
            </div>

            <div className="mr-auto rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
              <span className="mr-2">DollarFetch AI</span>
              <span className="inline-flex gap-1 align-middle">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:240ms]" />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </section>

      <footer className="shrink-0 border-t border-gray-200 bg-[#f0f2f5] px-3 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <div className="flex min-h-12 flex-1 items-end rounded-3xl bg-white px-4 py-1 shadow-sm">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message"
              rows={1}
              className="max-h-28 min-h-10 min-w-0 flex-1 resize-none bg-transparent py-3 text-sm text-gray-800 outline-none"
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-2xl font-bold text-white shadow-sm disabled:opacity-40"
            aria-label="Send message"
          >
            ↑
          </button>
        </div>

        <p className="mt-2 text-center text-[10px] text-gray-500">
          Never share your M-PESA PIN, OTP or password.
        </p>
      </footer>
    </main>
  );
      }
