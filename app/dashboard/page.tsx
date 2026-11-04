
"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Tab =
  | "Dashboard"
  | "Activation"
  | "Deposit"
  | "Withdraw"
  | "Transactions"
  | "Referrals"
  | "Profile";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("2");
  const [paymentMethod, setPaymentMethod] = useState("M-PESA");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const methods = [
    "M-PESA",
    "Postbank",
    "Equity Bank",
    "Binance",
    "Airtel Money",
    "SIM Toolkit",
  ];

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/app/login");
        return;
      }

      setUser(data.user);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/app/login");
  };

  const copyReferral = async () => {
    if (!referralCode) {
      setMessage("Your referral code is not available yet.");
      return;
    }

    await navigator.clipboard.writeText(
      `${window.location.origin}/app/register?ref=${referralCode}`
    );

    setMessage("Referral link copied.");
  };

  const submitActivation = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("activation_requests")
      .insert({
        user_id: user.id,
        amount: Number(amount),
        currency: "USD",
        status: "pending",
      });

    if (error) {
      setMessage("Could not submit your request. Please try again.");
      return;
    }

    setMessage("Request submitted. Wait for administrator verification.");
  };

  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: "#f3f6fc",
      color: "#17243b",
      fontFamily: "Arial, sans-serif",
    },
    header: {
      background: "#102d69",
      color: "#fff",
      padding: "18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "12px",
    },
    logo: {
      fontSize: "23px",
      fontWeight: 800,
      letterSpacing: "1px",
    },
    content: {
      maxWidth: "1100px",
      margin: "auto",
      padding: "20px",
    },
    card: {
      background: "#fff",
      borderRadius: "14px",
      padding: "20px",
      marginBottom: "16px",
      boxShadow: "0 3px 15px rgba(20,40,80,0.06)",
    },
    button: {
      background: "#1769e0",
      color: "#fff",
      border: "none",
      borderRadius: "9px",
      padding: "12px 17px",
      fontWeight: 700,
      cursor: "pointer",
    },
    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #d8e0ed",
      borderRadius: "8px",
      marginTop: "8px",
      marginBottom: "14px",
      boxSizing: "border-box",
    },
  };
  
