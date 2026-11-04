
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Tab =
  | "Dashboard"
  | "Activation"
  | "Deposit"
  | "Withdraw"
  | "Transactions"
  | "Referrals"
  | "Profile";

const methods = [
  "M-PESA",
  "Postbank",
  "Equity Bank",
  "Binance",
  "Airtel Money",
  "SIM Toolkit",
];

const paymentBrand: Record<
  string,
  { short: string; color: string; detail: string }
> = {
  "M-PESA": {
    short: "M",
    color: "#35a853",
    detail: "Mobile money",
  },
  Postbank: {
    short: "PB",
    color: "#1464a5",
    detail: "Bank transfer",
  },
  "Equity Bank": {
    short: "E",
    color: "#e32636",
    detail: "Bank transfer",
  },
  Binance: {
    short: "B",
    color: "#f0b90b",
    detail: "Crypto payment",
  },
  "Airtel Money": {
    short: "A",
    color: "#e40000",
    detail: "Mobile money",
  },
  "SIM Toolkit": {
    short: "SIM",
    color: "#55318b",
    detail: "Manual M-PESA",
  },
};

const adminEmail = "mwendaemmanuel212@gmail.com";
const whatsapp =
  "https://whatsapp.com/channel/0029VbEm5GNHAdNQQ8QEXb2f";

