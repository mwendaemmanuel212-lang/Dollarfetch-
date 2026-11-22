
import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px 18px",
        color: "#ffffff",
        background:
          "radial-gradient(circle at 50% 12%, #344765, #182943 48%, #0b1424)",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          textAlign: "center",
          padding: "34px 24px",
          borderRadius: 28,
          border: "1px solid rgba(245,212,122,.55)",
          background: "linear-gradient(160deg,#23344d,#0d1829)",
          boxShadow: "0 22px 70px rgba(0,0,0,.42)",
        }}
      >
        <div
          style={{
            fontSize: 29,
            fontWeight: 900,
            letterSpacing: 3,
            color: "#F5D47A",
          }}
        >
          DOLLARFETCH
        </div>

        <div
          style={{
            fontSize: 10,
            letterSpacing: 3,
            color: "#c5cedb",
            marginTop: 8,
          }}
        >
          POWERED BY BWK SOLUTIONS
        </div>

        <div
          style={{
            margin: "30px auto 22px",
            width: 116,
            height: 116,
            borderRadius: 30,
            display: "grid",
            placeItems: "center",
            fontSize: 62,
            background: "linear-gradient(145deg,#f9e6a8,#c9922d)",
          }}
        >
          🎁
        </div>

        <div
          style={{
            color: "#F5D47A",
            fontSize: 14,
            letterSpacing: 5,
            marginBottom: 12,
          }}
        >
          ✦ WELCOME ✦
        </div>

        <h1
          style={{
            fontSize: 32,
            color: "#F5D47A",
            margin: "0 0 13px",
          }}
        >
          Welcome Aboard!
        </h1>

        <p style={{ color: "#f1f4f8", fontSize: 16 }}>
          Your journey starts here.
        </p>

        <p
          style={{
            color: "#c5cedb",
            fontSize: 13,
            lineHeight: 1.7,
            margin: "0 0 28px",
          }}
        >
          Discover opportunities, complete tasks and earn rewards with
          DollarFetch.
        </p>

        <Link
          href="/app/login"
          style={{
            display: "block",
            padding: "17px 20px",
            borderRadius: 999,
            textDecoration: "none",
            background: "linear-gradient(100deg,#F8E5A5,#D5A43B)",
            color: "#101C32",
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: 1,
          }}
        >
          GET STARTED →
        </Link>

        <div
          style={{
            fontSize: 11,
            color: "#9eabba",
            marginTop: 27,
          }}
        >
          © 2026 DollarFetch. All rights reserved.
        </div>
      </div>
    </main>
  );
}
