"use client";

import { useState } from "react";
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
          messages: [...messages, { role: "user", content: text }],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "The assistant is temporarily unavailable.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: result.reply || "Sorry, I couldn't process that. Please try again.",
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
    <div className="fixed bottom-24 right-4 z-50">
      {open && (
        <div className="mb-3 flex h-[430px] w-[min(340px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-800 to-purple-600 p-4 text-white">
            <div>
              <p className="font-bold">✦ DollarFetch AI</p>
              <p className="text-xs text-purple-100">Activation Support</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-xl">
              ×
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-purple-50 p-3">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`max-w-[90%] whitespace-pre-wrap rounded-xl p-3 text-sm ${
                  item.role === "user"
                    ? "ml-auto bg-purple-700 text-white"
                    : "bg-white text-gray-800 shadow-sm"
                }`}
              >
                {item.content}
              </div>
            ))}

            {loading && (
              <p className="text-xs text-gray-500">Assistant is typing...</p>
            )}
          </div>

          <div className="border-t bg-white p-3">
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendMessage();
                }}
                placeholder="Ask about activation..."
                className="min-w-0 flex-1 rounded-full border px-3 py-2 text-sm outline-none focus:border-purple-600"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className="rounded-full bg-purple-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-gray-500">
              Never share your M-PESA PIN, OTP or password.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="rounded-full bg-gradient-to-r from-purple-800 to-purple-600 px-5 py-3 font-bold text-white shadow-lg"
      >
        ✦ Ask DollarFetch AI
      </button>
    </div>
  );
}
