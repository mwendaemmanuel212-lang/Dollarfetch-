
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

type PaymentMethod = {
  id: string;
  name: string;
  subtitle: string;
  className: string;
  mark: string;
};

const methods: PaymentMethod[] = [
  {
    id: "M-PESA",
    name: "M-PESA",
    subtitle: "Safaricom mobile money",
    className: "mpesa",
    mark: "M",
  },
  {
    id: "Postbank",
    name: "Postbank",
    subtitle: "Postbank payment",
    className: "postbank",
    mark: "P",
  },
  {
    id: "Equity Bank",
    name: "Equity Bank",
    subtitle: "Equity payment",
    className: "equity",
    mark: "E",
  },
  {
    id: "Binance",
    name: "Binance",
    subtitle: "Cryptocurrency payment",
    className: "binance",
    mark: "◆",
  },
  {
    id: "Airtel Money",
    name: "Airtel Money",
    subtitle: "Airtel mobile money",
    className: "airtel",
    mark: "A",
  },
  {
    id: "SIM Toolkit",
    name: "SIM Toolkit",
    subtitle: "Manual mobile payment",
    className: "simtoolkit",
    mark: "SIM",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [selectedMethod, setSelectedMethod] = useState("M-PESA");
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data.user) {
        router.replace("/app/login");
        return;
      }

      setUser(data.user);
      setLoading(false);
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Member";

  const email = user?.email || "";
  const referralCode = user?.user_metadata?.referral_code || "";

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/app/login");
  }

  async function submitActivation() {
    setMessage("");

    if (!selectedMethod) {
      setMessage("Please select a payment method.");
      return;
    }

    if (selectedMethod === "M-PESA" && !/^\+254\d{9}$/.test(phone)) {
      setMessage("Enter your M-PESA number with country code, e.g. +254712345678.");
      return;
    }

    if (selectedMethod !== "M-PESA" && !reference.trim()) {
      setMessage("Enter your payment reference or transaction details.");
      return;
    }

    if (!user?.id) {
      setMessage("Please log in again.");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("activation_requests")
        .insert({
          user_id: user.id,
          amount: 2,
          currency: "USD",
          method: selectedMethod,
          phone: selectedMethod === "M-PESA" ? phone : reference,
          status: "pending",
        });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Your activation request has been submitted. Your account will remain pending until an administrator verifies the payment."
        );
        setPhone("");
        setReference("");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    }

    setSubmitting(false);
  }

  function chooseTab(tab: Tab) {
    setActiveTab(tab);
    setMenuOpen(false);
    setMessage("");
  }

  if (loading) {
    return (
      <div className="df-loading">
        <div className="df-loader" />
        <p>Loading DollarFetch...</p>
      </div>
    );
  }

  const navigation: { name: Tab; icon: string }[] = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Activation", icon: "✦" },
    { name: "Deposit", icon: "＋" },
    { name: "Withdraw", icon: "↗" },
    { name: "Transactions", icon: "↔" },
    { name: "Referrals", icon: "♧" },
    { name: "Profile", icon: "◎" },
  ];

  return (
    <main className="df-app">
      <style>{`
        * { box-sizing: border-box; }
        .df-app {
          min-height: 100vh;
          background: #f5f3fb;
          color: #211b35;
          font-family: Arial, Helvetica, sans-serif;
        }
        .df-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: #6541a5;
          background: #f5f3fb;
        }
        .df-loader {
          width: 38px;
          height: 38px;
          border: 4px solid #e4d9f5;
          border-top-color: #7845c4;
          border-radius: 50%;
          animation: dfspin .8s linear infinite;
        }
        @keyframes dfspin { to { transform: rotate(360deg); } }
        .df-layout { display: flex; min-height: 100vh; }
        .df-sidebar {
          width: 255px;
          flex-shrink: 0;
          background: linear-gradient(180deg,#261345,#392064);
          color: white;
          padding: 24px 17px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .df-brand { display: flex; align-items: center; gap: 11px; padding: 4px 8px 30px; }
        .df-brand-icon {
          width: 43px; height: 43px; border-radius: 13px;
          display: grid; place-items: center;
          color: white; font-weight: 900; font-size: 21px;
          background: linear-gradient(135deg,#a77af2,#7544c1);
          box-shadow: 0 5px 16px #140a2a66;
        }
        .df-brand-name { font-weight: 800; font-size: 18px; letter-spacing: .3px; }
        .df-brand-sub { color: #c7b5e5; font-size: 11px; margin-top: 3px; }
        .df-nav-label { color: #a995ca; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; padding: 0 12px 12px; }
        .df-nav { display: grid; gap: 7px; }
        .df-nav button {
          border: 0; width: 100%; border-radius: 10px;
          padding: 12px 13px; display: flex; align-items: center;
          gap: 13px; text-align: left; cursor: pointer;
          background: transparent; color: #d9cceb; font-size: 14px;
        }
        .df-nav button:hover, .df-nav button.active {
          background: #ffffff1c; color: white;
        }
        .df-nav-icon { width: 22px; font-size: 19px; text-align: center; }
        .df-side-bottom { margin-top: auto; }
        .df-telegram {
          display: block; text-decoration: none; color: white;
          background: #ffffff16; border: 1px solid #ffffff22;
          padding: 14px; border-radius: 12px; margin-top: 24px;
        }
        .df-telegram strong { display: block; font-size: 13px; margin-bottom: 5px; }
        .df-telegram span { color: #cbbbe3; font-size: 11px; }
        .df-sidebar-user {
          display: flex; gap: 10px; align-items: center;
          border-top: 1px solid #ffffff20; margin-top: 18px; padding: 17px 5px 0;
        }
        .df-avatar {
          width: 35px; height: 35px; border-radius: 50%;
          display: grid; place-items: center; color: #4b2b78;
          background: #e5d5ff; font-weight: 800;
        }
        .df-user-name { font-size: 12px; font-weight: 700; }
        .df-user-email { color: #c2b1dc; font-size: 10px; margin-top: 4px; max-width: 145px; overflow-wrap: anywhere; }
        .df-main { min-width: 0; flex: 1; }
        .df-topbar {
          height: 76px; padding: 0 30px; background: white;
          border-bottom: 1px solid #eee9f5;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 5;
        }
        .df-top-left { display: flex; align-items: center; gap: 14px; }
        .df-menu-button {
          display: none; border: 0; background: #f0e9fa;
          color: #5a348d; border-radius: 9px; font-size: 23px;
          width: 40px; height: 40px; cursor: pointer;
        }
        .df-page-title { font-size: 18px; font-weight: 800; }
        .df-top-right { display: flex; align-items: center; gap: 12px; }
        .df-status {
          background: #fff4dc; color: #a66a00; border-radius: 20px;
          padding: 7px 11px; font-size: 11px; font-weight: 800;
        }
        .df-content { padding: 28px 30px 40px; max-width: 1400px; margin: auto; }
        .df-welcome { margin-bottom: 22px; }
        .df-welcome h1 { font-size: 25px; margin: 0 0 7px; letter-spacing: -.5px; }
        .df-welcome p { color: #817990; font-size: 13px; margin: 0; }
        .df-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; }
        .df-card {
          background: white; border: 1px solid #eee9f5; border-radius: 15px;
          padding: 20px; box-shadow: 0 5px 18px #30204b08;
        }
        .df-stat-label { color: #817990; font-size: 12px; font-weight: 600; }
        .df-stat-value { font-size: 27px; font-weight: 800; margin: 13px 0 7px; }
        .df-stat-note { color: #948ba2; font-size: 11px; }
        .df-stat-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: grid; place-items: center; font-size: 18px;
          background: #f0e8fc; color: #7848b9; margin-bottom: 15px;
        }
        .df-section-title { font-size: 16px; font-weight: 800; margin: 0 0 15px; }
        .df-section-sub { color: #857d92; font-size: 12px; margin: -7px 0 18px; line-height: 1.6; }
        .df-panel { margin-top: 20px; }
        .df-action-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 13px; }
        .df-action {
          border: 1px solid #eee8f6; background: white; border-radius: 13px;
          padding: 17px; text-align: left; cursor: pointer; color: #302344;
        }
        .df-action:hover { border-color: #a986d8; transform: translateY(-1px); }
        .df-action-icon {
          width: 38px; height: 38px; display: grid; place-items: center;
          border-radius: 11px; background: #f0e8fc; color: #7543b5;
          font-size: 19px; margin-bottom: 12px;
        }
        .df-action strong { display: block; font-size: 13px; margin-bottom: 5px; }
        .df-action span { color: #898095; font-size: 11px; }
        .df-banner {
          margin-top: 20px; padding: 20px; border-radius: 15px;
          background: linear-gradient(110deg,#43216e,#7545b4);
          color: white; display: flex; align-items: center; justify-content: space-between;
          gap: 15px;
        }
        .df-banner h3 { margin: 0 0 7px; font-size: 16px; }
        .df-banner p { margin: 0; color: #e1d3f4; font-size: 12px; line-height: 1.5; }
        .df-button {
          border: 0; border-radius: 9px; padding: 11px 16px;
          font-weight: 800; cursor: pointer; font-size: 12px;
          background: #7848bf; color: white;
        }
        .df-button:hover { filter: brightness(1.07); }
        .df-button.light { background: white; color: #59328e; white-space: nowrap; }
        .df-button:disabled { opacity: .55; cursor: not-allowed; }
        .df-method-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; }
        .df-method {
          display: flex; align-items: center; gap: 13px; padding: 14px;
          border: 1px solid #ece6f4; border-radius: 12px; background: white;
          cursor: pointer; text-align: left; width: 100%; color: #302344;
        }
        .df-method.selected { border: 2px solid #8050bf; background: #faf7ff; padding: 13px; }
        .df-logo {
          width: 48px; height: 43px; border-radius: 10px; flex-shrink: 0;
          display: grid; place-items: center; font-weight: 900; font-size: 19px;
          letter-spacing: -.5px; color: white;
        }
        .df-logo.mpesa { background: #39a844; }
        .df-logo.postbank { background: #174b8d; }
        .df-logo.equity { background: #d72b32; }
        .df-logo.binance { background: #f3ba2f; color: #222; }
        .df-logo.airtel { background: #e32636; }
        .df-logo.simtoolkit { background: #4e596d; font-size: 12px; }
        .df-method-name { font-size: 13px; font-weight: 800; }
        .df-method-sub { font-size: 10px; color: #898095; margin-top: 5px; }
        .df-field { margin: 16px 0; }
        .df-field label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 7px; }
        .df-field input, .df-field select {
          width: 100%; border: 1px solid #e5deee; border-radius: 9px;
          padding: 13px; font-size: 13px; outline: none; background: white;
          color: #302344;
        }
        .df-field input:focus { border-color: #8050bf; }
        .df-notice {
          background: #f8f3ff; border: 1px solid #e8dcf8; color: #654590;
          padding: 13px; border-radius: 10px; font-size: 12px; line-height: 1.6;
          margin: 14px 0;
        }
        .df-message {
          background: #f3edfc; border: 1px solid #dfd0f2;
          color: #573586; padding: 12px; border-radius: 9px;
          font-size: 12px; line-height: 1.5; margin: 14px 0;
        }
        .df-empty { text-align: center; padding: 35px 15px; color: #817990; }
        .df-empty-icon { font-size: 30px; margin-bottom: 12px; }
        .df-empty strong { display: block; color: #433653; font-size: 14px; margin-bottom: 7px; }
        .df-empty p { font-size: 12px; line-height: 1.6; margin: 0; }
        .df-profile-row { padding: 14px 0; border-bottom: 1px solid #f0ecf5; }
        .df-profile-label { color: #898095; font-size: 11px; margin-bottom: 5px; }
        .df-profile-value { font-size: 13px; font-weight: 700; overflow-wrap: anywhere; }
        .df-footer { text-align: center; color: #9b93a7; font-size: 10px; padding: 25px 10px 5px; }
        .df-footer a { color: #7545b4; text-decoration: none; font-weight: 700; }
        @media(max-width:850px) {
          .df-sidebar {
            position: fixed; z-index: 20; left: 0; top: 0; bottom: 0;
            transform: translateX(-105%); transition: transform .22s ease;
            box-shadow: 10px 0 30px #170b2c25;
          }
          .df-sidebar.open { transform: translateX(0); }
          .df-menu-button { display: block; }
          .df-topbar { padding: 0 16px; height: 66px; }
          .df-content { padding: 22px 16px 32px; }
          .df-grid { grid-template-columns: 1fr; }
          .df-action-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
          .df-method-grid { grid-template-columns: 1fr; }
          .df-banner { align-items: flex-start; flex-direction: column; }
          .df-top-right .df-status { display: none; }
        }
        @media(min-width:851px) {
          .df-sidebar { position: sticky; top: 0; height: 100vh; }
        }
        @media(max-width:390px) {
          .df-action-grid { grid-template-columns: 1fr 1fr; }
          .df-action { padding: 13px; }
          .df-welcome h1 { font-size: 21px; }
        }
      `}</style>

      <div className="df-layout">
        <aside className={`df-sidebar ${menuOpen ? "open" : ""}`}>
          <div className="df-brand">
            <div className="df-brand-icon">D</div>
            <div>
              <div className="df-brand-name">DollarFetch</div>
              <div className="df-brand-sub">Powered by BWK</div>
            </div>
          </div>

          <div className="df-nav-label">MAIN MENU</div>

          <nav className="df-nav">
            {navigation.map((item) => (
              <button
                key={item.name}
                className={activeTab === item.name ? "active" : ""}
                onClick={() => chooseTab(item.name)}
              >
                <span className="df-nav-icon">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>

          <div className="df-side-bottom">
            <a
              className="df-telegram"
              href="https://t.me/dollafetch"
              target="_blank"
              rel="noreferrer"
            >
              <strong>✈ Join Our Telegram Channel</strong>
              <span>Get DollarFetch updates and announcements</span>
            </a>

            <div className="df-sidebar-user">
              <div className="df-avatar">
                {String(displayName).charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="df-user-name">{displayName}</div>
                <div className="df-user-email">{email}</div>
              </div>
            </div>
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
              <div className="df-page-title">{activeTab}</div>
            </div>

            <div className="df-top-right">
              <span className="df-status">● Account pending activation</span>
              <button className="df-button" onClick={logout}>
                Log out
              </button>
            </div>
          </header>

          <div className="df-content">
            {activeTab === "Dashboard" && (
              <>
                <div className="df-welcome">
                  <h1>Welcome, {displayName} 👋</h1>
                  <p>Here is your DollarFetch member dashboard.</p>
                </div>

                <div className="df-grid">
                  <div className="df-card">
                    <div className="df-stat-icon">$</div>
                    <div className="df-stat-label">Wallet Balance</div>
                    <div className="df-stat-value">$0.00</div>
                    <div className="df-stat-note">Demo balance — no funds credited</div>
                  </div>

                  <div className="df-card">
                    <div className="df-stat-icon">✦</div>
                    <div className="df-stat-label">Account Status</div>
                    <div className="df-stat-value" style={{ fontSize: 21 }}>
                      Pending
                    </div>
                    <div className="df-stat-note">Activation awaits payment verification</div>
                  </div>

                  <div className="df-card">
                    <div className="df-stat-icon">♧</div>
                    <div className="df-stat-label">Referral Reward</div>
                    <div className="df-stat-value">$0.50</div>
                    <div className="df-stat-note">Per eligible referral, subject to program rules</div>
                  </div>
                </div>

                <div className="df-panel">
                  <div className="df-section-title">Quick actions</div>
                  <div className="df-action-grid">
                    <button className="df-action" onClick={() => chooseTab("Activation")}>
                      <div className="df-action-icon">✦</div>
                      <strong>Activate Account</strong>
                      <span>Submit your $2 activation request</span>
                    </button>
                    <button className="df-action" onClick={() => chooseTab("Deposit")}>
                      <div className="df-action-icon">＋</div>
                      <strong>Deposit</strong>
                      <span>View deposit information</span>
                    </button>
                    <button className="df-action" onClick={() => chooseTab("Withdraw")}>
                      <div className="df-action-icon">↗</div>
                    
