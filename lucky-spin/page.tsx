
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SpinResult = {
  prize_amount: number;
  new_balance: number;
  next_spin_at: string;
};

type SpinHistory = {
  prize_amount: number;
  created_at: string;
};

export default function LuckySpinPage() {
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [activated, setActivated] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<SpinHistory[]>([]);
  const [nextSpin, setNextSpin] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [won, setWon] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  const loadPage = useCallback(async () => {
    setLoading(true);
    setMessage("");

    const { data: auth, error: authError } =
      await supabase.auth.getUser();

    if (authError || !auth.user) {
      setMessage("Please log in to access Lucky Spin.");
      setLoading(false);
      return;
    }

    const userId = auth.user.id;

    const { data: activation, error: activationError } =
      await supabase
        .from("activation_requests")
        .select("status")
        .eq("user_id", userId)
        .ilike("status", "approved")
        .limit(1);

    if (activationError) {
      setMessage("Unable to verify activation. Please try again.");
      setLoading(false);
      return;
    }

    if (!activation || activation.length === 0) {
      setActivated(false);
      setMessage("Your account must be activated before you can spin.");
      setLoading(false);
      return;
    }

    setActivated(true);

    const { data: wallet, error: walletError } = await supabase
      .from("member_wallets")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();

    if (!walletError && wallet) {
      setBalance(Number(wallet.balance));
    }

    const { data: spins, error: historyError } = await supabase
      .from("lucky_spin_history")
      .select("prize_amount, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!historyError && spins) {
      setHistory(spins as SpinHistory[]);

      if (spins.length > 0) {
        const next = new Date(spins[0].created_at).getTime()
          + 24 * 60 * 60 * 1000;
        setNextSpin(new Date(next).toISOString());
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const canSpin =
    !nextSpin || Date.now() >= new Date(nextSpin).getTime();

  async function playSpin() {
    if (spinning || !activated || !canSpin) return;

    setSpinning(true);
    setMessage("");
    setWon(null);

    const { data, error } = await supabase.rpc("play_lucky_spin");

    if (error) {
      setMessage(error.message);
      setSpinning(false);
      return;
    }

    const result = (
      Array.isArray(data) ? data[0] : data
    ) as SpinResult | undefined;

    if (
      !result ||
      typeof result.prize_amount !== "number" ||
      typeof result.new_balance !== "number"
    ) {
      setMessage("The spin result was invalid. Please refresh and check your wallet.");
      setSpinning(false);
      return;
    }

    setRotation((previous) => previous + 1800 + Math.random() * 360);

    setTimeout(async () => {
      setWon(result.prize_amount);
      setBalance(result.new_balance);
      setNextSpin(result.next_spin_at);
      setMessage(
        `Congratulations! You won $${result.prize_amount.toFixed(2)}. Your wallet has been credited.`
      );

      await loadHistoryOnly();

      setSpinning(false);
    }, 2500);
  }

  async function loadHistoryOnly() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const { data } = await supabase
      .from("lucky_spin_history")
      .select("prize_amount, created_at")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) setHistory(data as SpinHistory[]);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-blue-950 text-white">
        Loading Lucky Spin...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white px-4 py-8">
      <div className="mx-auto max-w-lg text-center">
        <a href="/dashboard" className="text-blue-200 text-sm">
          ← Back to Dashboard
        </a>

        <h1 className="mt-7 text-3xl font-extrabold text-yellow-400">
          🎡 Lucky Spin
        </h1>

        <p className="mt-2 text-blue-100">
          Your chance to win real USD wallet rewards.
        </p>

        <div className="mt-8 rounded-3xl border border-white/20 bg-white/10 p-6">
          <div
            className="mx-auto flex h-64 w-64 items-center justify-center rounded-full border-8 border-yellow-400 text-5xl shadow-xl"
            style={{
              background:
                "conic-gradient(#facc15 0deg 72deg,#2563eb 72deg 144deg,#facc15 144deg 216deg,#2563eb 216deg 288deg,#facc15 288deg 360deg)",
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 2.5s ease-out" : "none",
            }}
          >
            <span className="rounded-full bg-blue-950 p-5">🎁</span>
          </div>

          <p className="mt-5 font-semibold text-yellow-300">
            Possible prizes
          </p>

          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {[0.5, 1, 2, 5, 10].map((amount) => (
              <span
                key={amount}
                className="rounded-full bg-blue-800 px-3 py-2 text-sm font-bold"
              >
                ${amount.toFixed(2)}
              </span>
            ))}
          </div>

          <button
            onClick={playSpin}
            disabled={!activated || !canSpin || spinning}
            className="mt-7 w-full rounded-xl bg-yellow-400 px-5 py-4 font-extrabold text-blue-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {spinning
              ? "SPINNING..."
              : !activated
              ? "ACTIVATION REQUIRED"
              : !canSpin
              ? "WAIT 24 HOURS"
              : "SPIN NOW"}
          </button>

          {won !== null && (
            <p className="mt-5 text-2xl font-extrabold text-yellow-300">
              You won ${won.toFixed(2)}!
            </p>
          )}

          {message && (
            <p className="mt-5 break-words text-sm text-white">
              {message}
            </p>
          )}
        </div>

        <div className="mt-6 rounded-2xl bg-white/10 p-5">
          <p className="text-blue-200">Your USD wallet balance</p>
          <p className="mt-2 text-3xl font-bold">
            {balance === null ? "Unavailable" : `$${balance.toFixed(2)}`}
          </p>
        </div>

        {nextSpin && (
          <p className="mt-5 text-sm text-blue-200">
            Next spin available: {new Date(nextSpin).toLocaleString()}
          </p>
        )}

        <div className="mt-7 text-left">
          <h2 className="mb-3 text-xl font-bold">Recent spin history</h2>

          {history.length === 0 ? (
            <p className="text-sm text-blue-200">No spins yet.</p>
          ) : (
            history.map((spin, index) => (
              <div
                key={`${spin.created_at}-${index}`}
                className="mb-2 flex justify-between rounded-xl bg-white/10 p-3"
              >
                <span>${Number(spin.prize_amount).toFixed(2)}</span>
                <span className="text-xs text-blue-200">
                  {new Date(spin.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
      }
