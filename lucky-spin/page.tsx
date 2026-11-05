
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const prizes = [
  { amount: 0.50, color: "#2563eb" },
  { amount: 1.00, color: "#7c3aed" },
  { amount: 2.00, color: "#0891b2" },
  { amount: 5.00, color: "#d97706" },
  { amount: 10.00, color: "#dc2626" },
];

export default function LuckySpin() {
  const [activated, setActivated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("");
  const [rotation, setRotation] = useState(0);
  const [lastSpin, setLastSpin] = useState<number | null>(null);

  useEffect(() => {
    async function checkMember() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please log in first.");
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("activation_requests")
        .select("id")
        .eq("user_id", user.id)
        .ilike("status", "approved")
        .limit(1);

      setActivated(!!data?.length);

      const saved = localStorage.getItem(
        "dollarfetch_last_spin_" + user.id
      );

      if (saved) setLastSpin(Number(saved));
      setLoading(false);
    }

    checkMember();
  }, []);

  const canSpin =
    lastSpin === null ||
    Date.now() - lastSpin >= 86400000;

  function spin() {
    if (!activated || !canSpin || spinning) return;

    setSpinning(true);
    setMessage("");

    const selected = Math.floor(Math.random() * prizes.length);
    const reward = prizes[selected].amount;

    setRotation(rotation + 1800 + selected * 72);

    setTimeout(() => {
      setMessage(
        "You won $" + reward.toFixed(2) +
        "! Reward crediting will be enabled after secure wallet integration."
      );
      setSpinning(false);
    }, 4000);
  }

  if (loading) {
    return <main className="p-8 text-center">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-700 text-white p-5">
      <div className="max-w-md mx-auto text-center pt-8">
        <div className="text-5xl">🎡</div>
        <h1 className="text-3xl font-extrabold mt-3">
          DOLLARFETCH
        </h1>
        <h2 className="text-2xl font-bold mt-3">
          Lucky Spin
        </h2>
        <p className="text-blue-200 mt-2">
          One free spin every 24 hours!
        </p>

        {!activated ? (
          <div className="bg-white text-blue-950 rounded-2xl p-6 mt-8">
            <div className="text-4xl">🔒</div>
            <h3 className="font-bold text-xl mt-3">
              Account Not Activated
            </h3>
            <p className="mt-2">
              Activate your account to unlock Lucky Spin.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white text-blue-950 rounded-2xl p-5 mt-8">
              <div
                className="relative w-64 h-64 mx-auto rounded-full border-8 border-yellow-400 overflow-hidden"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning
                    ? "transform 4s cubic-bezier(.12,.8,.2,1)"
                    : "none",
                  background: `conic-gradient(${prizes.map(
                    (p, i) =>
                      `${p.color} ${i * 72}deg ${(i + 1) * 72}deg`
                  ).join(",")})`
                }}
              >
                {prizes.map((p, i) => (
                  <div
                    key={p.amount}
                    className="absolute inset-0 flex justify-center pt-5 text-white font-bold"
                    style={{ transform: `rotate(${i * 72 + 36}deg)` }}
                  >
                    ${p.amount.toFixed(2)}
                  </div>
                ))}
              </div>

              <div className="text-3xl mt-3">👇</div>

              <button
                onClick={spin}
                disabled={!canSpin || spinning}
                className="w-full rounded-xl bg-blue-700 text-white font-extrabold py-4 mt-2 disabled:bg-gray-400"
              >
                {spinning ? "SPINNING..." :
                  canSpin ? "🎡 SPIN NOW" : "COME BACK TOMORROW"}
              </button>

              <p className="text-sm text-gray-500 mt-3">
                One free spin every 24 hours.
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 mt-5">
              <h3 className="font-bold mb-3">AVAILABLE PRIZES</h3>
              {prizes.map(p => (
                <div key={p.amount} className="p-2">
                  ${p.amount.toFixed(2)}
                </div>
              ))}
              <p className="text-xs text-blue-200">
                $10 jackpot is rare.
              </p>
            </div>

            {message && (
              <div className="bg-white text-blue-950 rounded-xl p-4 mt-5">
                {message}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
                    }
