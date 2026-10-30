
"use client";

import { useState } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setMessage("Registration page is working! Account creation will be connected securely soon.");
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#eef3fa",
      padding: 20,
      fontFamily: "Arial"
    }}>
      <form onSubmit={handleRegister} style={{
        background: "white",
        padding: 25,
        borderRadius: 15,
        width: "100%",
        maxWidth: 400
      }}>
        <h1 style={{textAlign: "center", color: "#0753b8"}}>BWK</h1>
        <h2 style={{textAlign: "center"}}>Join DollarFetch</h2>
        <p>Create your member account</p>

        <label>Full name</label>
        <input required value={name} onChange={e => setName(e.target.value)}
          style={fieldStyle} placeholder="Your full name" />

        <label>Email address</label>
        <input required type="email" value={email}
          onChange={e => setEmail(e.target.value)}
          style={fieldStyle} placeholder="Your email" />

        <label>M-Pesa phone number</label>
        <input required type="tel" value={phone}
          onChange={e => setPhone(e.target.value)}
          style={fieldStyle} placeholder="07XXXXXXXX" />

        <label>Password</label>
        <input required type="password" minLength={8}
          value={password} onChange={e => setPassword(e.target.value)}
          style={fieldStyle} placeholder="At least 8 characters" />

        <button type="submit" style={{
          width: "100%", padding: 14, marginTop: 20,
          background: "#0753b8", color: "white",
          border: 0, borderRadius: 8, fontWeight: "bold"
        }}>
          Create account
        </button>

        {message && <p role="status">{message}</p>}

        <p style={{textAlign: "center"}}>
          Already registered? <a href="/login">Log in</a>
        </p>
        <p style={{textAlign: "center"}}>
          <a href="/">Back to home</a>
        </p>
      </form>
    </main>
  );
}

const fieldStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: 12,
  marginTop: 7,
  marginBottom: 15,
  border: "1px solid #ccd5e2",
  borderRadius: 8
};
          
