"use client";

import { useState } from "react";

const menu = ["Overview", "Deposit", "Withdraw", "Transactions", "Profile"];

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [notice, setNotice] = useState(false);

  function choose(item: string) {
    setActive(item);
    setNotice(item === "Deposit" || item === "Withdraw");
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <a className="brand" href="#"><span className="mark">BWK</span><b>DollarFetch</b></a>
        <p className="menu-label">MENU</p>
        <nav>{menu.map(item => <button key={item} onClick={() => choose(item)} className={active === item ? "nav active" : "nav"}>{item}</button>)}</nav>
        <div className="help"><b>Need help?</b><p>Contact the DollarFetch support team for assistance.</p></div>
        <small className="foot">BWK · DollarFetch</small>
      </aside>
      <section className="main">
        <header className="top"><div><small>MEMBER AREA</small><h1>{active}</h1></div><div className="member"><span>M</span><div><b>Member</b><small>Demo account</small></div></div></header>
        <div className="content">
          <div className="welcome"><div><small className="blue">YOUR BWK DASHBOARD</small><h2>Welcome to DollarFetch</h2><p>A simple place to view your account activity.</p></div><label>● Account preview</label></div>
          {notice && <div className="notice"><b>{active} is not connected yet.</b><p>This is a website preview. M-Pesa deposits and admin-approved withdrawals will be enabled after secure backend setup.</p></div>}
          {active === "Overview" ? <>
            <div className="stats">
              <article className="balance"><small>Available balance</small><h2>KSh 0.00</h2><p>Demo balance · no real funds</p></article>
              <article><small>Total deposits</small><h2>KSh 0.00</h2><p>No deposits recorded</p></article>
              <article><small>Pending withdrawals</small><h2>0</h2><p>Admin approval required</p></article>
            </div>
            <section className="panel"><h3>Quick actions</h3><p>Choose what you would like to do.</p><div className="actions"><button onClick={() => choose("Deposit")}><b>↓　Make a deposit</b><small>M-Pesa · coming soon</small></button><button onClick={() => choose("Withdraw")}><b>↑　Request withdrawal</b><small>Subject to admin approval</small></button></div></section>
            <section className="panel"><h3>Recent activity</h3><p>Your latest account transactions.</p><div className="activity"><b>Welcome to DollarFetch</b><span>Demo account</span><b>No transactions yet</b><span>Your activity will appear here</span></div></section>
          </> : <section className="panel empty"><h2>{active}</h2><p>{active === "Deposit" ? "M-Pesa STK Push will be connected in a later step." : active === "Withdraw" ? "Members will submit a request. An administrator must approve it before any payout." : "This section will be available after secure member authentication and backend setup."}</p><small>SETUP IN PROGRESS</small><button className="back" onClick={() => choose("Overview")}>Back to overview</button></section>}
          <footer>© 2026 DollarFetch · BWK <span>Secure account services are being set up.</span></footer>
        </div>
      </section>
    </main>
  );
}
