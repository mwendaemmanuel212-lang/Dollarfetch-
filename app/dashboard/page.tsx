"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Tab = "Dashboard" | "Activation" | "Deposit" | "Withdraw" | "Transactions" | "Referrals" | "Profile";

const payments = [
  { id: "M-PESA", mark: "M", color: "#36a843", note: "Safaricom mobile money" },
  { id: "Postbank", mark: "P", color: "#164b86", note: "Postbank payment" },
  { id: "Equity Bank", mark: "E", color: "#d52d35", note: "Equity payment" },
  { id: "Binance", mark: "◆", color: "#f3ba2f", note: "Cryptocurrency payment" },
  { id: "Airtel Money", mark: "A", color: "#e32636", note: "Airtel mobile money" },
  { id: "SIM Toolkit", mark: "SIM", color: "#596477", note: "Manual mobile payment" },
];

const tabs: { name: Tab; icon: string }[] = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Activation", icon: "✦" },
  { name: "Deposit", icon: "＋" },
  { name: "Withdraw", icon: "↗" },
  { name: "Transactions", icon: "↔" },
  { name: "Referrals", icon: "♧" },
  { name: "Profile", icon: "◎" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [method, setMethod] = useState("M-PESA");
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error || !data.user) {
        router.replace("/app/login");
        return;
      }
      setUser(data.user);
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [router]);

  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Member";
  const email = user?.email || "";
  const referralCode = user?.user_metadata?.referral_code || "";

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/app/login");
  }

  async function submitActivation() {
    setMessage("");
    if (method === "M-PESA" && !/^\+254\d{9}$/.test(phone)) {
      setMessage("Enter your M-PESA number with country code, e.g. +254712345678.");
      return;
    }
    if (method !== "M-PESA" && !reference.trim()) {
      setMessage("Enter your payment reference or transaction details.");
      return;
    }
    if (!user?.id) {
      setMessage("Please log in again.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("activation_requests").insert({
      user_id: user.id,
      amount: 2,
      currency: "USD",
      method,
      phone: method === "M-PESA" ? phone : reference,
      status: "pending",
    });
    setBusy(false);
    setMessage(error
      ? error.message
      : "Request submitted. Your account stays pending until an administrator verifies the payment.");
    if (!error) {
      setPhone("");
      setReference("");
    }
  }

  function go(next: Tab) {
    setTab(next);
    setMenuOpen(false);
    setMessage("");
  }

  if (loading) {
    return <div className="loading"><div className="spinner" />Loading DollarFetch...</div>;
  }

  return (
    <main className="app">
      <style>{`
        *{box-sizing:border-box}
        .app{min-height:100vh;background:#f5f2fa;color:#261d35;font-family:Arial,Helvetica,sans-serif}
        .loading{min-height:100vh;display:grid;place-content:center;justify-items:center;gap:14px;color:#7043ad}
        .spinner{width:36px;height:36px;border:4px solid #e5d9f4;border-top-color:#7043ad;border-radius:50%;animation:spin .8s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .layout{display:flex;min-height:100vh}
        .sidebar{width:250px;flex-shrink:0;background:linear-gradient(180deg,#25123f,#43236c);color:white;padding:23px 16px;display:flex;flex-direction:column;min-height:100vh}
        .brand{display:flex;align-items:center;gap:11px;padding:4px 8px 30px}
        .brandmark{width:43px;height:43px;border-radius:13px;background:linear-gradient(135deg,#b38af0,#7848bf);display:grid;place-items:center;font-size:22px;font-weight:900}
        .brandname{font-weight:800;font-size:18px}.brandsub{font-size:11px;color:#cbb8e5;margin-top:4px}
        .navlabel{font-size:10px;letter-spacing:1.5px;color:#ae98cb;padding:0 12px 12px;font-weight:bold}
        .nav{display:grid;gap:7px}.nav button{border:0;border-radius:10px;padding:12px;background:transparent;color:#dfd2ee;text-align:left;display:flex;gap:13px;align-items:center;cursor:pointer;font-size:14px}
        .nav button.active,.nav button:hover{background:#ffffff20;color:white}.navicon{width:20px;text-align:center;font-size:19px}
        .sidebottom{margin-top:auto}.telegram{display:block;margin-top:25px;padding:14px;border:1px solid #ffffff25;border-radius:12px;background:#ffffff13;color:white;text-decoration:none}
        .telegram b{display:block;font-size:13px;margin-bottom:5px}.telegram span{font-size:11px;color:#d0c0e5}
        .sideuser{display:flex;gap:10px;align-items:center;border-top:1px solid #ffffff25;margin-top:18px;padding:17px 4px 0}
        .avatar{width:35px;height:35px;border-radius:50%;display:grid;place-items:center;background:#e7d9fa;color:#51317d;font-weight:bold}
        .username{font-size:12px;font-weight:bold}.useremail{font-size:10px;color:#c8b7df;margin-top:4px;overflow-wrap:anywhere;max-width:150px}
        .main{flex:1;min-width:0}.topbar{height:72px;background:white;border-bottom:1px solid #eee8f5;padding:0 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:5}
        .topleft{display:flex;align-items:center;gap:13px}.menubtn{display:none;width:40px;height:40px;border:0;border-radius:9px;background:#f0e8fa;color:#60388f;font-size:22px}
        .pagetitle{font-size:18px;font-weight:800}.status{font-size:11px;font-weight:bold;color:#986300;background:#fff2d7;padding:8px 11px;border-radius:20px}
        .topright{display:flex;align-items:center;gap:12px}.content{max-width:1350px;margin:auto;padding:27px 28px 35px}
        .welcome{margin-bottom:21px}.welcome h1{font-size:25px;margin:0 0 7px}.welcome p{font-size:13px;color:#877d94;margin:0}
        .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}.card{background:white;border:1px solid #eee8f5;border-radius:15px;padding:20px;box-shadow:0 5px 18px #30204b08}
        .staticon,.actionicon{width:37px;height:37px;border-radius:10px;background:#f0e8fc;color:#7545b4;display:grid;place-items:center;font-size:19px;margin-bottom:14px}
        .statlabel{font-size:12px;color:#827990}.statvalue{font-size:27px;font-weight:800;margin:12px 0 6px}.statnote{font-size:11px;color:#948ba2}
        .section{margin-top:21px}.sectiontitle{font-size:16px;font-weight:800;margin:0 0 14px}.sub{font-size:12px;line-height:1.6;color:#857c91;margin:-6px 0 17px}
        .actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.action{border:1px solid #eee8f5;background:white;border-radius:13px;padding:16px;text-align:left;cursor:pointer;color:#302344}
        .action strong{display:block;font-size:13px;margin-bottom:5px}.action span{font-size:11px;color:#898095}
        .banner{margin-top:20px;padding:20px;border-radius:15px;background:linear-gradient(110deg,#43216e,#7849b8);color:white;display:flex;align-items:center;justify-content:space-between;gap:14px}
        .banner h3{font-size:16px;margin:0 0 7px}.banner p{font-size:12px;color:#e2d6f1;margin:0}
        .btn{border:0;border-radius:9px;padding:11px 16px;background:#7545b4;color:white;font-weight:bold;font-size:12px;cursor:pointer}
        .btn:disabled{opacity:.55}.btnlight{background:white;color:#59328e;text-decoration:none;white-space:nowrap}
        .methods{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
        .method{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:1px solid #ece6f4;border-radius:12px;background:white;padding:13px;cursor:pointer;color:#302344}
        .method.selected{border:2px solid #8050bf;background:#faf7ff;padding:12px}
        .logo{width:48px;height:43px;border-radius:10px;display:grid;place-items:center;color:white;font-weight:900;font-size:19px;flex-shrink:0}
        .methodname{font-size:13px;font-weight:800}.methodnote{font-size:10px;color:#898095;margin-top:5px}
        .field{margin:16px 0}.field label{display:block;font-size:12px;font-weight:bold;margin-bottom:7px}
        .field input{width:100%;padding:13px;border:1px solid #e5deee;border-radius:9px;background:white;color:#302344;font-size:13px}
        .notice,.message{padding:13px;border-radius:10px;font-size:12px;line-height:1.6;margin:14px 0;background:#f8f3ff;border:1px solid #e8dcf8;color:#654590}
        .empty{text-align:center;padding:35px 15px;color:#817990}.emptyicon{font-size:30px;margin-bottom:12px}.empty strong{display:block;color:#433653;font-size:14px;margin-bottom:7px}.empty p{font-size:12px;line-height:1.6;margin:0}
        .profile{padding:14px 0;border-bottom:1px solid #f0ecf5}.profilelabel{font-size:11px;color:#898095;margin-bottom:5px}.profilevalue{font-size:13px;font-weight:bold;overflow-wrap:anywhere}
        .footer{text-align:center;color:#9b93a7;font-size:10px;padding:25px 10px 5px}.footer a{color:#7545b4;text-decoration:none;font-weight:bold}
        @media(max-width:850px){.sidebar{position:fixed;z-index:20;left:0;top:0;bottom:0;transform:translateX(-105%);transition:transform .2s;box-shadow:10px 0 30px #170b2c25}.sidebar.open{transform:translateX(0)}.menubtn{display:block}.topbar{height:65px;padding:0 15px}.content{padding:21px 15px 30px}.grid{grid-template-columns:1fr}.actions{grid-template-columns:repeat(2,minmax(0,1fr))}.methods{grid-template-columns:1fr}.banner{align-items:flex-start;flex-direction:column}.status{display:none}}
        @media(max-width:390px){.welcome h1{font-size:21px}.action{padding:12px}}
      `}</style>

      <div className="layout">
        <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
          <div className="brand">
            <div className="brandmark">D</div>
            <div><div className="brandname">DollarFetch</div><div className="brandsub">Powered by BWK</div></div>
          </div>
          <div className="navlabel">MAIN MENU</div>
          <nav className="nav">
            {tabs.map((item) => (
              <button key={item.name} className={tab === item.name ? "active" : ""} onClick={() => go(item.name)}>
                <span className="navicon">{item.icon}</span>{item.name}
              </button>
            ))}
          </nav>
          <div className="sidebottom">
            <a className="telegram" href="https://t.me/dollafetch" target="_blank" rel="noreferrer">
              <b>✈ Join Our Telegram Channel</b><span>Updates and announcements</span>
            </a>
            <div className="sideuser">
              <div className="avatar">{String(name).charAt(0).toUpperCase()}</div>
              <div><div className="username">{name}</div><div className="useremail">{email}</div></div>
            </div>
          </div>
        </aside>

        <section className="main">
          <header className="topbar">
            <div className="topleft">
              <button className="menubtn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">☰</button>
              <div className="pagetitle">{tab}</div>
            </div>
            <div className="topright">
              <span className="status">● Pending activation</span>
              <button className="btn" onClick={logout}>Log out</button>
            </div>
          </header>

          <div className="content">
            {tab === "Dashboard" && (
              <>
                <div className="welcome"><h1>Welcome, {name} 👋</h1><p>Here is your DollarFetch member dashboard.</p></div>
                <div className="grid">
                  <div className="card"><div className="staticon">$</div><div className="statlabel">Wallet Balance</div><div className="statvalue">$0.00</div><div className="statnote">Demo balance — no funds credited</div></div>
                  <div className="card"><div className="staticon">✦</div><div className="statlabel">Account Status</div><div className="statvalue" style={{fontSize:21}}>Pending</div><div className="statnote">Awaiting payment verification</div></div>
                  <div className="card"><div className="staticon">♧</div><div className="statlabel">Referral Reward</div><div className="statvalue">$0.50</div><div className="statnote">Per eligible referral, subject to rules</div></div>
                </div>
                <div className="section"><div className="sectiontitle">Quick actions</div><div className="actions">
                  {tabs.slice(1).map((item) => <button className="action" key={item.name} onClick={() => go(item.name)}><div className="actionicon">{item.icon}</div><strong>{item.name}</strong><span>Open {item.name.toLowerCase()} section</span></button>)}
                </div></div>
                <div className="banner"><div><h3>Join the DollarFetch community</h3><p>Follow our Telegram channel for updates and announcements.</p></div><a className="btn btnlight" href="https://t.me/dollafetch" target="_blank" rel="noreferrer">Join Telegram</a></div>
              </>
            )}

            {tab === "Activation" && (
              <>
                <div className="welcome"><h1>Account Activation</h1><p>Submit your $2 activation payment details for administrator verification.</p></div>
                <div className="card">
                  <div className="sectiontitle">Choose payment method</div>
                  <p className="sub">Select one option below. Your account is activated only after an administrator verifies payment.</p>
                  <div className="methods">
                    {payments.map((item) => (
                      <button type="button" key={item.id} className={`method ${method === item.id ? "selected" : ""}`} onClick={() => {setMethod(item.id);setMessage("");}}>
                        <span className="logo" style={{background:item.color,color:item.id === "Binance" ? "#222" : "#fff"}}>{item.mark}</span>
                        <span><span className="methodname">{item.id}</span><span className="methodnote">{item.note}</span></span>
                        <span style={{marginLeft:"auto",color:"#8050bf"}}>{method === item.id ? "●" : "○"}</span>
                      </button>
                    ))}
                  </div>
                  {method === "M-PESA" ? (
                    <div className="field"><label>M-PESA phone number</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254712345678" inputMode="tel" /></div>
                  ) : (
                    <div className="field"><label>Payment reference / transaction details</label><input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Enter payment reference" /></div>
                  )}
                  <div className="notice">This form submits a request only. It does not make or automatically verify a payment. Confirm payment instructions with the administrator before sending money.</div>
                  {message && <div className="message">{message}</div>}
                  <button className="btn" disabled={busy} onClick={submitActivation}>{busy ? "Submitting..." : "Submit Activation Request"}</button>
                </div>
              </>
            )}

            {tab === "Deposit" && <><div className="welcome"><h1>Deposit</h1><p>Deposit services are not connected yet.</p></div><div className="card empty"><div className="emptyicon">＋</div><strong>Deposits coming soon</strong><p>Payment integration is still being prepared. Do not send money using unverified instructions.</p></div></>}
            {tab === "Withdraw" && <><div className="welcome"><h1>Withdraw</h1><p>Withdrawals require administrator authorization.</p></div><div className="card empty"><div className="emptyicon">↗</div><strong>Withdrawals are not available yet</strong><p>The withdrawal service is not connected. Future requests will require administrator review and approval.</p></div></>}
            {tab === "Transactions" && <><div className="welcome"><h1>Transactions</h1><p>Your payment and account activity.</p></div><div className="card empty"><div className="emptyicon">↔</div><strong>No transactions to display</strong><p>Transaction history will appear here when recording is connected.</p></div></>}
            {tab === "Referrals" && <><div className="welcome"><h1>Referral program</h1><p>Invite people to join DollarFetch.</p></div><div className="card"><div className="sectiontitle">Referral reward: $0.50</div><p className="sub">Rewards are subject to program rules and verification.</p>{referralCode ? <div className="field"><label>Your referral code</label><input readOnly value={String(referralCode)} /></div> : <div className="notice">Your referral code has not been generated yet.</div>}</div></>}
            {tab === "Profile" && <><div className="welcome"><h1>My Profile</h1><p>Your registered account information.</p></div><div className="card"><div className="profile"><div className="profilelabel">Full name</div><div className="profilevalue">{name}</div></div><div className="profile"><div className="profilelabel">Email address</div><div className="profilevalue">{email}</div></div><div className="profile"><div className="profilelabel">Account status</div><div className="profilevalue">Pending activation</div></div></div></>}

            <footer className="footer">© {new Date().getFullYear()} DollarFetch · Powered by BWK · <a href="https://t.me/dollafetch" target="_blank" rel="noreferrer">Telegram Channel</a></footer>
          </div>
        </section>
      </div>
    </main>
  );
    }
