
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main style={{maxWidth: 400, margin: "50px auto", padding: 20, fontFamily: "Arial"}}>
      <h1 style={{color: "#0753b8"}}>BWK</h1>
      <h2>DollarFetch Login</h2>

      <form onSubmit={login}>
        <label>Email address</label>
        <input
          required
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{display:"block", width:"100%", padding:12, margin:"10px 0 20px", boxSizing:"border-box"}}
        />

        <label>Password</label>
        <input
          required
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{display:"block", width:"100%", padding:12, margin:"10px 0 20px", boxSizing:"border-box"}}
        />

        <button disabled={loading} style={{width:"100%", padding:14}}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p>{message}</p>
      <a href="/register">Create an account</a>
    </main>
  );
}
