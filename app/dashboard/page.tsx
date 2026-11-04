
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

      setMethod(
        metadata.activation_payment_method || "M-PESA"
      );

      const { data, error } = await supabase
        .from("activation_requests")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setMessage(
          "Activation setup is not ready. Please contact support."
        );
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
          setMessage(
            "Could not create your activation record. Please try again."
          );
          setLoading(false);
          return;
        }

        setStatus("pending");
      } else {
        setStatus(data.status);
      }

      setLoading(false);
    }

    loadAccount();
  }, []);

  async function savePaymentChoice() {
  setMessage("");

  if (method === "M-PESA" || method === "Airtel Money") {
    const digits = paymentPhone.replace(/\D/g, "");

    const valid =
      /^254[17]\d{8}$/.test(digits) ||
      /^0[17]\d{8}$/.test(digits) ||
      /^[17]\d{8}$/.test(digits);

    if (!valid) {
      setMessage("Enter a valid Kenyan phone number.");
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
    setMessage("Could not save the activation amount: " + updateError.message);
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
    "Your payment choice and activation amount have been saved. Payment is not connected yet. Do not send money until official instructions appear."
  );
  }
    setMessage("");

    if (
      method === "M-PESA" ||
      method === "Airtel Money"
    ) {
      const digits = paymentPhone.replace(/\D/g, "");

      const valid =
        /^254[17]\d{8}$/.test(digits) ||
        /^0[17]\d{8}$/.test(digits) ||
        /^[17]\d{8}$/.test(digits);

      if (!valid) {
        setMessage(
          "Enter a valid Kenyan phone number, for example 0712345678."
        );
        return;
      }
    }

    setSaving(true);

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
      "Your payment preference has been saved. Payment processing is not connected yet. Please do not send money until official payment instructions are provided."
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
    return (
      <main style={{ padding: 30 }}>
        Loading your account...
      </main>
    );
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
          <h2 style={{ color: purple }}>
            BWK · DollarFetch
          </h2>

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
              $2.00 USD
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
                onClick={() => setMethod(item.id)}
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
                  background: method === item.id
                    ? "#f7efff"
                    : "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  textAlign: "left",
                  cursor: "pointer",
                  color: dark,
                  boxShadow: method === item.id
                    ? "0 0 0 2px #6500bd18"
                    : "0 2px 8px #31006b0a"
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
                  <strong style={{
                    display: "block",
                    fontSize: 16
                  }}>
                    {item.id}
                  </strong>

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

                <span style={{
                  width: 23,
                  height: 23,
                  borderRadius: "50%",
                  border: method === item.id
                    ? "7px solid #6500bd"
                    : "2px solid #b8adca",
                  boxSizing: "border-box",
                  flexShrink: 0
                }} />
              </button>
            ))}
          </div>

          {(method === "M-PESA" ||
            method === "Airtel Money") && (
            <div style={{ marginTop: 20 }}>
              <label style={{ fontWeight: "bold" }}>
                {method} Phone Number
              </label>

              <input
                type="tel"
                value={paymentPhone}
                onChange={e =>
                  setPaymentPhone(e.target.value)
                }
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
            Payment processing is not connected yet.
            This saves your preferred payment method only.
            No money will be deducted. Your account remains
            pending until payment is securely verified.
          </p>

          <p style={{
            color: "#805600",
            fontWeight: "bold"
          }}>
            Account Status: Not Activated
          </p>

          {message && (
            <p style={{
              fontSize: 14,
              lineHeight: 1.5,
              overflowWrap: "anywhere"
            }}>
              {message}
            </p>
          )}

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
          gridTemplateColumns: "repeat(auto-fit,minmax(135px,1fr))",
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
                All withdrawal requests require administrator
                authorization.
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

          {tab === "Profile" && (
            <>
              <h2>My Profile</h2>
              <p><b>Name:</b> {name}</p>
              <p><b>Email:</b> {email}</p>
              <p><b>Phone:</b> {phone}</p>
              <p><b>Currency:</b> USD ($)</p>
            </>
          )}
        </div>

        <button
          onClick={logout}
          style={{
            background: dark,
            color: "white",
            border: 0,
            borderRadius: 10,
            padding: 15,
            width: "100%",
            marginTop: 20
          }}
        >
          Log Out
        </button>

        <footer style={{
          textAlign: "center",
          padding: 25,
          color: "#63319a"
        }}>
          Powered by <b>BWK Manny</b> © 2026
        </footer>
      </section>

      <a
        href="https://whatsapp.com/channel/0029VbEm5GNHAdNQQ8QEXb2f"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: 22,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "#25D366",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 30,
          textDecoration: "none",
          zIndex: 1000
        }}
      >
        ☎
      </a>
    </main>
  );
}
