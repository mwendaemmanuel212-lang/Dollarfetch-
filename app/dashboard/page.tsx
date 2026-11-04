"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Screen =
  | "Home"
  | "Earnings"
  | "Rewards"
  | "Settings"
  | "Activation"
  | "Deposit"
  | "Withdraw";

const paymentMethods = [
  { id: "M-PESA", note: "Safaricom mobile money", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/M-PESA_LOGO-01.svg" },
  { id: "Postbank", note: "Kenya Post Office Savings Bank", logo: "https://www.google.com/s2/favicons?domain=postbank.co.ke&sz=256" },
  { id: "Equity Bank", note: "Equity Bank Kenya", logo: "https://www.google.com/s2/favicons?domain=equitybankgroup.com&sz=256" },
  { id: "Binance", note: "Cryptocurrency payment", logo: "https://cdn.simpleicons.org/binance/F0B90B" },
  { id: "Airtel Money", note: "Airtel mobile money", logo: "https://www.google.com/s2/favicons?domain=airtelkenya.com&sz=256" },
  { id: "SIM Toolkit", note: "Mobile SIM menu payment", logo: "" },
];

function Icon({ name, size = 24 }: { name: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const paths: Record<string, ReactNode> = {
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    wallet: <><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v16H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 7h14a2 2 0 0 1 2 2v2h-5a2 2 0 0 0 0 4h5v2"/><path d="M15 13h.01"/></>,
    rocket: <><path d="M5 14c-2 1-3 4-3 5 1 0 4-1 5-3"/><path d="M9 15 5 11c2-5 7-8 15-8 0 8-3 13-8 15z"/><path d="M14 10h.01"/><path d="m8 17 4-4"/></>,
    card: <><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M3 9h18M7 15h3"/></>,
    gift: <><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M2 6h20v4H2zM12 6v15M12 6H8a2 2 0 1 1 2-2c0 2 2 2 2 2zm0 0h4a2 2 0 1 0-2-2c0 2-2 2-2 2z"/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2z"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/></>,
    copy: <><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></>,
    whatsapp: <><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.7A8.5 8.5 0 1 1 20.5 11.5Z"/><path d="M8.5 8.2c.3-.6.6-.6.9-.6h.5c.2 0 .4.1.5.4l.8 1.8c.1.2.1.4-.1.6l-.6.7c-.2.2-.2.4 0 .7.6 1 1.5 1.8 2.5 2.3.3.1.5.1.7-.1l.8-1c.2-.2.4-.3.7-.2l1.7.8c.3.2.4.3.4.5 0 .3-.2 1.2-.8 1.6-.5.4-1.2.6-2 .4-1.1-.2-2.5-.9-3.9-2.1-1.2-1.1-2-2.5-2.3-3.5-.3-.9 0-1.8.3-2.3Z"/></>,
    telegram: <><path d="m21 3-7.2 18-3.7-7.1L3 10.2 21 3Z"/><path d="m10.1 13.9 5.2-5.1"/></>,
  };

  return <svg {...common}>{paths[name] || paths.wallet}</svg>;
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("Home");
  const [method, setMethod] = useState("M-PESA");
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [kesRate, setKesRate] = useState<number | null>(null);
  const [rateMessage, setRateMessage] = useState("Loading exchange rate...");
  const [referralCode, setReferralCode] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data.user) {
        router.replace("/app/login");
        return;
      }

      let currentUser = data.user;

      // Give each member a stable referral code based on their account ID.
      const savedCode = currentUser.user_metadata?.referral_code;
      const assignedCode =
        savedCode ||
        `BWK-${currentUser.id.replace(/-/g, "").toUpperCase()}`;

      setReferralCode(assignedCode);

      if (!savedCode) {
        const { data: updated, error: updateError } =
          await supabase.auth.updateUser({
            data: {
              ...currentUser.user_metadata,
              referral_code: assignedCode,
            },
          });

        if (!updateError && updated.user) {
          currentUser = updated.user;
        }
      }

      if (!mounted) return;

      setUser(currentUser);
      setLoading(false);
    }

    loadUser();

    fetch("https://open.er-api.com/v6/latest/USD")
      .then(response => response.json())
      .then(data => {
        const rate = Number(data?.rates?.KES);

        if (
          data?.result === "success" &&
          Number.isFinite(rate) &&
          rate > 0
        ) {
          setKesRate(rate);
          setRateMessage(
            "Live reference rate. Your bank or payment provider may use a different rate."
          );
        } else {
          setRateMessage(
            "Exchange rate is temporarily unavailable. Please try again later."
          );
        }
      })
      .catch(() =>
        setRateMessage(
          "Exchange rate is temporarily unavailable. Please try again later."
        )
      );

    return () => {
      mounted = false;
    };
  }, [router]);

  const memberName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Member";

  const referralLink =
    typeof window !== "undefined" && referralCode
      ? `${window.location.origin}/register?ref=${encodeURIComponent(referralCode)}`
      : "";

  async function copyReferral(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage(`${label} copied successfully.`);
    } catch {
      setCopyMessage(
        `Copy your ${label.toLowerCase()} manually.`
      );
    }
  }

  function openScreen(next: Screen) {
    setScreen(next);
    setMessage("");
    setCopyMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/app/login");
  }

  async function submitActivation() {
    setMessage("");

    if (method === "M-PESA" && !/^\+254\d{9}$/.test(phone.trim())) {
      setMessage(
        "Enter your M-PESA number with country code, e.g. +254712345678."
      );
      return;
    }

    if (method !== "M-PESA" && !reference.trim()) {
      setMessage("Enter the payment transaction reference/details.");
      return;
    }

    if (!user?.id) {
      setMessage("Please log in again.");
      return;
    }

    setBusy(true);

    const { error } = await supabase
      .from("activation_requests")
      .insert({
        user_id: user.id,
        amount: 2,
        currency: "USD",
        method,
        phone: method === "M-PESA" ? phone.trim() : reference.trim(),
        status: "pending",
      });

    setBusy(false);

    setMessage(
      error
        ? `Could not submit: ${error.message}`
        : "Payment details submitted. Your account stays Pending until an administrator verifies the payment."
    );

    if (!error) {
      setPhone("");
      setReference("");
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading DollarFetch...
      </div>
    );
  }

  return (
    <main className="df-app">
      <style>{`
        *{box-sizing:border-box}
        body{margin:0;background:#f5f0ff}
        .df-app{min-height:100vh;background:linear-gradient(180deg,#16003e 0,#2b0872 34%,#f6f1ff 34%,#f6f1ff 100%);color:#211044;font-family:Arial,Helvetica,sans-serif;padding-bottom:100px}
        .loading{min-height:100vh;display:grid;place-content:center;justify-items:center;gap:14px;color:#6730c8}
        .spinner{width:36px;height:36px;border:4px solid #e8ddff;border-top-color:#6726d9;border-radius:50%;animation:spin .8s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .wrap{width:min(100%,760px);margin:auto;padding:20px 17px 35px}
        .top{display:flex;align-items:center;justify-content:space-between;color:#fff;padding:8px 2px 24px}
        .brand{display:flex;align-items:center;gap:10px;font-size:25px;font-weight:900;letter-spacing:-1px}
        .brandmark{width:42px;height:42px;border-radius:14px;background:linear-gradient(145deg,#fff,#cbb0ff);color:#4c13bb;display:grid;place-items:center;font-size:26px;font-weight:900}
        .brand small{display:block;font-size:10px;letter-spacing:1.5px;color:#d9c9ff;margin-top:3px}
        .topicons{display:flex;gap:10px}
        .round{width:43px;height:43px;border-radius:50%;border:1px solid #ffffff55;background:#ffffff18;color:#fff;display:grid;place-items:center}
        .hero{position:relative;overflow:hidden;border-radius:25px;padding:26px 22px 28px;min-height:190px;background:radial-gradient(circle at 78% 40%,#8f3dff 0,#5412c5 35%,#25005d 100%);color:#fff;box-shadow:0 15px 32px #4a13a744}
        .hero:after{content:"";position:absolute;width:230px;height:230px;border:1px solid #ffffff28;border-radius:50%;right:-50px;top:-90px;box-shadow:0 0 0 24px #ffffff08,0 0 0 48px #ffffff08}
        .hero h1{font-size:30px;line-height:1.1;margin:12px 0 8px;max-width:70%;position:relative;z-index:1}
        .hero p{margin:0;color:#e4d4ff;font-size:14px;position:relative;z-index:1}
        .hero-art{position:absolute;right:18px;bottom:13px;font-size:94px;filter:drop-shadow(0 12px 12px #14002f88);z-index:1}
        .hero-tag{font-size:10px;letter-spacing:2px;color:#d7c2ff;font-weight:800}
        .balance{margin-top:17px;background:linear-gradient(115deg,#fff,#f0e6ff);border:1px solid #e5d5ff;border-radius:22px;padding:19px;display:flex;align-items:center;gap:14px;box-shadow:0 8px 24px #43128a12}
        .balance-icon{width:62px;height:62px;flex-shrink:0;border-radius:18px;background:linear-gradient(145deg,#8d35f4,#4a0cbd);color:#fff;display:grid;place-items:center}
        .balance-label{font-size:13px;color:#77658f;font-weight:700}
        .balance-value{font-size:34px;font-weight:900;letter-spacing:-1.5px;margin-top:4px;color:#18083d}
        .balance-note{font-size:10px;color:#8d7da2;margin-top:3px}
        .activation-prompt{margin-top:14px;padding:15px 17px;border-radius:17px;background:linear-gradient(110deg,#f0e5ff,#fff);border:1px solid #d9c1ff;color:#4d168e;font-size:12px;line-height:1.6;box-shadow:0 7px 20px #4811a20d}
        .activation-prompt b{display:block;font-size:14px;margin-bottom:3px}
        .actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:17px}
        .action{border:1px solid #e4d5ff;background:#fff;border-radius:17px;min-height:112px;padding:13px 5px;color:#4e16b7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;font-weight:800;font-size:12px;box-shadow:0 7px 18px #4811a20d}
        .action span{text-align:center;color:#2c1653}
        .referral{margin-top:17px;border-radius:22px;background:linear-gradient(110deg,#fff,#e8d7ff);border:1px solid #e0ccff;padding:18px;display:flex;align-items:center;gap:14px;box-shadow:0 8px 24px #43128a12}
        .gift{width:58px;height:58px;display:grid;place-items:center;color:#4b12b2}
        .referral small{font-size:12px;color:#705a8c;font-weight:700}
        .referral strong{display:block;font-size:32px;color:#4b12b2;margin:3px 0}
        .referral p{margin:0;font-size:11px;color:#705a8c}
        .secure{margin-top:16px;border-radius:18px;padding:16px;background:linear-gradient(110deg,#26005e,#6a19d4);color:#fff;display:flex;align-items:center;gap:14px}
        .secure b{display:block;font-size:14px}.secure small{display:block;color:#dfcaff;margin-top:4px;font-size:11px}
        .socials{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
        .social-link{display:flex;align-items:center;justify-content:center;gap:9px;padding:13px 10px;border-radius:13px;text-decoration:none;font-size:12px;font-weight:800;background:#fff;border:1px solid #e7dcf5;color:#4b168f;box-shadow:0 6px 18px #39116b0b}
        .social-link.whatsapp{color:#168b4b}.social-link.telegram{color:#168ac0}
        .section{margin-top:20px;background:#fff;border:1px solid #e9def8;border-radius:20px;padding:19px;box-shadow:0 8px 22px #39116b0c}
        .section h2{margin:0 0 7px;font-size:19px;color:#2b1154}
        .muted{font-size:12px;color:#857796;line-height:1.6;margin:0 0 15px}
        .primary{border:0;border-radius:13px;padding:14px 18px;background:linear-gradient(100deg,#7d24ed,#4300ae);color:white;font-weight:800;width:100%;font-size:14px}
        .primary:disabled{opacity:.6}
        .method-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
        .method{border:1px solid #e7ddf2;border-radius:13px;background:#fff;padding:11px;display:flex;align-items:center;gap:10px;text-align:left;color:#261244;min-width:0}
        .method.selected{border:2px solid #7524e5;background:#faf6ff;padding:10px}
        .logo{width:43px;height:40px;flex-shrink:0;display:grid;place-items:center;background:#fff;border:1px solid #f0eaf7;border-radius:9px;overflow:hidden}
        .logo img{width:100%;height:100%;object-fit:contain;padding:4px}.logo-failed:after{content:"";display:block}
        .method b{font-size:12px;display:block}.method small{font-size:9px;color:#8a7b9a;display:block;margin-top:4px}
        .field{margin:14px 0}.field label{display:block;font-size:12px;font-weight:800;margin-bottom:7px}
        .field input{width:100%;padding:13px;border:1px solid #e2d8ed;border-radius:10px;font-size:14px;color:#25133e;background:#fff}
        .payment-steps{background:#fbf8ff;border:1px solid #e7dcf8;border-radius:13px;padding:14px;margin:13px 0;color:#38205e;font-size:12px;line-height:1.7}
        .copy-number{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#fff;border:1px dashed #8b5bd2;border-radius:11px;padding:12px;margin:10px 0;font-size:20px;font-weight:900;letter-spacing:1px}
        .copy-btn{border:0;border-radius:9px;background:#5b18c7;color:#fff;padding:10px 12px;font-weight:800}
        .rate-card{background:#f8f3ff;border:1px solid #e6d8fb;border-radius:12px;padding:12px;margin:12px 0;font-size:12px;line-height:1.6}
        .notice{background:#f5edff;color:#59318e;border:1px solid #e6d7ff;border-radius:11px;padding:12px;font-size:12px;line-height:1.5;margin:13px 0}
        .message{background:#f4efff;color:#4c2382;padding:12px;border-radius:10px;font-size:12px;line-height:1.5;margin:12px 0}
        .activation-banner{display:flex;align-items:center;gap:14px;padding:17px;border-radius:18px;background:radial-gradient(circle at 85% 20%,#a66bff,#5412b8 58%,#26005e);color:#fff;margin-bottom:16px;box-shadow:0 10px 25px #5412b833}
        .activation-rocket{width:58px;height:58px;flex-shrink:0;border-radius:18px;background:#ffffff20;display:grid;place-items:center;color:#fff;animation:rocketGlow 2s ease-in-out infinite alternate}
        @keyframes rocketGlow{from{transform:translateY(2px);box-shadow:0 0 8px #d9baff55}to{transform:translateY(-4px);box-shadow:0 0 22px #e5caffaa}}
        .activation-banner b{display:block;font-size:16px}
        .activation-banner small{display:block;color:#eadcff;margin-top:4px;font-size:11px;line-height:1.5}
        .referral-tools{margin-top:14px;padding:13px;border:1px solid #e7dcf8;border-radius:13px;background:#fbf8ff}
        .referral-tools label{display:block;font-size:11px;font-weight:800;color:#5a347e;margin-bottom:7px}
        .referral-value{overflow-wrap:anywhere;background:#fff;border:1px dashed #b69ad9;border-radius:9px;padding:11px;font-size:12px;color:#32145d;margin-bottom:8px}
        .referral-copy{border:0;border-radius:9px;background:#5b18c7;color:#fff;padding:11px 13px;font-weight:800;font-size:12px;width:100%}
        .bottom{position:fixed;z-index:10;bottom:0;left:0;right:0;background:#ffffffed;backdrop-filter:blur(12px);border-top:1px solid #e9def8;display:grid;grid-template-columns:repeat(4,1fr);padding:10px max(8px,env(safe-area-inset-right)) calc(9px + env(safe-area-inset-bottom));max-width:760px;margin:auto;border-radius:20px 20px 0 0}
        .bottom button{border:0;background:transparent;color:#817198;display:grid;justify-items:center;gap:4px;font-size:10px;font-weight:700;padding:4px}
        .bottom button.active{color:#5c14c8}
        .bottom button.active:after{content:"";width:34px;height:3px;border-radius:3px;background:#6a20d7;margin-top:2px}
        .pagehead{display:flex;align-items:center;justify-content:space-between;margin:7px 0 17px;color:#fff}
        .pagehead h1{font-size:22px;margin:0}
        .back{border:1px solid #ffffff55;background:#ffffff18;color:white;border-radius:10px;padding:9px 12px}
        .rowline{display:flex;justify-content:space-between;gap:10px;padding:13px 0;border-bottom:1px solid #f0eaf6;font-size:13px}
        .rowline:last-child{border-bottom:0}
        @media(max-width:390px){.wrap{padding-left:12px;padding-right:12px}.brand{font-size:21px}.hero h1{font-size:26px}.hero-art{font-size:75px}.balance-value{font-size:29px}.actions{gap:6px}.action{font-size:10px;min-height:102px}}
      `}</style>

      <div className="wrap">
        <header className="top">
          <div className="brand">
            <div className="brandmark">D$</div>
            <div>
              DollarFetch
              <small>POWERED BY BWK SOLUTIONS</small>
            </div>
          </div>

          <div className="topicons">
            <button className="round" aria-label="Notifications">
              <Icon name="bell" />
            </button>
            <button
              className="round"
              aria-label="Profile"
              onClick={() => openScreen("Settings")}
            >
              <Icon name="user" />
            </button>
          </div>
        </header>

        {screen === "Home" && <>
          <section className="hero">
            <div className="hero-tag">YOUR MEMBER DASHBOARD</div>
            <h1>Hello, {memberName}!</h1>
            <p>Let's grow your earnings today.</p>
            <div className="hero-art">$</div>
          </section>

          <section className="balance">
            <div className="balance-icon">
              <Icon name="wallet" size={32} />
            </div>
            <div>
              <div className="balance-label">Your Balance</div>
              <div className="balance-value">$0.00</div>
              <div className="balance-note">Wallet balance</div>
            </div>
          </section>

          <section className="actions">
            <button className="action" onClick={() => openScreen("Activation")}>
              <Icon name="rocket" size={29} />
              <span>Activate Account</span>
            </button>
            <button className="action" onClick={() => openScreen("Deposit")}>
              <Icon name="card" size={29} />
              <span>Deposit</span>
            </button>
            <button className="action" onClick={() => openScreen("Withdraw")}>
              <Icon name="wallet" size={29} />
              <span>Withdraw</span>
            </button>
            <button className="action" onClick={() => openScreen("Rewards")}>
              <I
