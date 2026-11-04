
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [name, setName] = useState("Member");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("Not provided");
  const [tab, setTab] = useState("Dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/app/login";
        return;
      }

      setName(data.user.user_metadata?.full_name || "Member");
      setEmail(data.user.email || "");
      setPhone(data.user.user_metadata?.phone || "Not provided");
      setLoading(false);
    });
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/app/login";
  }

  const purple = "#6500bd";
  const dark = "#31006b";
  const light = "#f6efff";

  const menu = [
    "Dashboard",
    "Deposit",
    "Withdraw",
    "Transactions",
    "Profile"
  ];

  if (loading) {
    return <main style={{padding:30}}>Loading your account...</main>;
  }

  return (
    <main style={{
      minHeight:"100vh",
      background:light,
      color:dark,
      fontFamily:"Arial, sans-serif"
    }}>

      <header style={{
        background:"linear-gradient(120deg,#31006b,#8b00df)",
        color:"white",
        padding:20
      }}>
        <h2 style={{margin:0}}>BWK · DollarFetch</h2>
        <p style={{marginBottom:0}}>Simple. Secure. Reliable.</p>
      </header>

      <section style={{
        maxWidth:1100,
        margin:"auto",
        padding:18
      }}>

        <h2>Welcome back, {name}!</h2>
        <p>Manage your DollarFetch account below.</p>

        <div style={{
          background:"linear-gradient(110deg,#390078,#8500db)",
          color:"white",
          padding:25,
          borderRadius:18,
          marginTop:20
        }}>
          <p>AVAILABLE BALANCE</p>
          <h1 style={{fontSize:42,margin:"10px 0"}}>$0.00</h1>
          <small>Demo balance only — real payments not connected.</small>
        </div>

        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(135px,1fr))",
          gap:10,
          marginTop:20
        }}>
          {menu.map(item => (
            <button
              key={item}
              onClick={() => setTab(item)}
              style={{
                padding:16,
                borderRadius:12,
                border:"1px solid #d9b8ff",
                background:tab === item ? purple : "white",
                color:tab === item ? "white" : dark,
                fontWeight:"bold",
                cursor:"pointer"
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <div style={{
          background:"white",
          padding:22,
          borderRadius:16,
          marginTop:22,
          boxShadow:"0 3px 15px #4b008210"
        }}>

          {tab === "Dashboard" && (
            <>
              <h2>Account Overview</h2>
              <p><b>Member Name:</b> {name}</p>
              <p><b>Email Address:</b> {email}</p>
              <p><b>M-PESA Phone:</b> {phone}</p>
              <p><b>Available Balance:</b> $0.00</p>
              <p><b>Account Status:</b> Active</p>
              <hr />
              <h3>Recent Activity</h3>
              <p>No transactions yet.</p>
            </>
          )}

          {tab === "Deposit" && (
            <>
              <h2>Deposit Funds</h2>
              <h1>$0.00</h1>
              <p>Account currency: USD ($)</p>
              <p>M-PESA STK Push will be connected later.</p>
              <p style={{color:"#a45b00",fontWeight:"bold"}}>
                Deposits are not yet enabled.
              </p>
            </>
          )}

          {tab === "Withdraw" && (
            <>
              <h2>Withdraw Funds</h2>
              <p>Available balance: $0.00</p>
              <p>All withdrawal requests must receive administrator authorization.</p>
              <p style={{color:"#a45b00",fontWeight:"bold"}}>
                Withdrawals are not yet enabled.
              </p>
            </>
          )}

          {tab === "Transactions" && (
            <>
              <h2>Transaction History</h2>
              <p>No transactions yet.</p>
              <p>Your deposits and withdrawals will appear here.</p>
              <p>Currency: USD ($)</p>
            </>
          )}

          {tab === "Profile" && (
            <>
              <h2>My Profile</h2>
              <p><b>Name:</b> {name}</p>
              <p><b>Email:</b> {email}</p>
              <p><b>Phone:</b> {phone}</p>
              <p><b>Account Currency:</b> USD ($)</p>
            </>
          )}

        </div>

        <button onClick={logout} style={{
          background:dark,
          color:"white",
          border:0,
          borderRadius:10,
          padding:15,
          width:"100%",
          marginTop:20,
          fontWeight:"bold"
        }}>
          Log out
        </button>

        <footer style={{
          textAlign:"center",
          padding:25,
          color:"#63319a"
        }}>
          Powered by <b>BWK Manny</b> © 2026
        </footer>

      </section>
    </main>
  );
}
