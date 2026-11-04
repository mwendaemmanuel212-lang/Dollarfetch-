
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  const paths: Record<string, React.ReactNode> = {
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    eyeoff: <><path d="m3 3 18 18"/><path d="M10.6 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7a15 15 0 0 1-4 4.5M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a9 9 0 0 0 3-.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>,
    rocket: <><path d="M5 14c-2 1-3 4-3 6 2 0 5-1 6-3"/><path d="M9 15 6 12c1-5 6-9 15-10-1 9-5 14-10 15Z"/><circle cx="14" cy="8" r="2"/></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></>,
    gift: <><rect x="3" y="9" width="18" height="12" rx="1"/><path d="M12 9v12M3 13h18M12 9H7a2.5 2.5 0 1 1 2.5-2.5V9Zm0 0h5a2.5 2.5 0 1 0-2.5-2.5V9Z"/></>,
    support: <><path d="M3 13v-2a9 9 0 0 1 18 0v2"/><rect x="2" y="12" width="4" height="7" rx="2"/><rect x="18" y="12" width="4" height="7" rx="2"/><path d="M18 19c-1 2-3 3-6 3"/></>,
    bolt: <path d="m13 2-3 9h7L8 22l3-9H4l9-11Z"/>,
    login: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    globe: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>
  };

  return <svg {...common}>{paths[name] || paths.check}</svg>;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [language, setLanguage] = useState("EN");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("reset") === "1") {
      setMode("reset");
    }
  }, []);

  const words = language === "SW"
    ? {
        welcome: "Karibu Tena!",
        subtitle: "Ingia kwenye akaunti yako ya BWK DollarFetch.",
        email: "Anwani ya Barua Pepe",
        password: "Nenosiri",
        remember: "Nikumbuke",
        forgot: "Umesahau Nenosiri?",
        login: "Ingia",
        signup: "Jisajili Bure",
        noaccount: "Huna akaunti?",
        reset: "Tuma Kiungo cha Kurejesha",
        newpassword: "Nenosiri Jipya",
        update: "Badilisha Nenosiri"
      }
    : {
        welcome: "Welcome Back!",
        subtitle: "Log in to your BWK DollarFetch account and continue your journey.",
        email: "Email Address",
        password: "Password",
        remember: "Remember Me",
        forgot: "Forgot Password?",
        login: "Login",
        signup: "Sign Up Free",
        noaccount: "Don't have an account?",
        reset: "Send Reset Link",
        newpassword: "New Password",
        update: "Update Password"
      };

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.user) {
      window.location.assign("/dashboard");
    }
  }

  async function forgotPassword() {
    if (!email.trim()) {
      setMessage("Enter your email address first.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/app/login?reset=1`
      }
    );

    setLoading(false);
    setMessage(error ? error.message : "Password recovery email sent. Check your inbox.");
  }

  async function updatePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (newPassword.length < 8) {
      setMessage("Your new password must contain at least 8 characters.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setPassword("");
    setNewPassword("");
    setMode("login");
    setMessage("Password updated. You can now log in.");
    window.history.replaceState({}, "", "/app/login");
  }

  async function googleLogin() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
    }
  }

  return (
    <main className="login-page">
      <div className="glow glow-one" />
      <div className="glow glow-two" />

      <header className="topbar">
        <a href="/" className="brand">
          <span className="brand-symbol">B</span>
          <span className="brand-name">
            <b>BWK</b>
            <strong>DollarFetch</strong>
          </span>
        </a>

        <div className="language">
          <Icon name="globe" size={18}/>
          <select value={language} onChange={e => setLanguage(e.target.value)}>
            <option value="EN">EN</option>
            <option value="SW">SW</option>
          </select>
        </div>
      </header>

      <div className="tagline">
        <span />
        Earn <b>•</b> Withdraw <b>•</b> Grow
        <span />
      </div>

      <section className="welcome">
        <h1>
          {mode === "reset" ? "Reset Password" : words.welcome}
        </h1>
        <p>{mode === "reset"
          ? "Choose a new password for your account."
          : words.subtitle}</p>
      </section>

      <section className="benefits">
        <div><Icon name="rocket" size={30}/><span>Earn Online<br/>with Ease</span></div>
        <div><Icon name="shield" size={30}/><span>Secure &<br/>Trusted</span></div>
        <div><Icon name="gift" size={30}/><span>Get Amazing<br/>Rewards</span></div>
        <div><Icon name="support" size={30}/><span>24/7<br/>Support</span></div>
      </section>

      <section className="login-card">
        <div className="card-logo">
          <span>B</span>
        </div>

        <h2>
          {mode === "reset" ? "Create New Password" : "Login to Your Account"}
        </h2>
        <p className="card-subtitle">
          {mode === "reset"
            ? "Enter your new password below."
            : "Enter your details to continue."}
        </p>

        {mode === "reset" ? (
          <form onSubmit={updatePassword}>
            <label className="field">
              <Icon name="lock"/>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder={words.newpassword}
              />
            </label>

            <button className="login-button" disabled={loading}>
              <Icon name="check"/>
              {loading ? "Updating..." : words.update}
            </button>
          </form>
        ) : (
          <form onSubmit={login}>
            <label className="field">
              <Icon name="mail"/>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={words.email}
                autoComplete="email"
              />
            </label>

            <label className="field">
              <Icon name="lock"/>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={words.password}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="eye-button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Show or hide password"
              >
                <Icon name={showPassword ? "eyeoff" : "eye"}/>
              </button>
            </label>

            <div className="account-options">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <span><Icon name="check" size={16}/></span>
                {words.remember}
              </label>

              <button
                type="button"
                className="forgot"
                onClick={forgotPassword}
                disabled={loading}
              >
                {words.forgot}
              </button>
            </div>

            <button className="login-button" disabled={loading}>
              <Icon name="login" size={22}/>
              {loading ? "Please wait..." : words.login}
            </button>
          </form>
        )}

        {message && <div className="message">{message}</div>}

        {mode === "login" && (
          <>
            <div className="separator"><span/>or continue with<span/></div>

            <button
              type="button"
              className="social-button"
              onClick={googleLogin}
              disabled={loading}
            >
              <b className="google-icon">G</b>
              Continue with Google
            </button>

            <a
              className="social-button telegram"
              href="https://t.me/dollafetch"
              target="_blank"
              rel="noreferrer"
            >
              <b className="telegram-icon">➤</b>
              Join Telegram Community
            </a>

            <div className="signup">
              <span>{words.noaccount}</span>
              <a href="/register">
                {words.signup} <Icon name="arrow" size={17}/>
              </a>
            </div>
          </>
        )}

        {mode === "reset" && (
          <button className="back-link" onClick={() => setMode("login")}>
            Back to Login
          </button>
        )}
      </section>

      <section className="trust-row">
        <div><Icon name="shield"/><span>100% Secure<br/>& Trusted</span></div>
        <div><Icon name="bolt"/><span>Fast<br/>Transactions</span></div>
        <div><Icon name="gift"/><span>Exciting<br/>Rewards</span></div>
        <div><Icon name="support"/><span>24/7<br/>Support</span></div>
      </section>

      <footer>
        <h3>Together, we grow!</h3>
        <div className="footer-links">
          <a href="https://t.me/dollafetch" target="_blank" rel="noreferrer">Telegram</a>
          <a href="https://whatsapp.com/channel/0029VbEm5GNHAdNQQ8QEXb2f" target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
        <p>© 2026 BWK DollarFetch. All rights reserved.</p>
      </footer>

      <style jsx>{`
        * { box-sizing: border-box; }
        .login-page {
          min-height: 100vh;
          padding: 28px 18px 35px;
          position: relative;
          overflow: hidden;
          color: #fff;
          background: radial-gradient(ellipse at 50% 0%, #35105f 0%, #130522 48%, #08020f 100%);
          font-family: Arial, Helvetica, sans-serif;
        }
        .glow {
          position: absolute;
          width: 330px;
          height: 330px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: .35;
          pointer-events: none;
        }
        .glow-one { background: #8b19ff; top: -180px; left: -120px; }
        .glow-two { background: #5900b8; right: -180px; top: 380px; }
        .topbar, .tagline, .welcome, .benefits, .login-card, .trust-row, footer {
          position: relative;
          z-index: 1;
          max-width: 760px;
          margin-left: auto;
          margin-right: auto;
        }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .brand { display: flex; align-items: center; gap: 12px; color: white; text-decoration: none; }
        .brand-symbol {
          width: 55px; height: 55px; border: 2px solid #a94aff;
          border-radius: 18px; display: grid; place-items: center;
          font-size: 38px; font-weight: 900; font-style: italic;
          color: #c27aff; transform: skew(-8deg);
        }
        .brand-name { display: flex; flex-direction: column; gap: 1px; }
        .brand-name b { color: #bd75ff; font-size: 17px; letter-spacing: 2px; }
        .brand-name strong { font-size: 23px; }
        .language {
          display: flex; align-items: center; gap: 7px;
          border: 1px solid #67378e; border-radius: 30px;
          padding: 8px 12px; color: #e5c8ff;
        }
        .language select { background: transparent; color: white; border: 0; outline: 0; }
        .language option { color: black; }
        .tagline {
          display: flex; align-items: center; justify-content: center;
          gap: 13px; margin-top: 25px; color: #e6d6f5; font-size: 14px;
        }
        .tagline span { height: 1px; width: 60px; background: #8f42bd; }
        .tagline b { color: #c35cff; }
        .welcome { text-align: center; margin-top: 30px; }
        .welcome h1 { font-size: clamp(32px, 7vw, 48px); margin: 0 0 10px; font-weight: 800; }
        .welcome p { color: #cbbbd9; line-height: 1.5; margin: 0 auto; max-width: 480px; font-size: 16px; }
        .benefits {
          display: grid; grid-template-columns: repeat(4, 1fr);
          margin-top: 30px; padding: 18px 8px;
          border: 1px solid #4d286a; border-radius: 20px;
          background: rgba(255,255,255,.045);
        }
        .benefits div {
          display: flex; flex-direction: column; align-items: center;
          gap: 9px; text-align: center; color: #d69aff;
          font-size: 12px; line-height: 1.35;
        }
        .benefits div + div { border-left: 1px solid #56356e; }
        .benefits span { color: #eee4f7; }
        .login-card {
          margin-top: 26px; padding: 28px 24px;
          border: 1px solid #7938a9; border-radius: 25px;
          background: linear-gradient(145deg, rgba(73,31,105,.55), rgba(14,4,28,.88));
          box-shadow: 0 20px 65px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.08);
          backdrop-filter: blur(15px);
        }
        .card-logo {
          margin: 0 auto 13px; width: 62px; height: 62px;
          display: grid; place-items: center; border-radius: 50%;
          border: 1px solid #9b4bce; background: #251039;
          color: #d49aff; font-size: 40px; font-weight: 900; font-style: italic;
        }
        .login-card h2 { text-align: center; margin: 0; font-size: 23px; }
        .card-subtitle { text-align: center; color: #c9b8d8; margin: 8px 0 25px; font-size: 14px; }
        .field {
          display: flex; align-items: center; gap: 13px;
          width: 100%; min-height: 58px; padding: 0 16px;
          margin-bottom: 15px; border: 1px solid #68418a;
          border-radius: 15px; background: rgba(12,3,24,.5); color: #d5a1ff;
        }
        .field input {
          min-width: 0; flex: 1; border: 0; outline: 0;
          background: transparent; color: white; font-size: 15px;
        }
        .field input::placeholder { color: #a997b8; }
        .eye-button { border: 0; background: transparent; color: #d5a1ff; padding: 4px; display: flex; }
        .account-options { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin: 8px 0 22px; }
        .remember { display: flex; align-items: center; gap: 8px; color: #e9def2; font-size: 13px; }
        .remember input { position: absolute; opacity: 0; }
        .remember span {
          width: 21px; height: 21px; display: grid; place-items: center;
          border-radius: 6px; border: 1px solid #9c50d4; color: white;
        }
        .remember input:checked + span { background: #8b19e8; }
        .forgot, .back-link { border: 0; background: none; color: #c77aff; font-size: 13px; cursor: pointer; }
        .login-button {
          width: 100%; min-height: 58px; display: flex; align-items: center;
          justify-content: center; gap: 12px; border: 0; border-radius: 16px;
          background: linear-gradient(100deg, #bd38ff, #7400d9 60%, #4c00a6);
          color: white; font-size: 19px; font-weight: 700; cursor: pointer;
          box-shadow: 0 8px 25px rgba(135,0,220,.28);
        }
        button:disabled { opacity: .6; cursor: not-allowed; }
        .separator { display: flex; align-items: center; gap: 12px; margin: 25px 0 18px; color: #cdb9dd; font-size: 13px; }
        .separator span { flex: 1; height: 1px; background: #684581; }
        .social-button {
          width: 100%; min-height: 51px; display: flex; align-items: center;
          justify-content: center; gap: 12px; margin-bottom: 12px;
          border: 1px solid #7840a0; border-radius: 14px;
          color: white; text-decoration: none; background: rgba(15,5,28,.55);
          font-size: 14px; cursor: pointer;
        }
        .google-icon { font-size: 23px; color: #fff; background: #4285f4; border-radius: 50%; width: 27px; height: 27px; display: grid; place-items: center; }
        .telegram-icon { font-size: 18px; color: #fff; background: #168bd1; border-radius: 50%; width: 27px; height: 27px; display: grid; place-items: center; }
        .signup {
          display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
          gap: 8px; margin-top: 20px; padding: 15px 10px;
          border: 1px solid #67378e; border-radius: 14px;
          background: rgba(255,255,255,.035); font-size: 13px; color: #d8c9e4;
        }
        .signup a { display: flex; align-items: center; gap: 5px; color: #d18aff; font-weight: 700; text-decoration: none; }
        .message { margin-top: 15px; padding: 12px; border-radius: 10px; background: rgba(180,80,255,.13); color: #f0d9ff; font-size: 13px; line-height: 1.5; overflow-wrap: anywhere; }
        .back-link { display: block; margin: 18px auto 0; }
        .trust-row {
          display: grid; grid-template-columns: repeat(4, 1fr);
          margin-top: 30px; padding: 15px 0; gap: 5px;
        }
        .trust-row div { display: flex; align-items: center; justify-content: center; gap: 8px; color: #d39aff; }
        .trust-row span { font-size: 11px; line-height: 1.35; color: #e5d9ef; }
        footer { text-align: center; margin-top: 25px; }
        footer h3 { font-family: cursive; font-style: italic; font-size: 25px; font-weight: 500; color: #e5c6ff; }
        .footer-links { display: flex; justify-content: center; gap: 22px; }
        .footer-links a { color: #bd80e8; font-size: 12px; text-decoration: none; }
        footer p { margin-top: 18px; color: #8e7b9e; font-size: 11px; }
        @media (max-width: 480px) {
          .login-page { padding: 22px 14px 30px; }
          
.brand-symbol { width: 46px; height: 46px; font-size: 32px; }
.brand-name strong { font-size: 19px; }
.benefits { padding: 15px 2px; }
.benefits div { font-size: 10px; }
.benefits svg { width: 25px; height: 25px; }
.login-card { padding: 24px 17px; }
.trust-row span { font-size: 9px; }
.trust-row svg { width: 19px; height: 19px; }
}
`}</style>
</main>
);
}

