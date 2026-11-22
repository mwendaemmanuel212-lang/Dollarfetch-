"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function InstallPage() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setInstalled(standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setMessage("DollarFetch has been installed successfully.");
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        setMessage("Please refresh this page and try again.");
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) {
      setMessage(
        ios
          ? "In Safari, tap Share, then Add to Home Screen."
          : "Open Chrome's three-dot menu and choose Install app or Add to Home screen."
      );
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);

    setMessage(
      choice.outcome === "accepted"
        ? "Follow the prompt to finish installing DollarFetch."
        : "Installation was not completed. You can try again."
    );
  };

  return (
    <main style={{
      minHeight: "100svh",
      display: "grid",
      placeItems: "center",
      padding: "28px 18px",
      color: "#f8f5e9",
      background: "radial-gradient(circle at 50% 8%, #14543d, #092b20 55%, #04150f)",
      fontFamily: "Arial, Helvetica, sans-serif"
    }}>
      <section style={{
        width: "100%",
        maxWidth: 440,
        padding: "34px 24px",
        textAlign: "center",
        borderRadius: 28,
        border: "1px solid rgba(226,190,91,.55)",
        background: "linear-gradient(155deg,#124230,#051d15)",
        boxShadow: "0 24px 70px rgba(0,0,0,.4)"
      }}>
        <img
          src="/icon-192.png"
          alt="DollarFetch lion coin"
          width="112"
          height="112"
          style={{ borderRadius: 25, margin: "0 auto 22px", display: "block" }}
        />

        <div style={{ color: "#e7c66e", fontSize: 25, fontWeight: 900, letterSpacing: 2 }}>
          DOLLARFETCH
        </div>

        <div style={{ color: "#c8d8ce", fontSize: 10, letterSpacing: 3, marginTop: 7 }}>
          POWERED BY BWK SOLUTIONS
        </div>

        <h1 style={{ color: "#f0d58b", fontSize: 29, margin: "30px 0 12px" }}>
          Install the App
        </h1>

        <p style={{ color: "#e0e9e2", fontSize: 15, lineHeight: 1.7 }}>
          Add DollarFetch to your home screen for quick and convenient access.
        </p>

        <button
          type="button"
          onClick={installApp}
          disabled={installed}
          style={{
            width: "100%",
            border: 0,
            borderRadius: 999,
            padding: "17px 20px",
            color: "#10271b",
            background: installed ? "#b8c9bd" : "linear-gradient(100deg,#f8e8ad,#d6a83e)",
            fontSize: 16,
            fontWeight: 900,
            cursor: installed ? "default" : "pointer"
          }}
        >
          {installed ? "DOLLARFETCH IS INSTALLED" : "INSTALL DOLLARFETCH"}
        </button>

        {message && (
          <p role="status" style={{ color: "#f5df9d", fontSize: 13, lineHeight: 1.6 }}>
            {message}
          </p>
        )}

        {!installed && (
          <div style={{
            marginTop: 24,
            padding: 17,
            borderRadius: 17,
            textAlign: "left",
            background: "rgba(255,255,255,.07)",
            color: "#d9e5dc",
            fontSize: 13,
            lineHeight: 1.8
          }}>
            <strong style={{ color: "#f0d58b" }}>If no prompt appears:</strong>
            <p>
              {ios
                ? "In Safari, tap Share, then select Add to Home Screen."
                : "In Chrome, tap the three dots (⋮), then choose Install app or Add to Home screen."}
            </p>
          </div>
        )}

        <Link href="/app/login" style={{
          display: "inline-block",
          marginTop: 25,
          color: "#f0d58b",
          fontSize: 13,
          fontWeight: 700,
          textDecoration: "none"
        }}>
          Continue to DollarFetch →
        </Link>
      </section>
    </main>
  );
            }
