
export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#f8f0ff,#e6c9ff,#7100c9)",
      color: "#31006b",
      fontFamily: "Arial, sans-serif",
      padding: "25px",
      boxSizing: "border-box",
      textAlign: "center"
    }}>
      <header style={{padding: "20px"}}>
        <h1 style={{fontSize: 32}}>BWK | DollarFetch</h1>
        <p>Simple. Secure. Reliable.</p>
      </header>

      <section style={{
        maxWidth: 700,
        margin: "60px auto",
        padding: 25
      }}>
        <h1 style={{fontSize: 42}}>Hello, we are ready</h1>
        <p style={{fontSize: 18,lineHeight: 1.6}}>
          Join BWK DollarFetch today and unlock opportunities
          to earn, transact and withdraw your earnings safely.
        </p>

        <div style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 15,
          marginTop: 35
        }}>
          <a href="/register" style={{
            background: "#6500bd",
            color: "white",
            padding: "16px 35px",
            borderRadius: 12,
            textDecoration: "none",
            fontWeight: "bold"
          }}>Register</a>

          <a href="/app/login" style={{
            background: "white",
            color: "#6500bd",
            padding: "16px 35px",
            borderRadius: 12,
            border: "2px solid #6500bd",
            textDecoration: "none",
            fontWeight: "bold"
          }}>Login</a>
        </div>
      </section>

      <section style={{
        background: "white",
        borderRadius: 15,
        padding: 20,
        maxWidth: 900,
        margin: "auto"
      }}>
        <h3>Secure Platform · Fast Transactions</h3>
        <h3>Trusted Community · 24/7 Support</h3>
      </section>

      <footer style={{
        marginTop: 60,
        padding: 20,
        background: "#31006b",
        color: "white",
        borderRadius: 12
      }}>
        Powered by <strong>BWK Manny</strong> © 2026
      </footer>
    </main>
  );
}
