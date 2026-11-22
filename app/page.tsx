
"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const timer = window.setTimeout(
      () => setShowActions(true),
      reduced ? 300 : 11000
    );

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="stage">
      <div className="plane" aria-hidden="true">
        <svg viewBox="0 0 160 70">
          <path d="M22 34 L8 8 L32 8 L46 32Z" fill="#ff3b6b" stroke="#1b2a4a" strokeWidth="2"/>
          <path d="M8 38 Q30 27 92 29 L142 33 Q158 36 142 42 L92 45 Q30 47 8 38Z" fill="#f2f6fc" stroke="#1b2a4a" strokeWidth="2"/>
          <path d="M72 38 L52 66 L82 66 L106 40Z" fill="#3aa0ff" stroke="#1b2a4a" strokeWidth="2"/>
          <circle cx="104" cy="35" r="3" fill="#1b2a4a"/>
          <circle cx="116" cy="35.5" r="3" fill="#1b2a4a"/>
          <circle cx="128" cy="36" r="3" fill="#1b2a4a"/>
        </svg>
      </div>

      <section className="welcome">
        <div className="spin">
          <div className="board">
            <div className="bulbs">
              {Array.from({ length: 24 }).map((_, i) => (
                <i key={i} style={{ animationDelay: `${-i * 0.15}s` }} />
              ))}
            </div>

            <h2>WELCOME TO</h2>
            <h1>DOLLARFETCH</h1>

            <div className="bulbs">
              {Array.from({ length: 24 }).map((_, i) => (
                <i key={i} style={{ animationDelay: `${-i * 0.15}s` }} />
              ))}
            </div>
          </div>
        </div>

        <div className={`actions ${showActions ? "visible" : ""}`}>
          <p>Welcome to DollarFetch. Your journey starts here.</p>

          <a href="/app/login" className="login">
            LOGIN
          </a>

          <a href="/register" className="register">
            CREATE ACCOUNT
          </a>

          <small>POWERED BY BWK SOLUTIONS</small>
        </div>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .stage {
          min-height: 100vh;
          min-height: 100dvh;
          background: #05070f;
          color: white;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .plane {
          position: absolute;
          top: 8%;
          left: 0;
          width: clamp(240px, 55vw, 460px);
          animation: fly 4.2s linear forwards;
        }

        .plane svg {
          width: 100%;
          display: block;
        }

        @keyframes fly {
          from { transform: translateX(-600px); }
          to { transform: translateX(calc(100vw + 600px)); }
        }

        .welcome {
          width: 100%;
          max-width: 750px;
          text-align: center;
          position: relative;
          z-index: 2;
          perspective: 1200px;
        }

        .spin {
          opacity: 0;
          animation:
            enter 2.8s cubic-bezier(.2,.8,.2,1) 2.4s forwards,
            spinY 5s ease-in-out 5.2s 1;
        }

        @keyframes enter {
          from {
            opacity: 0;
            transform: translateX(-110vw) scale(.7);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes spinY {
          0% { transform: rotateY(0); }
          100% { transform: rotateY(360deg); }
        }

        .board {
          background: #0b1226;
          border: 3px solid #2a3a6b;
          border-radius: 22px;
          padding: clamp(20px, 5vw, 45px) 12px;
          box-shadow: 0 18px 60px rgba(11,18,38,.5);
        }

        h2, h1 {
          font-family: Impact, "Arial Black", sans-serif;
          white-space: nowrap;
          margin: 8px 0;
          color: white;
          text-shadow: 0 0 8px white, 0 0 25px #fff;
          animation: glow 2.4s ease-in-out infinite;
        }

        h2 {
          font-size: clamp(22px, 6vw, 45px);
        }

        h1 {
          font-size: clamp(27px, 8vw, 65px);
        }

        @keyframes glow {
          50% {
            opacity: .75;
            text-shadow: 0 0 30px white;
          }
        }

        .bulbs {
          display: flex;
          justify-content: space-between;
          gap: 5px;
          margin: 12px 0;
        }

        .bulbs i {
          width: 9px;
          height: 9px;
          flex-shrink: 0;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 10px white, 0 0 20px white;
          animation: blink 1.6s infinite;
        }

        @keyframes blink {
          50% { opacity: .2; }
        }

        .actions {
          opacity: 0;
          transform: translateY(20px);
          pointer-events: none;
          margin: 35px auto 0;
          max-width: 360px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          transition: opacity .8s ease, transform .8s ease;
        }

        .actions.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .actions p {
          font-size: 14px;
          color: #d4d8e8;
          margin-bottom: 8px;
        }

        .actions a {
          display: block;
          padding: 16px;
          border-radius: 12px;
          font-weight: 900;
          font-size: 15px;
          text-decoration: none;
          letter-spacing: 1px;
        }

        .login {
          background: #20c779;
          color: #06150e;
        }

        .register {
          background: transparent;
          border: 2px solid #d6b65f;
          color: #f1d88d;
        }

        .actions small {
          margin-top: 10px;
          color: #b7a16b;
          font-size: 10px;
          letter-spacing: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
          }

          .spin, .actions {
            opacity: 1;
            transform: none;
          }

          .actions {
            pointer-events: auto;
          }
        }
      `}</style>
    </main>
  );
}
