
"use client";

import { useRouter } from "next/navigation";

type ActivationChatProps = {
  memberName?: string;
};

export default function ActivationChat({
  memberName,
}: ActivationChatProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/activation-assistant")}
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-700 to-purple-500 px-5 py-4 font-bold text-white shadow-lg transition hover:opacity-90 active:scale-[0.98]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-2xl">
        ✦
      </span>

      <span className="flex flex-col items-start">
        <span className="text-base">Ask AI Assistant</span>
        <span className="text-xs font-normal text-purple-100">
          {memberName
            ? `Hello ${memberName}, get activation support`
            : "Get instant DollarFetch activation support"}
        </span>
      </span>

      <span className="ml-auto text-xl">→</span>
    </button>
  );
}
