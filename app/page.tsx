
"use client";

import { useState } from "react";

export default function Home() {
  const [tab, setTab] = useState("Dashboard");

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f1f5fb",
      fontFamily: "Arial, sans-serif",
      color: "#102b55"
    }}>
      <header style={{
        background: "#073b83",
        color: "white",
        padding: "24px",
        display: "flex",
        alignItems: "center",
        gap: "15px"
      }}>
        <div style={{
          background: "white",
          color: "#0753b8",
          padding: "13px",
          borderRadius: "12px",
          fontWeight: "bold"
        }}>BWK</div>
        <h2>DollarFetch</h2>
      </header>
<div style={{display:"flex", gap:"12px", marginTop:"15px"}}>
  <a href="/register" style={{background:"#0753b8", color:"white", padding:"12px 18px", borderRadius:"8px", textDecoration:"none"}}>Register</a>
  <a href="/login" style={{background:"#073b83", color:"white", padding:"12px 18px", borderRadius:"8px", textDecoration:"none"}}>Login</a>
</div>
      <section style={{ padding: "25px", maxWidth: "900px", margin: "auto" }}>
        <h1>Welcome to DollarFetch</h1>
        <p>Your financial dashboard.</p>

        <div style={{
          background: "#0753b8",
          color: "white",
          padding: "25px",
          borderRadius: "16px",
          marginTop: "25px"
        }}>
          <p>AVAILABLE BALANCE</p>
          <h1>KES 0.00</h1>
          <small>Demonstration balance only</small>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "15px",
          marginTop: "25px"
        }}>
          {["Deposit", "Withdraw", "Transactions", "Profile"].map(item => (
            <button
              key={item}
              onClick={() => setTab(item)}
              style={{
                padding: "22px",
                border: "1px solid #dce5f2",
                borderRadius: "12px",
                background: "white",
                color: "#0753b8",
                fontWeight: "bold",
                fontSize: "16px"
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {tab !== "Dashboard" && (
          <div style={{
            marginTop: "25px",
            background: "white",
            padding: "25px",
            borderRadius: "12px"
          }}>
            <h2>{tab}</h2>
            <p>
              {tab === "Withdraw"
                ? "Withdrawal requests will require administrator authorization before payout."
                : tab === "Deposit"
                ? "M-Pesa STK Push integration will be added later."
                : "Your account information will appear here."}
            </p>
            <button onClick={() => setTab("Dashboard")}>Back to dashboard</button>
          </div>
        )}
      </section>
    </main>
  );
          }
