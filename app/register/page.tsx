
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: phone
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

  const style = {
    display: "block",
    width: "100%",
    padding: 12,
    margin: "8px 0 16px",
    boxSizing: "border-box" as const
  };

  return (
    <main style={{maxWidth: 400, margin: "40px auto", padding: 20, fontFamily: "Arial"}}>
      <h1>BWK</h1>
      <h2>Join DollarFetch</h2>

      <form onSubmit={register}>
        <label>Full name</label>
        <input required style={style} value={name} onChange={e => setName(e.target.value)} />

        <label>Email</label>
        <input required type="email" style={style} value={email} onChange={e => setEmail(e.target.value)} />

        <label>M-Pesa phone</label>
        <input required type="tel" style={style} value={phone} onChange={e => setPhone(e.target.value)} />

        <label>Password (at least 8 characters)</label>
        <input required minLength={8} type="password" style={style} value={password} onChange={e => setPassword(e.target.value)} />

        <button disabled={loading} style={{width: "100%", padding: 14}}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p>{message}</p>
      <a href="/login">Already registered? Log in</a>
    </main>
  );
}
