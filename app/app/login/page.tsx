
"use client";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main style={{padding:25,background:"#f1f5fb",minHeight:"100vh",fontFamily:"Arial"}}>
      <form onSubmit={e => {
        e.preventDefault();
        alert("Supabase login will be connected next.");
      }} style={{background:"white",padding:25,borderRadius:15,maxWidth:400,margin:"40px auto"}}>
        <h1 style={{color:"#0753b8",textAlign:"center"}}>BWK</h1>
        <h2>DollarFetch Login</h2>
        <p>Email address</p>
        <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:"100%",padding:12,boxSizing:"border-box"}}/>
        <p>Password</p>
        <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:"100%",padding:12,boxSizing:"border-box"}}/>
        <button style={{width:"100%",padding:14,marginTop:20,background:"#0753b8",color:"white",border:0,borderRadius:8}}>Log in</button>
        <p>New member? <a href="/register">Register here</a></p>
      </form>
    </main>
  );
}
