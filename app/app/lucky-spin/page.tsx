
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SpinResult = {
  prize_amount: number;
  new_balance: number;
  next_spin_at: string;
};

export default function LuckySpinPage() {
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [activated, setActivated] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [lastSpin, setLastSpin] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [prize, setPrize] = useState<number | null>(null);

  async function loadPage() {
    setLoading(true);

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      setMessage("Please log in to continue.");
      setLoading(false);
      return;
    }

    const userId = authData.user.id;

    const { data: activation } = await supabase
      .from("activation_requests")
      .select("status")
      .eq("user_id", userId)
      .ilike("status", "approved")
      .limit(1);

    if (!activation || activation.length === 0) {
      setActivated(false);
      setMessage("Your account must be activated before spinning.");
      setLoading(false);
      return;
    }

    setActivated(true);

    const { data: wallet } = await supabase
      .from("member_wallets")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();

    if (wallet) {
      setBalance(Number(wallet.balance));
    }

    const { data: history } = await supabase
      .from("lucky_spin_history")
      .select("created_at, prize_amount")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (history && history.length > 0) {
      setLastSpin(history[0].created_at);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPage();
  }, []);

  async function playSpin() {
    if (spinning || !activated) return;

    setSpinning(true);
    setMessage("");
    setPrize(null);

    const { data, error } = await supabase.rpc("play_lucky_spin");

    if (error) {
      setMessage(error.message);
      setSpinning(false);
      return;
    }

    const result = (Array.isArray(data) ? data[0] : data) as
      | SpinResult
      | undefined;

    if (!result) {
      setMessage("No spin result was returned. Please try again.");
      setSpinning(false);
      return;
    }

    setPrize(Number(result.prize_amount));
    setBalance(Number(result.new_balance));
    setLastSpin(new Date().toISOString());
    setMessage(
      `Congratulations! You won $${Number(result.prize_amount).toFixed(2)}. Your wallet has been credited.`
    );

    setSpinning(false);
  }

  const canSpin =
    !lastSpin ||
    Date.now() - new Date(lastSpin).getTime() >= 24 * 60 * 60 * 1000;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading Lucky Spin...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white p-5">
      <div className="max-w-md mx-auto text-center pt-10">
        <h1 className="text-3xl font-bold text-yellow-400">
          🎡 Lucky Spin
        </h1>

        <p className="text-blue-100 mt-3">
          Spin once every 24 hours and win real wallet rewards.
        </p>

        <div className="mt-8 rounded-2xl bg-white/10 border border-white/20 p-6">
          <div className="text-7xl mb-5">🎁</div>

          <h2 className="text-xl font-bold">Your Lucky Wheel</h2>

          <p className="text-sm text-blue-100 mt-3">
            Possible prizes: $0.50, $1, $2, $5 and $10.
          </p>

          <button
            onClick={playSpin}
            disabled={!activated || !canSpin || spinning}
            className="mt-7 w-full rounded-xl bg-yellow-400 text-blue-950 font-bold py-4 disabled:opacity-50"
          >
            {spinning
              ? "Processing..."
              : !activated
              ? "Activation Required"
              : !canSpin
              ? "Come Back After 24 Hours"
              : "SPIN NOW"}
          </button>
        </div>

        {prize !== null && (
          <div className="mt-5 text-2xl font-bold text-yellow-300">
            You won ${prize.toFixed(2)}!
          </div>
        )}

        {message && (
          <p className="mt-5 text-sm break-words text-white">
            {message}
          </p>
        )}

        <div className="mt-7 rounded-xl bg-white/10 p-5">
          <p className="text-blue-200">Your USD wallet balance</p>
          <p className="text-3xl font-bold mt-2">
            {balance === null ? "Unavailable" : `$${balance.toFixed(2)}`}
          </p>
        </div>

        {lastSpin && (
          <p className="text-xs text-blue-200 mt-5">
            Last spin: {new Date(lastSpin).toLocaleString()}
          </p>
        )}
      </div>
    </main>
  );
      }