function PaymentBadge({ name }: { name: string }) {
  const brand = paymentBrand[name];

  return (
    <span
      style={{
        width: 46,
        height: 46,
        minWidth: 46,
        borderRadius: 12,
        background: brand.color,
        color: name === "Binance" ? "#171717" : "#ffffff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: name === "SIM Toolkit" ? 11 : 19,
        fontWeight: 800,
        letterSpacing: "-0.5px",
      }}
    >
      {brand.short}
    </span>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("not_requested");
  const [method, setMethod] = useState("M-PESA");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const active = status === "active" || status === "approved";

  const name =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Member";

  const memberPhone =
    user?.user_metadata?.phone ||
    user?.user_metadata?.activation_payment_phone ||
    "Not provided";

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data.user) {
        window.location.href = "/app/login";
        return;
      }

      setUser(data.user);

      const { data: request } = await supabase
        .from("activation_requests")
        .select("status")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (request?.status) {
        setStatus(request.status.toLowerCase());
      }

      const { data: codeData } = await supabase
        .from("member_referral_codes")
        .select("referral_code")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!mounted) return;

      if (codeData?.referral_code) {
        setReferralCode(codeData.referral_code);
      }

      const { data: referralData } = await supabase
        .from("member_referrals")
        .select("reward_amount,currency,status,created_at")
        .eq("referrer_user_id", data.user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      setReferrals(referralData || []);
      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/app/login";
  }

  async function submitActivation() {
    if (!user) return;

    if (
      method === "M-PESA" &&
      !/^\+\d{8,15}$/.test(phone.trim())
    ) {
      setMessage(
        "Enter your phone with country code, e.g. +254712345678."
      );
      return;
    }

    setSending(true);
    setMessage("");

    const { error: metadataError } =
      await supabase.auth.updateUser({
        data: {
          activation_payment_method: method,
          activation_payment_phone:
            method === "M-PESA" ? phone.trim() : null,
        },
      });

    if (metadataError) {
      setMessage(metadataError.message);
      setSending(false);
      return;
    }

    const { error } = await supabase
      .from("activation_requests")
      .insert({
        user_id: user.id,
        amount: 2,
        currency: "USD",
        status: "pending",
      });

    if (error) {
      setMessage("Request failed: " + error.message);
    } else {
      setStatus("pending");
      setMessage(
        "Your activation request has been submitted. Await payment verification by the administrator."
      );
    }

    setSending(false);
  }

  async function copyReferral() {
    if (!referralCode) {
      setMessage("Your referral code is not available yet.");
      return;
    }

    const link =
      `${window.location.origin}/register?ref=${encodeURIComponent(referralCode)}`;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage("Unable to copy. Please try again.");
    }
  }

  const earnedRewards = referrals
    .filter(
      (r) => r.status === "earned" || r.status === "paid"
    )
    .reduce(
      (sum, r) => sum + Number(r.reward_amount || 0),
      0
    );

  const pendingRewards = referrals
    .filter((r) => r.status === "pending")
    .reduce(
      (sum, r) => sum + Number(r.reward_amount || 0),
      0
    );

  if (loading) {
    return (
      <main className="empty">
        <h2>BWK DollarFetch</h2>
        <p>Loading your member dashboard...</p>
      </main>
    );
  }

  const menu: Tab[] = [
    "Dashboard",
    "Activation",
    "Deposit",
    "Withdraw",
    "Transactions",
    "Referrals",
    "Profile",
  ];

  const paymentGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 12,
    marginTop: 15,
  };

  const paymentCardStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 13,
    border: "1px solid #e7e2f2",
    background: "#ffffff",
    textAlign: "left",
    width: "100%",
    cursor: "pointer",
    color: "#25213b",
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="/dashboard">
          <span className="mark">BWK</span>
          <span>DollarFetch</span>
        </a>

        <p className="menu-label">MEMBER MENU</p>

        <nav>
          {menu.map((item) => (
            <button
              key={item}
              className={`nav ${tab === item ? "active" : ""}`}
              onClick={() => {
                setTab(item);
                setMessage("");
              }}
            >
              {item === "Dashboard" && "▦  "}
              {item === "Activation" && "✓  "}
              {item === "Deposit" && "＋  "}
              {item === "Withdraw" && "↗  "}
              {item === "Transactions" && "▤  "}
              {item === "Referrals" && "♧  "}
              {item === "Profile" && "◎  "}
              {item}
            </button>
          ))}
        </nav>

        <div className="help">
          <b>Need assistance?</b>
          <p>
            Contact BWK DollarFetch through our official WhatsApp
            channel.
          </p>
          <a href={whatsapp} target="_blank" rel="noreferrer">
            WhatsApp Support →
          </a>
        </div>

        <div className="foot">BWK · 2026</div>
      </aside>

      <div className="main">
        <header className="top">
          <div>
            <small>BWK MEMBER PORTAL</small>
            <h1>DollarFetch</h1>
          </div>

          <div className="member">
            <span>{String(name).charAt(0).toUpperCase()}</span>
            <div>
              <b>{name}</b>
              <small>{user?.email}</small>
            </div>
          </div>
        </header>

        <div className="content">
          <div className="welcome">
            <div>
              <span className="blue">MEMBER OVERVIEW</span>
              <h2>Welcome, {name}</h2>
              <p>
                Manage your DollarFetch account and member activity.
              </p>
            </div>

            <label>
              {active ? "ACCOUNT ACTIVE" : status.toUpperCase()}
            </label>
          </div>

          {message && (
            <div className="notice">{message}</div>
          )}

          {tab === "Dashboard" && (
            <>
              <div className="stats">
                <article className="balance">
                  <small>AVAILABLE BALANCE</small>
                  <h2>$0.00</h2>
                  <p>USD wallet balance · Demo display</p>
                </article>

                <article>
                  <small>ACCOUNT STATUS</small>
                  <h2>
                    {active
                      ? "Active"
                      : status === "pending"
                        ? "Pending"
                        : "Not activated"}
                  </h2>
                  <p>Activation verification</p>
                </article>

                <article>
                  <small>REFERRAL REWARD</small>
                  <h2>${earnedRewards.toFixed(2)}</h2>
                  <p>Verified referral rewards</p>
                </article>
              </div>

              {!active && (
                <div className="notice">
                  <b>Your account needs activation.</b>
                  <p>
                    Submit your activation request and wait for
                    the administrator to verify payment.
                  </p>
                  <button
                    className="back"
                    onClick={() => setTab("Activation")}
                  >
                    Open Activation
                  </button>
                </div>
              )}

              <section className="panel">
                <h3>Quick Actions</h3>
                <p>Choose a section to continue.</p>

                <div className="actions">
                  <button onClick={() => setTab("Deposit")}>
                    <b>＋ Deposit Funds</b>
                    <small>View deposit payment options</small>
                  </button>

                  <button onClick={() => setTab("Withdraw")}>
                    <b>↗ Withdraw Funds</b>
                    <small>Administrator authorization required</small>
                  </button>

                  <button onClick={() => setTab("Transactions")}>
                    <b>▤ Transactions</b>
                    <small>View transaction activity</small>
                  </button>

                  <button onClick={() => setTab("Referrals")}>
                    <b>♧ Refer Members</b>
                    <small>Earn $0.50 per verified referral</small>
                  </button>
                </div>
              </section>

              <section className="panel">
                <h3>Member Information</h3>
                <div className="activity">
                  <div>
                    <span>Full name</span>
                    <br />
                    <b>{name}</b>
                  </div>
                  <div>
                    <span>Email address</span>
                    <br />
                    <b>{user?.email}</b>
                  </div>
                  <div>
                    <span>Phone number</span>
                    <br />
                    <b>{memberPhone}</b>
                  </div>
                  <div>
                    <span>Member ID</span>
                    <br />
                    <b>{user?.id}</b>
                  </div>
                </div>
              </section>
            </>
          )}

          {tab === "Activation" && (
            <section className="panel">
              <h3>Account Activation</h3>
              <p>Activation fee: $2 USD</p>

              {active ? (
                <div className="notice">
                  Your account has been activated.
                </div>
              ) : status === "pending" ? (
                <div className="notice">
                  Your activation request is pending administrator
                  verification.
                </div>
              ) : (
                <>
                  <p style={{ marginTop: 18 }}>
                    Choose your preferred payment method:
                  </p>

                  <div style={paymentGridStyle}>
                    {methods.map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setMethod(m)}
                        style={{
                          ...paymentCardStyle,
                          border:
                            method === m
                              ? "2px solid #7041c5"
                              : "1px solid #e7e2f2",
                          background:
                            method === m ? "#f5efff" : "#ffffff",
                        }}
                      >
                        <PaymentBadge name={m} />
                        <span>
                          <b style={{ display: "block" }}>{m}</b>
                          <small style={{ color: "#77718b" }}>
                            {paymentBrand[m].detail}
                          </small>
                        </span>
                        {method === m && (
                          <span
                            style={{
                              marginLeft: "auto",
                              color: "#7041c5",
                              fontWeight: 800,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {method === "M-PESA" && (
                    <div style={{ marginTop: 15 }}>
                      <label>
                        M-PESA phone number with country code
                      </label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+254712345678"
                        style={{
                          width: "100%",
                          padding: 13,
                          border: "1px solid #e1e7f0",
                          borderRadius: 10,
                          marginTop: 8,
                        }}
                      />
                    </div>
                  )}

                  {method === "SIM Toolkit" && (
                    <div className="notice" style={{ marginTop: 15 }}>
                      <b>Manual M-PESA SIM Toolkit instructions</b>
                      <p>
                        Open M-PESA SIM Toolkit and select Send Money.
                        Verify the recipient number and amount with
                        the administrator before making any payment.
                      </p>
                      <p>
                        The website cannot enter your PIN or
                        automatically fill secure SIM Toolkit fields.
                      </p>
                      <a href="tel:*334%23">Open M-PESA menu</a>
                    </div>
                  )}

                  <button
                    className="back"
                    disabled={sending}
                    onClick={submitActivation}
                    style={{
                      marginTop: 18,
                      opacity: sending ? 0.6 : 1,
                    }}
                  >
                    {sending
                      ? "Submitting..."
                      : "Submit Activation Request"}
                  </button>

                  <p style={{ marginTop: 14 }}>
                    Other payment methods must be configured and
                    verified before sending money. A submitted
                    request does not prove payment.
                  </p>
                </>
              )}
            </section>
          )}

          {tab === "Deposit" && (
            <section className="panel">
              <h3>Deposit Funds</h3>
              <p>Available payment options</p>

              <div style={paymentGridStyle}>
                {methods.map((m) => (
                  <div
                    key={m}
                    style={{
                      ...paymentCardStyle,
                      cursor: "default",
                    }}
                  >
                    <PaymentBadge name={m} />
                    <span>
                      <b style={{ display: "block" }}>{m}</b>
                      <small style={{ color: "#77718b" }}>
                        {paymentBrand[m].detail}
                      </small>
                      <small
                        style={{
                          display: "block",
                          color: "#a16b12",
                          marginTop: 4,
                        }}
                      >
                        Setup pending
                      </small>
                    </span>
                  </div>
                ))}
              </div>

              <div className="notice" style={{ marginTop: 18 }}>
                Deposits are not automatically credited yet.
                Payment verification and wallet crediting must be
                connected before deposits can be processed.
              </div>
            </section>
          )}

          {tab === "Withdraw" && (
            <section className="panel">
              <h3>Withdraw Funds</h3>
              <div className="notice">
                <b>Administrator authorization required</b>
                <p>
                  Every withdrawal must be reviewed and authorized
                  by the administrator before funds are released.
                </p>
              </div>
              <p>Withdrawal processing is not connected yet.</p>
            </section>
          )}

          {tab === "Transactions" && (
            <section className="panel">
              <h3>Transaction History</h3>
              <p>
                Your deposits, withdrawals and other wallet activity
                will appear here when transaction processing is
                connected.
              </p>
              <div className="empty">
                <span className="blue">TRANSACTION RECORDS</span>
                <h3>No transactions to display</h3>
                <p>Your transaction history is currently empty.</p>
              </div>
            </section>
          )}

          {tab === "Referrals" && (
            <>
              <div className="stats">
                <article>
                  <small>REFERRAL REWARD</small>
                  <h2>$0.50</h2>
                  <p>Per verified activated referral</p>
                </article>
                <article>
                  <small>VERIFIED REWARDS</small>
                  <h2>${earnedRewards.toFixed(2)}</h2>
                  <p>Earned or paid</p>
                </article>
                <article>
                  <small>PENDING REWARDS</small>
                  <h2>${pendingRewards.toFixed(2)}</h2>
                  <p>Awaiting ac
