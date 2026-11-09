
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SpinResult = {
  prize_amount: number | string;
  new_balance: number | string;
  next_spin_at: string;
};

type SpinHistory = {
  prize_amount: number;
  created_at: string;
};

const rewards = [
  0, 0.5, 0, 1,
  0, 0.5, 0, 2,
  0, 0.5, 0, 1,
  0, 5, 0, 10,
  4.5,
];

export default function LuckySpinPage() {
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [activated, setActivated] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<SpinHistory[]>([]);
  const [nextSpin, setNextSpin] = useState<string | null>(null);
  const [extraSpins, setExtraSpins] = useState(0);
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
        .eq("user_id", userId);

    if (activationError) {
      setMessage("Unable to verify activation. Please try again.");
      setLoading(false);
      return;
    }

    const statuses = (activation || []).map((item) =>
      String(item.status || "").trim().toLowerCase()
    );

    const isActive =
      statuses.includes("active") || statuses.includes("approved");

    setActivated(isActive);

    if (!isActive) {
      setMessage("Your account must be activated before you can spin.");
      setLoading(false);
      return;
    }

    const { data: wallet, error: walletError } = await supabase
      .from("member_wallets")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();

    if (walletError) {
      setMessage(`Wallet error: ${walletError.message}`);
    } else if (wallet) {
      setBalance(Number(wallet.balance));
    } else {
      setBalance(0);
      setMessage("No wallet record found.");
    }

    const { data: spins, error: historyError } = await supabase
      .from("lucky_spin_history")
      .select("prize_amount, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!historyError && spins) {
      setHistory(
        spins.map((spin) => ({
          prize_amount: Number(spin.prize_amount),
          created_at: spin.created_at,
        }))
      );

      if (spins.length > 0) {
        const next =
          new Date(spins[0].created_at).getTime() +
          24 * 60 * 60 * 1000;

        setNextSpin(new Date(next).toISOString());
      } else {
        setNextSpin(null);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const canSpin =
    !nextSpin || Date.now() >= new Date(nextSpin).getTime();

  async function loadHistoryOnly() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const { data } = await supabase
      .from("lucky_spin_history")
      .select("prize_amount, created_at")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      setHistory(
        data.map((spin) => ({
          prize_amount: Number(spin.prize_amount),
          created_at: spin.created_at,
        }))
      );
    }
  }

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

    const prize = Number(result?.prize_amount);
    const newBalance = Number(result?.new_balance);

    if (
      !result ||
      !Number.isFinite(prize) ||
      !Number.isFinite(newBalance) ||
      !result.next_spin_at
    ) {
      setMessage("Invalid spin result. Please refresh and check your wallet.");
      setSpinning(false);
      return;
    }

    const matchingIndexes = rewards
  .map((amount, index) => amount === prize ? index : -1)
  .filter((index) => index !== -1);

if (matchingIndexes.length === 0) {
  setMessage("The server returned an unexpected prize.");
  setSpinning(false);
  return;
}

const targetIndex =
  matchingIndexes[
    Math.floor(Math.random() * matchingIndexes.length)
  ];

const sliceAngle = 360 / rewards.length;
const sliceCenter = targetIndex * sliceAngle + sliceAngle / 2;

setRotation((previous) => {
  const alignment =
    (360 - sliceCenter - (previous % 360) + 360) % 360;

  return previous + 1800 + alignment;
});




    setTimeout(async () => {
      setWon(prize);
      setBalance(newBalance);
      setNextSpin(result.next_spin_at);

      setMessage(
        prize === 0
          ? "No reward this time. Your next free spin is available in 24 hours."
          : `You won $${prize.toFixed(2)}! Your wallet has been credited.`
      );

      await loadHistoryOnly();
      setSpinning(false);
    }, 2600);
  }

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #071b45, #020617)",
    color: "white",
    padding: "24px 16px 40px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: "430px",
    margin: "28px auto",
    padding: "22px 16px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.09)",
    border: "1px solid rgba(255,255,255,0.2)",
    textAlign: "center",
    boxSizing: "border-box",
  };

  if (loading) {
    return (
      <main style={{
        ...pageStyle,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        Loading Lucky Spin...
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <a
          href="/dashboard"
          style={{ color: "#bfdbfe", textDecoration: "none" }}
        >
          ← Back to Dashboard
        </a>

        <h1 style={{
          textAlign: "center",
          fontSize: "34px",
          fontWeight: 900,
          color: "#facc15",
          marginTop: "28px",
        }}>
          🎡 Lucky Spin
        </h1>

        <p style={{
          textAlign: "center",
          color: "#dbeafe",
          fontSize: "15px",
        }}>
          One free spin every 24 hours.
        </p>

        <section style={cardStyle}>
          <div style={{
            position: "relative",
            width: "min(288px, calc(100vw - 72px))",
            aspectRatio: "1 / 1",
            margin: "28px auto 20px",
          }}>
            <div style={{
              position: "absolute",
              top: "-23px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 5,
              fontSize: "34px",
              lineHeight: 1,
            }}>
              🔻
            </div>

            <div style={{
              position: "relative",
              width: "100%",
              height: "100%",
              boxSizing: "border-box",
              borderRadius: "50%",
              border: "8px solid #facc15",
              background: `conic-gradient(${rewards.map((amount, index) =>
                `${index % 2 === 0 ? "#facc15" : "#2563eb"} ${index * (360 / rewards.length)}deg ${(index + 1) * (360 / rewards.length)}deg`
              ).join(",")})`,
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? "transform 2.5s cubic-bezier(0.12, 0.65, 0.15, 1)"
                : "none",
              boxShadow: "0 0 18px rgba(0,0,0,0.5)",
              overflow: "hidden",
            }}>
              {rewards.map((amount, index) => {
                const sliceAngle = 360 / rewards.length;
const angle = index * sliceAngle + sliceAngle / 2;

                return (
                  <span
                    key={index}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      fontSize: "11px",
                      fontWeight: 900,
                      color: index % 2 === 0 ? "#172554" : "#ffffff",
                      whiteSpace: "nowrap",
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${288 * 0.36}px) rotate(-${angle}deg)`,
                    }}
                  >
                    ${amount.toFixed(2)}
                  </span>
                );
              })}

              <div style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "58px",
                height: "58px",
                borderRadius: "50%",
                border: "5px solid #facc15",
                background: "#172554",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "27px",
                boxSizing: "border-box",
              }}>
                🎁
              </div>
            </div>
          </div>

          <h2 style={{
            color: "#facc15",
            fontSize: "19px",
            fontWeight: 800,
            margin: "22px 0 12px",
          }}>
            Possible prizes
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "9px",
          }}>
            {[
              { amount: 0, count: 8 },
              { amount: 0.5, count: 3 },
              { amount: 1, count: 2 },
              { amount: 2, count: 1 },
              { amount: 5, count: 1 },
              { amount: 10, count: 1 },
            ].map((prize) => (
              <div
                key={prize.amount}
                style={{
                  background: "#1e40af",
                  borderRadius: "10px",
                  padding: "12px 5px",
                  fontWeight: 800,
                }}
              >
                ${prize.amount.toFixed(2)}
                <div style={{
                  fontSize: "12px",
                  color: "#bfdbfe",
                  marginTop: "4px",
                }}>
                  {prize.count} of 16 slices
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={playSpin}
            disabled={!activated || !canSpin || spinning}
            style={{
              width: "100%",
              marginTop: "24px",
              padding: "16px",
              border: "none",
              borderRadius: "12px",
              background: "#facc15",
              color: "#172554",
              fontSize: "16px",
              fontWeight: 900,
              opacity: !activated || !canSpin || spinning ? 0.5 : 1,
              cursor: !activated || !canSpin || spinning
                ? "not-allowed"
                : "pointer",
            }}
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
            <p style={{
              marginTop: "20px",
              fontSize: "23px",
              fontWeight: 900,
              color: "#facc15",
            }}>
              {won === 0 ? "No reward this time" : `You won $${won.toFixed(2)}!`}
            </p>
          )}

          {message && (
            <p style={{
              marginTop: "16px",
              color: "#ffffff",
              fontSize: "14px",
              overflowWrap: "anywhere",
            }}>
              {message}
            </p>
          )}
        </section>

        <section style={{
          ...cardStyle,
          textAlign: "left",
          marginTop: "18px",
        }}>
          <p style={{ color: "#bfdbfe", margin: 0 }}>
            Your USD wallet balance
          </p>
          <p style={{
            fontSize: "30px",
            fontWeight: 900,
            margin: "10px 0 0",
          }}>
            {balance === null ? "Unavailable" : `$${balance.toFixed(2)}`}
          </p>
        </section>

        {nextSpin && (
          <p style={{
            textAlign: "center",
            color: "#bfdbfe",
            fontSize: "14px",
          }}>
            Next spin available: {new Date(nextSpin).toLocaleString()}
          </p>
        )}

        <section style={{ marginTop: "28px" }}>
          <h2 style={{ fontSize: "23px", fontWeight: 900 }}>
            Recent spin history
          </h2>

          {history.length === 0 ? (
            <p style={{ color: "#bfdbfe" }}>No spins yet.</p>
          ) : (
            history.map((spin, index) => (
              <div
                key={`${spin.created_at}-${index}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  padding: "13px",
                  marginBottom: "8px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.1)",
                }}
              >
                <strong>${spin.prize_amount.toFixed(2)}</strong>
                <span style={{
                  color: "#bfdbfe",
                  fontSize: "12px",
                }}>
                  {new Date(spin.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
            }
