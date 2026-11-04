
"use client";

import { useEffect, useState } from "react";
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

const methods = [
  { name: "M-PESA", mark: "M", color: "#159447", detail: "Safaricom mobile money" },
  { name: "Postbank", mark: "P", color: "#e32636", detail: "Postbank payment" },
  { name: "Equity Bank", mark: "E", color: "#d71920", detail: "Equity Bank payment" },
  { name: "Binance", mark: "B", color: "#f0b90b", detail: "Binance payment" },
  { name: "Airtel Money", mark: "A", color: "#ed1c24", detail: "Airtel mobile money" },
  { name: "SIM Toolkit", mark: "SIM", color: "#6531c9", detail: "Manual SIM Toolkit payment" },
];

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [paymentMethod, setPaymentMethod] = useState("M-PESA");
  const [phone, setPhone] = useState("+254");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/app/login");
        return;
      }

      setUser(data.user);
      setReferralCode(
        data.user.user_metadata?.referral_code || ""
      );
      setLoading(false);
    }

    loadUser();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/app/login");
  };

  const navigate = (tab: Tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
    setMessage("");
  };

  const submitActivation = async () => {
    if (!user || sending) return;

    if (
      (paymentMethod === "M-PESA" ||
        paymentMethod === "Airtel Money") &&
      !/^\+254\d{9}$/.test(phone)
    ) {
      setMessage("Enter a valid Kenyan number, for example +254712345678.");
      return;
    }

    setSending(true);
    setMessage("");

    const { error: profileError } = await supabase.auth.updateUser({
      data: {
        activation_payment_method: paymentMethod,
        activation_phone: phone,
      },
    });

    if (profileError) {
      setMessage("Could not save your payment details. Please try again.");
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
      setMessage("Your activation request could not be submitted. Please try again.");
    } else {
      setMessage(
        "Your $2 activation request has been submitted for administrator review. Your account remains pending until payment is verified."
      );
    }

    setSending(false);
  };

  const copyReferral = async () => {
    if (!referralCode) {
      setMessage("Your referral code has not been assigned yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/app/register?ref=${referralCode}`
      );
      setMessage("Referral link copied successfully.");
    } catch {
      setMessage("Could not copy the referral link on this device.");
    }
  };

  const navItems: { name: Tab; icon: string }[] = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Activation", icon: "ϟ" },
    { name: "Deposit", icon: "↓" },
    { name: "Withdraw", icon: "↑" },
    { name: "Transactions", icon: "▤" },
    { name: "Referrals", icon: "♧" },
    { name: "Profile", icon: "●" },
  ];

  if (loading) {
    return (
      <div className="df-loading">
        <div className="df-spinner" />
        Loading DollarFetch...
        <style jsx global>{`
          .df-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: #5120a4;
            font-family: Arial, sans-serif;
          }
          .df-spinner {
            width: 22px;
            height: 22px;
            border: 3px solid #e8d9ff;
            border-top-color: #7618e8;
            border-radius: 50%;
            animation: dfspin 0.8s linear infinite;
          }
          @keyframes dfspin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f7f2ff; color: #211044; }
        button, input { font: inherit; }
        button { cursor: pointer; }

        .df-app {
          min-height: 100vh;
          display: flex;
          background: #f7f2ff;
          font-family: Arial, Helvetica, sans-serif;
        }

        .df-sidebar {
          width: 276px;
          flex-shrink: 0;
          min-height: 100vh;
          padding: 22px 17px;
          background: linear-gradient(180deg,#21005a,#350080 65%,#21005a);
          color: white;
          display: flex;
          flex-direction: column;
          transition: transform .25s ease;
          z-index: 20;
        }

        .df-brand {
          padding: 12px 12px 34px;
          border-bottom: 1px solid #ffffff24;
          margin-bottom: 24px;
        }

        .df-brand-mark {
          width: 57px;
          height: 57px;
          border-radius: 17px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg,#d68aff,#7616e9);
          font-size: 27px;
          font-weight: 900;
          margin-bottom: 12px;
          box-shadow: 0 7px 25px #0003;
        }

        .df-brand h2 {
          color: white;
          font-size: 24px;
          margin: 0 0 5px;
          font-weight: 900;
        }

        .df-brand p {
          color: #ddc5ff;
          font-size: 12px;
          margin: 0;
        }

        .df-menu-label {
          color: #c8a9f4;
          font-size: 10px;
          letter-spacing: 2px;
          font-weight: 800;
          padding: 0 12px 12px;
        }

        .df-nav {
          display: grid;
          gap: 8px;
        }

        .df-nav button {
          width: 100%;
          border: 0;
          border-radius: 12px;
          padding: 13px 14px;
          color: #eadcff;
          background: transparent;
          display: flex;
          align-items: center;
          gap: 14px;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
        }

        .df-nav button:hover,
        .df-nav button.active {
          color: white;
          background: linear-gradient(100deg,#8c16f4,#5b08c9);
          box-shadow: 0 6px 18px #16003366;
        }

        .df-nav-icon {
          width: 25px;
          text-align: center;
          font-size: 23px;
          font-weight: 800;
        }

        .df-side-promo {
          margin-top: auto;
          padding: 20px 15px;
          border: 1px solid #a34cff70;
          border-radius: 16px;
          background: #ffffff0c;
          text-align: center;
        }

        .df-gift { font-size: 40px; }
        .df-side-promo h3 { color: #ffdf36; margin: 8px 0; }
        .df-side-promo p { color: #e2d0ff; font-size: 12px; line-height: 1.6; }
        .df-side-promo button {
          border: 0;
          border-radius: 9px;
          padding: 10px 15px;
          color: white;
          font-weight: 800;
          background: #8615ed;
        }

        .df-main { flex: 1; min-width: 0; }

        .df-topbar {
          height: 76px;
          padding: 0 25px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: #fff;
          border-bottom: 1px solid #eadfff;
        }

        .df-top-left { display: flex; align-items: center; gap: 15px; }
        .df-menu-button {
          border: 0;
          background: transparent;
          color: #3b0877;
          font-size: 28px;
          padding: 5px;
        }

        .df-member {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          font-size: 12px;
          font-weight: 700;
        }

        .df-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #eadcff;
          color: #6511c7;
          display: grid;
          place-items: center;
          font-size: 18px;
        }

        .df-logout {
          border: 0;
          border-radius: 10px;
          padding: 11px 15px;
          background: #7615e5;
          color: white;
          font-weight: 800;
        }

        .df-content {
          max-width: 1500px;
          padding: 22px;
          margin: auto;
        }

        .df-welcome {
          min-height: 155px;
          border-radius: 17px;
          padding: 27px 32px;
          margin-bottom: 20px;
          color: white;
          background:
            radial-gradient(circle at 85% 25%,#a746ff 0,#7920df 26%,transparent 50%),
            linear-gradient(115deg,#390078,#720fd0 65%,#4c0a9c);
          box-shadow: 0 8px 22px #5713a52a;
          display: flex;
          justify-content: space-between;
          align-items: center;
          overflow: hidden;
        }

        .df-welcome h1 { font-size: 30px; margin: 0 0 10px; }
        .df-welcome p { margin: 0; color: #ead9ff; font-size: 17px; }
        .df-welcome-art { font-size: 76px; padding-right: 25px; }

        .df-overview {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 17px;
          margin-bottom: 20px;
        }

        .df-balance {
          border-radius: 17px;
          padding: 25px;
          color: white;
          background: linear-gradient(120deg,#270064,#3b078d);
          display: flex;
          justify-content: space-around;
          align-items: center;
          gap: 15px;
          box-shadow: 0 7px 20px #3b087722;
        }

        .df-balance h2 { font-size: 39px; margin: 8px 0; }
        .df-balance p { color: #d7c0ff; margin: 0; font-size: 12px; }
        .df-balance-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #8c20f0;
          display: grid;
          place-items: center;
          font-size: 28px;
        }

        .df-status { border-left: 1px solid #a56cff; padding-left: 20px; }
        .df-status strong { display: block; color: #ffdf37; margin-top: 12px; font-size: 14px; }

        .df-quick {
          border-radius: 17px;
          padding: 20px;
          background: white;
          border: 1px solid #e5d5ff;
          box-shadow: 0 5px 16px #4810800d;
        }

        .df-quick h3 { margin: 0 0 17px; font-size: 19px; }
        .df-quick-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }

        .df-action {
          min-height: 105px;
          border: 0;
          border-radius: 13px;
          color: white;
          font-weight: 800;
          padding: 12px 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 5px 12px #00000018;
        }

        .df-action span { font-size: 27px; }
        .df-action.activate { background: linear-gradient(135deg,#a51aff,#6500d6); }
        .df-action.deposit { background: linear-gradient(135deg,#2782ff,#0645e8); }
        .df-action.withdraw { background: linear-gradient(135deg,#13bd79,#008b58); }

        .df-panels {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .df-panel {
          background: white;
          border: 1px solid #e5d5ff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 5px 16px #4810800d;
          min-width: 0;
        }

        .df-panel-head {
          padding: 16px;
          color: white;
          font-size: 16px;
          font-weight: 800;
          background: linear-gradient(100deg,#7410d6,#43008b);
        }

        .df-panel-body { padding: 18px; }
        .df-panel-body h2 { font-size: 29px; text-align: center; margin: 0 0 6px; }
        .df-panel-body p { font-size: 13px; line-height: 1.6; color: #695584; text-align: center; }

        .df-payment-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 9px;
          margin: 15px 0;
        }

        .df-payment {
          min-width: 0;
          border: 1px solid #e7daf7;
          border-radius: 11px;
          padding: 10px 7px;
          background: #fff;
          color: #291448;
          display: flex;
          align-items: center;
          gap: 8px;
          text-align: left;
        }

        .df-payment.selected {
          border: 2px solid #8116e8;
          background: #f7efff;
        }

        .df-payment-logo {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: 9px;
          display: grid;
          place-items: center;
          color: white;
          font-size: 12px;
          font-weight: 900;
        }

        .df-payment b { font-size: 11px; display: block; }
        .df-payment small { font-size: 9px; color: #89769e; display: block; margin-top: 3px; }

        .df-label { display: block; font-size: 12px; font-weight: 800; margin: 13px 0 6px; }
        .df-input {
          width: 100%;
          border: 1px solid #dfd1f1;
          border-radius: 10px;
          padding: 12px;
          color: #291448;
          background: #fff;
          outline-color: #8116e8;
        }

        .df-primary {
          width: 100%;
          border: 0;
          border-radius: 11px;
          padding: 13px;
          background: linear-gradient(100deg,#9714ed,#5900c7);
          color: white;
          font-weight: 900;
          margin-top: 12px;
        }

        .df-primary:disabled { opacity: .6; cursor: wait; }
        .df-notice {
          padding: 14px 17px;
          border: 1px solid #d6b8ff;
          border-radius: 12px;
          background: #efe3ff;
          color: #401276;
          font-size: 12px;
          line-height: 1.6;
          margin-bottom: 18px;
        }

        .df-message {
          background: #f0e6ff;
          color: #4b1680;
          border: 1px solid #d9baff;
          border-radius: 10px;
          padding: 13px;
          margin-bottom: 16px;
          font-size: 13px;
          line-height: 1.5;
        }

        .df-empty {
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #5c20a2;
        }

        .df-empty-icon { font-size: 55px; }
        .df-referral-link {
          background: #f1e7ff;
          border-radius: 10px;
          padding: 12px;
          overflow-wrap: anywhere;
          font-size: 11px;
          margin: 12px 0;
        }

        .df-footer {
          padding: 15px 5px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          color: #8876a0;
          font-size: 11px;
        }

        .df-overlay { display: none; }

        @media(max-width:1050px) {
          .df-panels { grid-template-columns: repeat(2,minmax(0,1fr)); }
          .df-overview { grid-template-columns: 1fr; }
        }

        @media(max-width:700px) {
          .df-sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            width: 275px;
            transform: translateX(-105%);
            overflow-y: auto;
            box-shadow: 8px 0 25px #16002b44;
          }

          .df-sidebar.open { transform: translateX(0); }
          .df-overlay.show {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 15;
            background: #13002588;
          }

          .df-topbar { height: 66px; padding: 0 13px; }
          .df-member { max-width: 48%; overflow: hidden; }
          .df-member-email { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .df-logout { padding: 9px 10px; font-size: 11px; }
          .df-content { padding: 13px; }
          .df-welcome { min-height: 130px; padding: 20px; }
          .df-welcome h1 { font-size: 22px; }
          .df-welcome p { font-size: 13px; }
          .df-welcome-art { font-size: 45px; padding: 0; }
          .df-balance { padding: 18px 12px; }
          .df-balance h2 { font-size: 29px; }
          .df-balance-icon { width: 45px; height: 45px; }
          .df-status { padding-left: 12px; }
          .df-quick-grid { gap: 7px; }
          .df-action { min-height: 90px; font-size: 11px; }
          .df-panels { grid-template-columns: 1fr; }
          .df-payment-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
          .df-footer { flex-direction: column; }
        }

        @media(max-width:370px) {
          .df-payment-grid { grid-template-columns: 1fr; }
          .df-balance-icon { display: none; }
        }
      `}</style>

      <div className="df-app">
        <div
          className={`df-overlay ${menuOpen ? "show" : ""}`}
          onClick={() => setMenuOpen(false)}
        />

        <aside className={`df-sidebar ${menuOpen ? "open" : ""}`}>
          <div className="df-brand">
            <div className="df-brand-mark">D</div>
            <h2>DollarFetch</h2>
            <p>Earn · Activate · Withdraw</p>
          </div>

          <div className="df-menu-label">MEMBER MENU</div>

          <nav className="df-nav">
            {navItems.map((item) => (
              <button
                key={item.name}
                className={activeTab === item.name ? "active" : ""}
                onClick={() => navigate(item.name)}
              >
                <span className="df-nav-icon">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>

          <div className="df-side-promo">
            <div className="df-gift">🎁</div>
            <h3>Refer & Earn</h3>
            <p>Get $0.50 for every successful referral after activation is verified.</p>
            <button onClick={() => navigate("Referrals")}>Invite Friends</button>
          </div>
        </aside>

        <section className="df-main">
          <header className="df-topbar">
            <div className="df-top-left">
              <button
                className="df-menu-button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                ☰
              </button>
            </div>

            <div className="df-member">
              <span className="df-avatar">●</span>
              <span className="df-member-email">{user.email}</span>
            </div>

            <button className="df-logout" onClick={logout}>↪ Log Out</button>
          </header>

          <main className="df-content">
            <section className="df-welcome">
              <div>
                <h1>
                  {activeTab === "Dashboard"
                    ? "Welcome to DollarFetch"
                    : activeTab}
                </h1>
                <p>Your gateway to easy online earnings</p>
              </div>
              <div className="df-welcome-art">👛</div>
            </section>

            {message && <div className="df-message">{message}</div>}

            {activeTab === "Dashboard" && (
              <>
                <
