"use client";

import { useEffect, useState } from "react";

export default function InvitePage() {
  const [ref, setRef] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("ref") || "";
    setRef(code);

    const base = window.location.origin;
    setInviteUrl(
      `${base}/invite${code ? `?ref=${encodeURIComponent(code)}` : ""}`
    );
    setJoinUrl(
      `${base}/register${code ? `?ref=${encodeURIComponent(code)}` : ""}`
    );
  }, []);

  async function shareInvite() {
    if (!inviteUrl) return;

    if (navigator.share) {
      await navigator.share({
        title: "Join DollarFetch",
        text: "Join DollarFetch and discover ways to earn by completing available tasks and offers.",
        url: inviteUrl,
      });
    } else {
      await navigator.clipboard.writeText(inviteUrl);
      alert("Invitation link copied!");
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #16052f, #351064, #090316)",
      color: "white",
      padding: "30px 16px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 460,
        textAlign: "center",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: 24,
        padding: "28px 20px",
        boxShadow: "0 15px 45px rgba(0,0,0,0.3)"
      }}>
        <img
          src="/icon-512.png"
          alt="DollarFetch logo"
          style={{
            width: 105,
            height: 105,
            objectFit: "contain",
            borderRadius: 22,
            marginBottom: 12
          }}
        />

        <h1 style={{
          fontSize: 34,
          margin: "5px 0",
          fontWeight: 900,
          color: "#d9b4ff"
        }}>
          DollarFetch
        </h1>

        <p style={{ color: "#d8c5ed", marginTop: 4 }}>
          Powered by BWK Solutions
        </p>

        <div style={{
          background: "rgba(168,85,247,0.18)",
          borderRadius: 16,
          padding: 18,
          marginTop: 22
        }}>
          <h2 style={{ fontSize: 23, margin: "0 0 12px" }}>
            Welcome to DollarFetch!
          </h2>

          <p style={{ lineHeight: 1.7, color: "#eee2ff", margin: 0 }}>
            Join our community and discover opportunities to earn by
            completing available tasks and offers. Your rewards depend
            on eligible activities, verification and applicable terms.
          </p>
        </div>

        {ref && (
          <div style={{
            marginTop: 20,
            padding: 13,
            borderRadius: 12,
            background: "rgba(255,255,255,0.09)"
          }}>
            <p style={{ margin: "0 0 6px", color: "#d8c5ed" }}>
              You were invited with referral code
            </p>
            <strong style={{
              fontSize: 19,
              letterSpacing: 1,
              color: "#e9c8ff"
            }}>
              {ref}
            </strong>
          </div>
        )}

        {inviteUrl && (
          <div style={{
            background: "white",
            borderRadius: 16,
            padding: 14,
            margin: "24px auto 18px",
            width: "fit-content"
          }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(inviteUrl)}`}
              alt="Scan to open DollarFetch invitation"
              style={{
                width: 210,
                height: 210,
                display: "block",
                maxWidth: "100%"
              }}
            />
            <p style={{
              color: "#321052",
              fontSize: 13,
              margin: "10px 0 0"
            }}>
              Scan to open this invitation
            </p>
          </div>
        )}

        <a
          href={joinUrl || "/register"}
          style={{
            display: "block",
            background: "linear-gradient(90deg, #a855f7, #7c3aed)",
            color: "white",
            padding: 16,
            borderRadius: 14,
            fontSize: 18,
            fontWeight: 800,
            textDecoration: "none",
            marginTop: 18
          }}
        >
          JOIN DOLLARFETCH
        </a>

        <button
          type="button"
          onClick={shareInvite}
          style={{
            width: "100%",
            marginTop: 13,
            padding: 15,
            borderRadius: 14,
            border: "1px solid #c084fc",
            background: "transparent",
            color: "white",
            fontSize: 16,
            fontWeight: 700
          }}
        >
          Share Invitation
        </button>

        <p style={{
          color: "#bda9d1",
          fontSize: 12,
          marginTop: 25
        }}>
          Discover. Complete tasks. Earn rewards.
        </p>
      </div>
    </main>
  );
            }
