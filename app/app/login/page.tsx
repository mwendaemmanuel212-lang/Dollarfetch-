
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    eyeoff: <><path d="m3 3 18 18"/><path d="M10.6 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7a15 15 0 0 1-4 4.5M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a9 9 0 0 0 3-.5"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>
  };

  return (
    <svg width="21" height="21" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
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
        welcome: "Karibu Tena",
        subtitle: "Ingia kwenye akaunti yako.",
        email: "Anwani ya Barua Pepe",
        password: "Nenosiri",
        remember: "Nikumbuke",
        forgot: "Umesahau Nenosiri?",
        login: "Ingia",
        signup: "Jisajili",
        noaccount: "Huna akaunti?",
        reset: "Tuma Kiungo",
        newpassword: "Nenosiri Jipya",
        update: "Badilisha Nenosiri"
      }
    : {
        welcome: "Welcome Back",
        subtitle: "Login to your account.",
        email: "Email Address",
        password: "Password",
        remember: "Remember me",
        forgot: "Forgot password?",
        login: "Login",
        signup: "Create Account",
        noaccount: "New to DollarFetch?",
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
  const text = error.message.toLowerCase();

  setMessage(
    text.includes("banned") || text.includes("ban")
      ? "Unable to login"
      : error.message
  );

  return;
    }

    if (data.user) {
  await supabase.rpc("record_member_login");
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
    setMessage(
      error
        ? error.message
        : "Password recovery email sent. Check your inbox."
    );
  }

  async function updatePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (newPassword.length < 8) {
      setMessage("Password must contain at least 8 characters.");
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

    setNewPassword("");
    setPassword("");
    setMode("login");
    setMessage("Password updated successfully.");
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
    <main className="page">

      <header className="topbar">
        <a href="/" className="brand">
          <div className="logo">
            <span>D</span>
            <small>$</small>
          </div>
          <div className="brand-text">
            <strong>DollarFetch</strong>
            <small>POWERED BY BWK SOLUTIONS</small>
          </div>
        </a>

        <select
          className="language"
          value={language}
          onChange={e => setLanguage(e.target.value)}
          aria-label="Language"
        >
          <option value="EN">EN</option>
          <option value="SW">SW</option>
        </select>
      </header>

      <section className="login-area">

        <div className="welcome">
          <div className="welcome-mark">
            <span>D</span><small>$</small>
          </div>

          <h1>
            {mode === "reset" ? "Reset Password" : words.welcome}
          </h1>

          <p>{mode === "reset"
            ? "Choose a new password."
            : words.subtitle}</p>
        </div>

        <div className="card">

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
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={words.email}
                />
              </label>

              <label className="field">
                <Icon name="lock"/>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={words.password}
                />

                <button
                  type="button"
                  className="eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Show or hide password"
                >
                  <Icon name={showPassword ? "eyeoff" : "eye"}/>
                </button>
              </label>

              <div className="options">
                <label className="remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                  />
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

              <button
                className="login-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Please wait..." : words.login}
                <Icon name="arrow"/>
              </button>
            </form>
          )}

          {message && (
            <div className="message">{message}</div>
          )}

          {mode === "login" && (
            <>
              <div className="divider">
                <span/> OR <span/>
              </div>

              

              <div className="register">
                <span>{words.noaccount}</span>
                <a href="/register">
                  {words.signup}
                </a>
              </div>
            </>
          )}

          {mode === "reset" && (
            <button
              type="button"
              className="back"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              Back to Login
            </button>
          )}

        </div>
      </section>

      <footer>
        <span>© 2026 DollarFetch</span>
        <span>Powered by BWK Solutions</span>
      </footer>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          min-height: 100dvh;
          background: #080d0b;
          color: #ffffff;
          font-family: Arial, Helvetica, sans-serif;
          padding: 25px 20px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .page::before {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          background: #087b48;
          opacity: .09;
          filter: blur(100px);
          border-radius: 50%;
          top: 15%;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
        }

        .topbar {
          width: 100%;
          max-width: 950px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
          text-decoration: none;
          color: white;
        }

        .logo {
          width: 43px;
          height: 43px;
          border: 1.5px solid #b99a4c;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          color: #23c77c;
          font-size: 28px;
          font-weight: 900;
        }

        .logo small {
          position: absolute;
          color: #d9bb70;
          font-size: 12px;
          right: 3px;
          top: 2px;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .brand-text strong {
          font-size: 19px;
          letter-spacing: -.5px;
        }

        .brand-text small {
          color: #b7a16b;
          font-size: 8px;
          letter-spacing: 1.3px;
        }

        .language {
          background: #111b16;
          color: white;
          border: 1px solid #263b30;
          border-radius: 9px;
          padding: 9px 11px;
          outline: none;
        }

        .login-area {
          width: 100%;
          max-width: 420px;
          margin: auto;
          position: relative;
          z-index: 1;
        }

        .welcome {
          text-align: center;
          margin-bottom: 30px;
        }

        .welcome-mark {
          width: 66px;
          height: 66px;
          border-radius: 19px;
          margin: 0 auto 23px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #10271b;
          border: 1px solid #315e43;
          color: #38d58b;
          font-size: 39px;
          font-weight: 900;
          position: relative;
        }

        .welcome-mark small {
          position: absolute;
          color: #d5b76c;
          font-size: 15px;
          top: 5px;
          right: 8px;
        }

        .welcome h1 {
          margin: 0 0 9px;
          font-size: 29px;
          font-weight: 700;
          letter-spacing: -.7px;
        }

        .welcome p {
          margin: 0;
          color: #89958d;
          font-size: 14px;
        }

        .card {
          padding: 27px 22px;
          background: #101713;
          border: 1px solid #263b30;
          border-radius: 17px;
          box-shadow: 0 18px 45px rgba(0,0,0,.25);
        }

        .field {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 55px;
          padding: 0 14px;
          border: 1px solid #304438;
          background: #0b110d;
          border-radius: 10px;
          margin-bottom: 15px;
          color: #43c987;
        }

        .field:focus-within {
          border-color: #20b975;
        }

        .field input {
          flex: 1;
          min-width: 0;
          background: transparent;
          border: 0;
          outline: 0;
          color: white;
          font-size: 14px;
        }

        .field input::placeholder {
          color: #7d8981;
        }

        .eye {
          display: flex;
          background: none;
          border: none;
          color: #89958d;
          cursor: pointer;
          padding: 3px;
        }

        .options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin: 5px 0 23px;
        }

        .remember {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: #aeb9b1;
        }

        .remember input {
          accent-color: #16b86c;
          width: 15px;
          height: 15px;
        }

        .forgot {
          border: 0;
          background: none;
          color: #36cf87;
          font-size: 12px;
          cursor: pointer;
        }

        .login-button {
          width: 100%;
          height: 54px;
          border: 0;
          border-radius: 10px;
          background: #16a765;
          color: white;
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
        }

        .login-button:active {
          background: #128852;
        }

        button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #77837a;
          font-size: 11px;
          margin: 23px 0;
        }

        .divider span {
          flex: 1;
          height: 1px;
          background: #29372e;
        }

        .google-button {
          width: 100%;
          height: 50px;
          border: 1px solid #35443a;
          border-radius: 10px;
          background: #151e18;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          font-size: 14px;
          cursor: pointer;
        }

        .google-button b {
          background: white;
          color: #4285f4;
          width: 23px;
          height: 23px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 15px;
        }

        .register {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 24px;
          font-size: 13px;
          color: #929e95;
        }

        .register a {
          color: #39d28b;
          font-weight: 700;
          text-decoration: none;
        }

        .message {
          padding: 12px;
          margin-top: 15px;
          border-radius: 8px;
          background: #192a20;
          color: #a5edc4;
          font-size: 13px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .back {
          display: block;
          margin: 18px auto 0;
          background: none;
          border: 0;
          color: #38d58b;
          cursor: pointer;
        }

        footer {
          width: 100%;
          max-width: 950px;
          margin: 35px auto 0;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          color: #65736a;
          font-size: 10px;
          position: relative;
          z-index: 1;
        }

        @media(max-width: 380px) {
          .page {
            padding: 20px 14px;
          }

          .card {
            padding: 23px 16px;
          }

          .welcome h1 {
            font-size: 26px;
          }
        }
                .page {
          background: #100b24;
        }

        .page::before {
          background: #6d28d9;
        }

        .logo {
          border-color: #8b5cf6;
          color: #c4b5fd;
        }

        .logo small,
        .brand-text small {
          color: #c4b5fd;
        }

        .welcome-mark {
          background: #211342;
          border-color: #6d28d9;
          color: #c4b5fd;
        }

        .welcome-mark small {
          color: #ddd6fe;
        }

        .card {
          background: #17102b;
          border-color: #49366f;
        }

        .field {
          background: #100b24;
          border-color: #49366f;
          color: #a78bfa;
        }

        .field:focus-within {
          border-color: #8b5cf6;
        }

        .login-button {
          background: #7c3aed;
        }

        .login-button:active {
          background: #6d28d9;
        }

        .forgot,
        .register a,
        .back {
          color: #c4b5fd;
        }

        .message {
          background: #2a1c49;
          color: #e9ddff;
        }
      `}</style>
    </main>
  );
                                                }
