
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const methods = [
  {
    id: "M-PESA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg",
    alt: "M-PESA logo"
  },
  {
    id: "Postbank",
    logo: "https://www.google.com/s2/favicons?domain=postbank.co.ke&sz=128",
    alt: "Postbank logo"
  },
  {
    id: "Equity Bank",
    logo: "https://www.google.com/s2/favicons?domain=equitybankgroup.com&sz=128",
    alt: "Equity Bank logo"
  },
  {
    id: "Binance",
    logo: "https://cdn.simpleicons.org/binance/F0B90B",
    alt: "Binance logo"
  },
  {
    id: "Airtel Money",
    logo: "https://www.google.com/s2/favicons?domain=airtelkenya.com&sz=128",
    alt: "Airtel Money logo"
  },
  {
    id: "SIM Toolkit",
    logo: "https://cdn-icons-png.flaticon.com/512/0/191.png",
    alt: "SIM Toolkit icon"
  }
];

export default function Dashboard() {
  const [name, setName] = useState("Member");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("Not provided");
  const [tab, setTab] = useState("Dashboard");

  const [status, setStatus] = useState("pending");
  const [method, setMethod] = useState("M-PESA");
  const [paymentPhone, setPaymentPhone] = useState("");

  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [pendingReferrals, setPendingReferrals] = useState(0);
  const [earnedRewards, setEarnedRewards] = useState(0);
  const [paidRewards, setPaidRewards] = useState(0);
  const [copyMessage, setCopyMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAccount() {
      const { data: auth, error: authError } =
        await supabase.auth.getUser();

      if (authError || !auth.user) {
        window.location.href = "/app/login";
        return;
      }

      const user = auth.user;
      const metadata = user.user_metadata || {};

      setName(metadata.full_name || "Member");
      setEmail(user.email || "");
      setPhone(metadata.phone || "Not provided");

      setPaymentPhone(
        metadata.activation_payment_phone || metadata.phone || ""
      );

      setMethod(metadata.activation_payment_method || "M-PESA");

      const { data, error } = await supabase
        .from("activation_requests")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setMessage("Activation setup is not ready. Please contact support.");
        setLoading(false);
        return;
      }

      if (!data) {
        const { error: insertError } = await supabase
          .from("activation_requests")
          .insert({
            user_id: user.id,
            amount: 2,
            currency: "USD",
            status: "pending"
          });

        if (insertError) {
          setMessage("Could not create your activation record. Please try again.");
          setLoading(false);
          return;
        }

        setStatus("pending");
      } else {
        setStatus(data.status);
      }

      // Load member referral information
      const { data: codeData } = await supabase
        .from("member_referral_codes")
        .select("referral_code")
        .eq("user_id", user.id)
        .maybeSingle();

      setReferralCode(codeData?.referral_code || "");

      const { data: referralData } = await supabase
        .from("member_referrals")
        .select("status, reward_amount")
        .eq("referrer_user_id", user.id);

      const referrals = referralData || [];

      setReferralCount(referrals.length);

      setPendingReferrals(
        referrals.filter(r => r.status === "pending").length
      );

      setEarnedRewards(
        referrals
          .filter(r => r.status === "earned")
          .reduce((total, r) => total + Number(r.reward_amount), 0)
      );

      setPaidRewards(
        referrals
          .filter(r => r.status === "paid")
          .reduce((total, r) => total + Number(r.reward_amount), 0)
      );

      setLoading(false);
    }

    loadAccount();
  }, []);

  async function copyReferralCode() {
    if (!referralCode) {
      setCopyMessage("Your referral code is not available yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(referralCode);
      setCopyMessage("Referral code copied successfully!");
    } catch {
      setCopyMessage("Please copy your code manually: " + referralCode);
    }
  }

  async function savePaymentChoice() {
    setMessage("");

    if (method === "M-PESA" || method === "Airtel Money") {
      const digits = paymentPhone.replace(/\D/g, "");

      const valid =
        /^254[17]\d{8}$/.test(digits) ||
        /^0[17]\d{8}$/.test(digits) ||
        /^[17]\d{8}$/.test(digits);

      if (!valid) {
        setMessage("Enter a valid Kenyan phone number, for example 0712345678.");
        return;
      }
    }

    setSaving(true);

    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) {
      setSaving(false);
      setMessage("Please log in again.");
      return;
    }

    const amount = method === "SIM Toolkit" ? 300 : 2;
    const currency = method === "SIM Toolkit" ? "KES" : "USD";

    const { error: updateError } = await supabase
      .from("activation_requests")
      .update({ amount, currency })
      .eq("user_id", auth.user.id)
      .eq("status", "pending");

    if (updateError) {
      setSaving(false);
      setMessage("Could not save activation amount: " + updateError.message);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        activation_payment_method: method,
        activation_payment_phone: paymentPhone
      }
    });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Your payment choice and amount have been saved. Payment is not connected yet. Do not send money until payment is verified."
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/app/login";
  }

  const purple = "#6500bd";
  const dark = "#31006b";
  const light = "#f6efff";

  if (loading) {
    return <main style={{ padding: 30 }}>Loading your account...</main>;
  }

  if (status !== "active") {
    return (
      <main style={{
        minHeight: "100vh",
        background: light,
        color: dark,
        fontFamily: "Arial, sans-serif",
        padding: 20
      }}>
        <section style={{
          maxWidth: 480,
          margin: "30px auto",
          background: "white",
          padding: 24,
          borderRadius: 18,
          boxShadow: "0 4px 20px #31006b15"
        }}>
          <h2 style={{ color: purple }}>BWK · DollarFetch</h2>
          <h2>Activate Your Account</h2>
          <p>Welcome, {name}!</p>

          <div style={{
            background: "#f4f0fa",
            padding: 20,
            borderRadius: 12,
            textAlign: "center",
            margin: "20px 0"
          }}>
            <small>ONE-TIME ACTIVATION FEE</small>
            <h1 style={{ fontSize: 38, margin: 8 }}>
              {method === "SIM Toolkit" ? "KES 300" : "$2.00 USD"}
            </h1>
          </div>

          <h3>Choose Your Payment Method</h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 12
          }}>
            {methods.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setMethod(item.id);
                  setMessage("");
                }}
                aria-label={`Select ${item.id}`}
                aria-pressed={method === item.id}
                style={{
                  width: "100%",
                  minHeight: 86,
                  padding: "14px 18px",
                  borderRadius: 14,
                  border: method === item.id
                    ? "3px solid #6500bd"
                    : "1px solid #ded6e8",
                  background: method === item.id ? "#f7efff" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  textAlign: "left",
                  cursor: "pointer",
                  color: dark
                }}
              >
                <span style={{
                  width: 112,
                  height: 54,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fff",
                  borderRadius: 9,
                  padding: 5
                }}>
                  <img
                    src={item.logo}
                    alt={item.alt}
                    style={{
                      maxWidth: "100%",
                      maxHeight: 48,
                      objectFit: "contain"
                    }}
                  />
                </span>

                <span style={{ flex: 1 }}>
                  <strong>{item.id}</strong>
                  {method === item.id && (
                    <small style={{
                      display: "block",
                      color: purple,
                      fontWeight: "bold",
                      marginTop: 5
                    }}>
                      ✓ Selected
                    </small>
                  )}
                </span>
              </button>
            ))}
          </div>

          {method === "SIM Toolkit" && (
            <div style={{
              marginTop: 20,
              padding: 18,
              background: "#fff8e8",
              borderRadius: 12,
              border: "1px solid #edcf91"
            }}>
              <h3>SIM Toolkit Payment</h3>
              <p>Activation fee: <strong>KES 300</strong></p>
              <p>Send Money to this number:</p>
              <h2 style={{ color: dark }}>0732659971</h2>
              <p>
                Open the M-PESA menu. Choose Send Money, enter the
                recipient number and KES 300, then confirm using
                your own M-PESA PIN.
              </p>
              <a
                href="tel:*334%23"
                style={{
                  display: "block",
                  boxSizing: "border-box",
                  padding: 15,
                  margin: "14px 0",
                  background: "#168b45",
                  color: "white",
                  borderRadius: 9,
                  textAlign: "center",
                  textDecoration: "none",
                  fontWeight: "bold"
                }}
              >
                Open M-PESA SIM Toolkit
              </a>
              <small>
                Your phone may open the dialer or M-PESA USSD menu.
                Enter the recipient and amount yourself. The website
                cannot automatically fill secure SIM Toolkit fields.
                Your account remains pending until payment is verified.
              </small>
            </div>
          )}

          {(method === "M-PESA" || method === "Airtel Money") && (
            <div style={{ marginTop: 20 }}>
              <label style={{ fontWeight: "bold" }}>
                {method} Phone Number
              </label>
              <input
                type="tel"
                value={paymentPhone}
                onChange={e => setPaymentPhone(e.target.value)}
                placeholder="+254712345678"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: 14,
                  marginTop: 8,
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  fontSize: 16
                }}
              />
            </div>
          )}

          <button
            onClick={savePaymentChoice}
            disabled={saving}
            style={{
              width: "100%",
              padding: 16,
              marginTop: 20,
              background: "#168b45",
              color: "white",
              border: 0,
              borderRadius: 8,
              fontSize: 16,
              fontWeight: "bold"
            }}
          >
            {saving ? "Saving..." : "Save Payment Choice"}
          </button>

          <p style={{
            background: "#fff8e8",
            color: "#805600",
            padding: 12,
            borderRadius: 8,
            fontSize: 13,
            lineHeight: 1.5
          }}>
            Payment processing is not connected yet. Saving your choice
            does not make a payment. Your account remains pending until
            payment is securely verified.
          </p>

          <p style={{ color: "#805600", fontWeight: "bold" }}>
            Account Status: Not Activated
          </p>

          {message && <p>{message}</p>}

          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: 13,
              background: dark,
              color: "white",
              border: 0,
              borderRadius: 8
            }}
          >
            Log Out
          </button>
        </section>
      </main>
    );
  }

  const menu = [
    "Dashboard",
    "Deposit",
    "Withdraw",
    "Transactions",
    "Referrals",
    "Profile"
  ];

  return (
    <main style={{
      minHeight: "100vh",
      background: light,
      color: dark,
      fontFamily: "Arial, sans-serif",
      paddingBottom: 85
    }}>
      <header style={{
        background: "linear-gradient(120deg,#31006b,#8b00df)",
        color: "white",
        padding: 20
      }}>
        <h2>BWK · DollarFetch</h2>
        <p>Simple. Secure. Reliable.</p>
      </header>

      <section style={{
        maxWidth: 1100,
        margin: "auto",
        padding: 18
      }}>
        <h2>Welcome back, {name}!</h2>

        <div style={{
          background: "linear-gradient(110deg,#390078,#8500db)",
          color: "white",
          padding: 25,
          borderRadius: 18,
          marginTop: 20
        }}>
          <p>AVAILABLE BALANCE</p>
          <h1 style={{ fontSize: 42 }}>$0.00</h1>
          <small>Demo balance only.</small>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(125px,1fr))",
          gap: 10,
          marginTop: 20
        }}>
          {menu.map(item => (
            <button
              key={item}
              onClick={() => setTab(item)}
              style={{
                padding: 16,
                borderRadius: 12,
                border: "1px solid #d9b8ff",
                background: tab === item ? purple : "white",
                color: tab === item ? "white" : dark,
                fontWeight: "bold"
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <div style={{
          background: "white",
          padding: 22,
          borderRadius: 16,
          marginTop: 22
        }}>
          {tab === "Dashboard" && (
            <>
              <h2>Account Overview</h2>
              <p><b>Name:</b> {name}</p>
              <p><b>Email:</b> {email}</p>
              <p><b>Phone:</b> {phone}</p>
              <p><b>Balance:</b> $0.00</p>
              <p><b>Account Status:</b> Active</p>
              <hr />
              <h3>Recent Activity</h3>
              <p>No transactions yet.</p>
            </>
          )}

          {tab === "Deposit" && (
            <>
              <h2>Deposit Funds</h2>
              <h1>$0.00</h1>
              <p>Payment integrations coming soon.</p>
              <p>Deposits are not yet enabled.</p>
            </>
          )}

          {tab === "Withdraw" && (
            <>
              <h2>Withdraw Funds</h2>
              <p>Available balance: $0.00</p>
              <p>
                All withdrawal requests require administrator authorization.
              </p>
              <p>Withdrawals are not yet enabled.</p>
            </>
          )}

          {tab === "Transactions" && (
            <>
              <h2>Transaction History</h2>
              <p>No transactions yet.</p>
            </>
          )}

          {tab === "Referrals" && (
            <>
              <h2>Invite Friends & Earn</h2>
              <p>
                Invite people to join BWK DollarFetch. Earn
                <strong> $0.50 USD </strong>
                for each referred member whose account is successfully
                activated after payment verification.
              </p>

              <div style={{
                background: "#f6efff",
                padding: 18,
                borderRadius: 12,
                margin: "18px 0"
              }}>
                <p><b>Your Personal Referral Code</b></p>
                <h2 style={{
                  color: purple,
                  letterSpacing: 2,
                  overflowWrap: "anywhere"
                }}>
                  {referralCode || "Not available yet"}
                </h2>

                <button
                  onClick={copyReferralCode}
                  style={{
                    width: "100%",
                    padding: 13,
                    background: purple,
                    color: "white",
                    border: 0,
                    borderRadius: 8,
                    fontWeight: "bold"
                  }}
                >
                  Copy Referral Code
                </button>

                {copyMessage && <p>{copyMessage}</p>}
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(125px,1fr))",
                gap: 12
              }}>
                <div style={{
                  background: "#f6efff",
                  padding: 16,
                  borderRadius: 12
                }}>
                  <small>Total Referrals</small>
                  <h2>{referralCount}</h2>
                </div>

                <div style={{
                  background: "#fff8e8",
                  padding: 16,
                  borderRadius: 12
                }}>
                  <small>Pending</small>
                  <h2>{pendingReferrals}</h2>
                </div>

                <div style={{
                  background: "#edf9ef",
                  padding: 16,
                  borderRadius: 12
                }}>
                  <small>Earned Rewards</small>
                  <h2>${earnedRewards.toFixed(2)}</h2>
                </div>

                <div style={{
                  background: "#eef5ff",
                  padding: 16,
                  borderRadius: 12
                }}>
                  <small>Paid Rewards</small>
                  <h2>${paidRewards.toFixed(2)}</h2>
                </div>
              </div>

              <div style={{
                marginTop: 20,
                padding: 16,
                border: "1px solid #ded6e8",
                borderRadius: 12
              }}>
                <h3>How It Works</h3>
                <p>1. Copy your personal referral code.</p>
                <p>2. Share it with someone you invite.</p>
                <p>3. They enter your code when registering.</p>
                <p>4. Their account must be activated after payment verification.</p>
                <p>5. You earn $0.50 USD for that successful referral.</p>
              </div>

              <p style={{
                color: "#805600",
                fontSize: 13,
                marginTop: 16
              }}>
                Rewards are recorded after administrator approval
                of the referred member's activation. Payouts are
  
