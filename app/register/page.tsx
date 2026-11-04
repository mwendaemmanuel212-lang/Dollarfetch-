
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+254");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const fullPhone = countryCode + phone.replace(/\D/g, "");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: fullPhone,
          country_code: countryCode
        }
      }
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      data.session
        ? "Account created successfully! You can now log in."
        : "Account created! Check your email to confirm registration."
    );
  }

  const style: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: 12,
    margin: "8px 0 16px",
    boxSizing: "border-box"
  };

  return (
    <main style={{
      maxWidth: 400,
      margin: "40px auto",
      padding: 20,
      fontFamily: "Arial"
    }}>
      <h1 style={{ color: "#073b83" }}>BWK</h1>
      <h2>Join DollarFetch</h2>

      <form onSubmit={register}>
        <label>Full name</label>
        <input required style={style} value={name}
          onChange={e => setName(e.target.value)} />

        <label>Email</label>
        <input required type="email" style={style} value={email}
          onChange={e => setEmail(e.target.value)} />

        <label>Country code</label>
        <select
          style={style}
          value={countryCode}
          onChange={e => setCountryCode(e.target.value)}
        >
          <option value="+254">Kenya (+254)</option>
          <option value="+256">Uganda (+256)</option>
          <option value="+255">Tanzania (+255)</option>
          <option value="+250">Rwanda (+250)</option>
          <option value="+1">USA/Canada (+1)</option>
          <option value="+44">United Kingdom (+44)</option>
          <option value="+27">South Africa (+27)</option>
          <option value="+234">Nigeria (+234)</option>
          <option value="+91">India (+91)</option>
          <option value="+971">UAE (+971)</option>
        </select>

        <label>M-PESA phone number</label>
        <input
          required
          type="tel"
          style={style}
          placeholder="712345678"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />

        <label>Password (at least 8 characters)</label>
        <input required minLength={8} type="password"
          style={style} value={password}
          onChange={e => setPassword(e.target.value)} />

        <button disabled={loading}
          style={{
            width: "100%",
            padding: 14,
            background: "#073b83",
            color: "white",
            border: "none",
            borderRadius: 6
          }}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p>{message}</p>
      <a href="/app/login">Already registered? Log in</a>
    </main>
  );
}
