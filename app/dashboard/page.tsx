
"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Tab =
  | "Dashboard"
  | "Activation"
  | "Deposit"
  | "Withdraw"
  | "Transactions"
  | "Referrals"
  | "Profile";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("2");
  const [paymentMethod, setPaymentMethod] = useState("M-PESA");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const methods = [
    "M-PESA",
    "Postbank",
    "Equity Bank",
    "Binance",
    "Airtel Money",
    "SIM Toolkit",
  ];

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/app/login");
        return;
      }

      setUser(data.user);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/app/login");
  };

  const copyReferral = async () => {
    if (!referralCode) {
      setMessage("Your referral code is not available yet.");
      return;
    }

    await navigator.clipboard.writeText(
      `${window.location.origin}/app/register?ref=${referralCode}`
    );

    setMessage("Referral link copied.");
  };

  const submitActivation = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("activation_requests")
      .insert({
        user_id: user.id,
        amount: Number(amount),
        currency: "USD",
        status: "pending",
      });

    if (error) {
      setMessage("Could not submit your request. Please try again.");
      return;
    }

    setMessage("Request submitted. Wait for administrator verification.");
  };

  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: "#f3f6fc",
      color: "#17243b",
      fontFamily: "Arial, sans-serif",
    },
    header: {
      background: "#102d69",
      color: "#fff",
      padding: "18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "12px",
    },
    logo: {
      fontSize: "23px",
      fontWeight: 800,
      letterSpacing: "1px",
    },
    content: {
      maxWidth: "1100px",
      margin: "auto",
      padding: "20px",
    },
    card: {
      background: "#fff",
      borderRadius: "14px",
      padding: "20px",
      marginBottom: "16px",
      boxShadow: "0 3px 15px rgba(20,40,80,0.06)",
    },
    button: {
      background: "#1769e0",
      color: "#fff",
      border: "none",
      borderRadius: "9px",
      padding: "12px 17px",
      fontWeight: 700,
      cursor: "pointer",
    },
    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #d8e0ed",
      borderRadius: "8px",
      marginTop: "8px",
      marginBottom: "14px",
      boxSizing: "border-box",
    },
  };
  

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.content}>
          <p>Loading your DollarFetch account...</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.logo}>BWK</div>
          <div>DollarFetch</div>
        </div>

        <button style={styles.button} onClick={logout}>
          Log out
        </button>
      </header>

      <div style={styles.content}>
        <h2>Welcome to DollarFetch</h2>
        <p>{user.email}</p>

        <nav
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          {(
            [
              "Dashboard",
              "Activation",
              "Deposit",
              "Withdraw",
              "Transactions",
              "Referrals",
              "Profile",
            ] as Tab[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setMessage("");
              }}
              style={{
                ...styles.button,
                background: activeTab === tab ? "#102d69" : "#dce8fa",
                color: activeTab === tab ? "#fff" : "#17345f",
              }}
            >
              {tab}
            </button>
          ))}
        </nav>

        {message && (
          <div
            style={{
              ...styles.card,
              borderLeft: "4px solid #1769e0",
            }}
          >
            {message}
          </div>
        )}

        {activeTab === "Dashboard" && (
          <>
            <section style={styles.card}>
              <h3>Account Overview</h3>
              <h1>$0.00</h1>
              <p>Demo wallet balance</p>
              <p>Account: Awaiting activation verification</p>
            </section>

            <section style={styles.card}>
              <h3>Quick Actions</h3>
              <button
                style={styles.button}
                onClick={() => setActiveTab("Activation")}
              >
                Activate Account
              </button>{" "}
              <button
                style={styles.button}
                onClick={() => setActiveTab("Deposit")}
              >
                Deposit
              </button>{" "}
              <button
                style={styles.button}
                onClick={() => setActiveTab("Withdraw")}
              >
                Withdraw
              </button>
            </section>

            <section style={styles.card}>
              <h3>Important Notice</h3>
              <p>
                Your account becomes active only after your activation
                payment has been verified by the administrator.
              </p>
            </section>
          </>
        )}

        {activeTab === "Activation" && (
          <section style={styles.card}>
            <h3>Account Activation</h3>
            <h1>$2.00 USD</h1>
            <p>Choose your preferred payment method.</p>

            <label>Payment method</label>
            <select
              style={styles.input}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {methods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>

            <label>Payment amount (USD)</label>
            <input
              style={styles.input}
              type="number"
              min="2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <label>M-PESA phone number (include country code, e.g. +254)</label>
            <input
              style={styles.input}
              placeholder="+2547XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <p>
              Payment processing is not yet connected. Submitting this
              request does not make a payment or activate your account.
            </p>

            <button
              style={styles.button}
              onClick={submitActivation}
              disabled={Number(amount) < 2}
            >
              Submit Activation Request
            </button>
          </section>
        )}

        {activeTab === "Deposit" && (
          <section style={styles.card}>
            <h3>Deposit</h3>
            <p>Deposit options will be available when payment integration is connected.</p>
            <p>No funds are collected or credited through this page yet.</p>
          </section>
        )}

        {activeTab === "Withdraw" && (
          <section style={styles.card}>
            <h3>Withdraw Funds</h3>
            <p>
              Withdrawal requests require administrator authorization.
            </p>
            <p>Withdrawal processing is not yet connected.</p>
          </section>
        )}
            

        {activeTab === "Transactions" && (
          <section style={styles.card}>
            <h3>Transactions</h3>
            <p>No transactions to display yet.</p>
          </section>
        )}

        {activeTab === "Referrals" && (
          <section style={styles.card}>
            <h3>Refer Members</h3>
            <p>Earn $0.50 for each referred member whose activation is verified.</p>

            <label>Your referral code</label>
            <input
              style={styles.input}
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Referral code"
            />

            <button style={styles.button} onClick={copyReferral}>
              Copy Referral Link
            </button>

            <p>Referral rewards are subject to verification.</p>
          </section>
        )}

        {activeTab === "Profile" && (
          <section style={styles.card}>
            <h3>Member Profile</h3>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Account ID:</strong> {user.id}</p>
            <button style={styles.button} onClick={logout}>
              Log Out
            </button>

            {user.email === "mwendaemmanuel212@gmail.com" && (
              <p style={{ marginTop: "18px" }}>
                <a
                  href="/admin"
                  style={{ color: "#1769e0", fontWeight: 700 }}
                >
                  Open Admin Panel
                </a>
              </p>
            )}
          </section>
        )}

        <footer
          style={{
            textAlign: "center",
            color: "#77849a",
            padding: "25px 5px",
            fontSize: "13px",
          }}
        >
          BWK DollarFetch © 2026
        </footer>
      </div>
    </main>
  );
}
