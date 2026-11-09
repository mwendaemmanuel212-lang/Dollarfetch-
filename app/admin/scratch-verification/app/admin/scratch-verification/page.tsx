
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ScratchCard = {
  card_id: string;
  referral_id: string;
  referrer_user_id: string;
  referrer_email: string | null;
  referrer_name: string | null;
  referred_user_id: string;
  referred_email: string | null;
  referred_name: string | null;
  card_status: string;
  created_at: string;
};

export default function ScratchVerificationPage() {
  const [cards, setCards] = useState<ScratchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState("");

  const loadCards = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase.rpc(
      "admin_list_scratch_verifications"
    );

    if (error) {
      setError(error.message);
      setCards([]);
    } else {
      setCards((data || []) as ScratchCard[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  async function reviewCard(cardId: string, decision: "approve" | "reject") {
    const message =
      decision === "approve"
        ? "Approve this referral and unlock one scratch card?"
        : "Reject this scratch-card request?";

    if (!window.confirm(message)) return;

    setWorking(cardId);
    setError("");

    const { error } = await supabase.rpc("admin_review_scratch_card", {
      p_card_id: cardId,
      p_decision: decision,
    });

    if (error) {
      setError(error.message);
    } else {
      await loadCards();
    }

    setWorking("");
  }

  const pending = cards.filter((card) => card.card_status === "pending");
  const approved = cards.filter((card) => card.card_status === "available");
  const rejected = cards.filter((card) => card.card_status === "rejected");

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#080d1b",
    color: "#f8fafc",
    padding: "24px 16px",
    fontFamily: "Arial, sans-serif",
  };

  const cardStyle: React.CSSProperties = {
    background: "#111a2e",
    border: "1px solid #26334e",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  };

  const buttonStyle: React.CSSProperties = {
    border: 0,
    borderRadius: 9,
    padding: "11px 16px",
    fontWeight: 700,
    cursor: "pointer",
    color: "#fff",
  };

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <a
          href="/admin"
          style={{
            color: "#c4b5fd",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          ← Back to Admin Panel
        </a>

        <header style={{ marginTop: 28, marginBottom: 24 }}>
          <div style={{ fontSize: 36 }}>🎁</div>
          <h1 style={{ fontSize: 27, margin: "8px 0" }}>
            Scratch Verification
          </h1>
          <p style={{ color: "#aab6cc", lineHeight: 1.6 }}>
            Verify referrals before unlocking members' Scratch & Win cards.
            Each approved verified referral unlocks one card.
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {[
            { label: "Pending", count: pending.length, color: "#fbbf24" },
            { label: "Unlocked", count: approved.length, color: "#34d399" },
            { label: "Rejected", count: rejected.length, color: "#fb7185" },
          ].map((item) => (
            <div key={item.label} style={cardStyle}>
              <div style={{ color: "#aab6cc", fontSize: 13 }}>
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 29,
                  fontWeight: 800,
                  color: item.color,
                  marginTop: 7,
                }}
              >
                {item.count}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div
            style={{
              background: "#451a25",
              border: "1px solid #be123c",
              color: "#fecdd3",
              padding: 14,
              borderRadius: 10,
              marginBottom: 18,
              overflowWrap: "anywhere",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: 19, margin: 0 }}>Referral Requests</h2>
          <button
            onClick={loadCards}
            disabled={loading}
            style={{
              ...buttonStyle,
              background: "#4338ca",
              opacity: loading ? 0.6 : 1,
            }}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={cardStyle}>Loading referral requests...</div>
        ) : pending.length === 0 ? (
          <div style={cardStyle}>
            <div style={{ fontWeight: 700 }}>No pending requests</div>
            <p style={{ color: "#aab6cc", marginBottom: 0 }}>
              New referral verification requests will appear here after a
              referred member completes activation.
            </p>
          </div>
        ) : (
          pending.map((card) => (
            <section key={card.card_id} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                <strong style={{ color: "#f0abfc" }}>
                  Referral verification
                </strong>
                <span
                  style={{
                    color: "#fbbf24",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  PENDING
                </span>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ color: "#aab6cc", fontSize: 12 }}>
                  REFERRING MEMBER
                </div>
                <strong>
                  {card.referrer_name || "Name unavailable"}
                </strong>
                <div style={{ color: "#cbd5e1", fontSize: 13 }}>
                  {card.referrer_email || card.referrer_user_id}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ color: "#aab6cc", fontSize: 12 }}>
                  NEW MEMBER
                </div>
                <strong>
                  {card.referred_name || "Name unavailable"}
                </strong>
                <div style={{ color: "#cbd5e1", fontSize: 13 }}>
                  {card.referred_email || card.referred_user_id}
                </div>
              </div>

              <div
                style={{
                  color: "#8290aa",
                  fontSize: 12,
                  marginBottom: 16,
                }}
              >
                Submitted: {new Date(card.created_at).toLocaleString()}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  disabled={working === card.card_id}
                  onClick={() => reviewCard(card.card_id, "approve")}
                  style={{
                    ...buttonStyle,
                    background: "#059669",
                    opacity: working === card.card_id ? 0.6 : 1,
                  }}
                >
                  {working === card.card_id
                    ? "Processing..."
                    : "Approve & Unlock"}
                </button>

                <button
                  disabled={working === card.card_id}
                  onClick={() => reviewCard(card.card_id, "reject")}
                  style={{
                    ...buttonStyle,
                    background: "#be123c",
                    opacity: working === card.card_id ? 0.6 : 1,
                  }}
                >
                  Reject
                </button>
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
    }
