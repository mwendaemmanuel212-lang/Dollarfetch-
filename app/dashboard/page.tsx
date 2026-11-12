"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ActivationChat from "@/components/ActivationChat";
import SampleWithdrawalActivity from "@/components/SampleWithdrawalActivity";
type Screen = "Home" | "Earnings" | "Rewards" | "Scratch" | "Settings" | "Activation" | "Deposit" | "Withdraw";
type ActivationStatus = "checking" | "active" | "pending" | "rejected" | "not_submitted" | "unknown";

const paymentMethods = [
  { id: "SIM Toolkit", note: "Recommended M-PESA payment", logo: "" },
  { id: "Postbank", note: "Kenya Post Office Savings Bank", logo: "https://www.google.com/s2/favicons?domain=postbank.co.ke&sz=256" },
  { id: "Equity Bank", note: "Equity Bank Kenya", logo: "https://www.google.com/s2/favicons?domain=equitybankgroup.com&sz=256" },
  { id: "Binance", note: "Cryptocurrency payment", logo: "https://cdn.simpleicons.org/binance/F0B90B" },
  { id: "Airtel Money", note: "Airtel mobile money", logo: "https://www.google.com/s2/favicons?domain=airtelkenya.com&sz=256" },
];


function Icon({ name, size = 24 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, ReactNode> = {
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    wallet: <><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v16H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M4 7h14a2 2 0 0 1 2 2v2h-5a2 2 0 0 0 0 4h5v2" /><path d="M15 13h.01" /></>,
    rocket: <><path d="M5 14c-2 1-3 4-3 5 1 0 4-1 5-3" /><path d="M9 15 5 11c2-5 7-8 15-8 0 8-3 13-8 15z" /><path d="M14 10h.01" /><path d="m8 17 4-4" /></>,
    card: <><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="M3 9h18M7 15h3" /></>,
    gift: <><rect x="3" y="9" width="18" height="12" rx="2" /><path d="M2 6h20v4H2zM12 6v15M12 6H8a2 2 0 1 1 2-2c0 2 2 2 2 2zm0 0h4a2 2 0 1 0-2-2c0 2-2 2-2 2z" /></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2z" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" /><path d="m9 12 2 2 4-4" /></>,
    copy: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    whatsapp: <><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.7A8.5 8.5 0 1 1 20.5 11.5Z" /><path d="M8.5 8.2c.3-.6.6-.6.9-.6h.5c.2 0 .4.1.5.4l.8 1.8c.1.2.1.4-.1.6l-.6.7c-.2.2-.2.4 0 .7.6 1 1.5 1.8 2.5 2.3.3.1.5.1.7-.1l.8-1c.2-.2.4-.3.7-.2l1.7.8c.3.1.4.3.4.5 0 .3-.2 1.2-.8 1.6-.5.4-1.2.6-2 .4-1.1-.2-2.5-.9-3.9-2.1-1.2-1.1-2-2.5-2.3-3.5-.3-.9 0-1.8.3-2.3Z" /></>,
    telegram: <><path d="m21 3-7.2 18-3.7-7.1L3 10.2 21 3Z" /><path d="m10.1 13.9 5.2-5.1" /></>,
  };
  return <svg {...common}>{paths[name] || paths.wallet}</svg>;
}

        </divconst sampleActivationMembers = [
  { name: "Brian Mwangi", phone: "+254 7** *** 481", country: "Kenya", amount: "KES 99" },
  { name: "Amina Hassan", phone: "+254 7** *** 206", country: "Kenya", amount: "KES 99" },
  { name: "Chinedu Okafor", phone: "+234 8** *** 714", country: "Nigeria", amount: "NGN 1,200" },
  { name: "Neema Joseph", phone: "+255 7** *** 395", country: "Tanzania", amount: "TZS 2,500" },
  { name: "Grace Wanjiku", phone: "+254 7** *** 853", country: "Kenya", amount: "KES 99" },
  { name: "Kwame Mensah", phone: "+233 5** *** 128", country: "Ghana", amount: "GHS 8" },
  { name: "Peter Okello", phone: "+256 7** *** 642", country: "Uganda", amount: "UGX 2,800" },
  { name: "Faith Njeri", phone: "+254 7** *** 917", country: "Kenya", amount: "KES 99" },
  { name: "Mutesi Diane", phone: "+250 7** *** 503", country: "Rwanda", amount: "RWF 700" },
  { name: "Kevin Otieno", phone: "+254 7** *** 164", country: "Kenya", amount: "KES 99" },
  { name: "Priya Sharma", phone: "+91 9** *** 276", country: "India", amount: "INR 55" },
  { name: "Mercy Atieno", phone: "+254 7** *** 730", country: "Kenya", amount: "KES 99" },
  { name: "Maria Santos", phone: "+63 9** *** 851", country: "Philippines", amount: "PHP 45" },
  { name: "David Kiptoo", phone: "+254 7** *** 309", country: "Kenya", amount: "KES 99" }
];

function SampleActivationFeed() {
  return (
    <div style={{
      margin: "0 auto 28px",
      padding: 16,
      maxWidth: 520,
      background: "#17052c",
      border: "1px solid #a855f7",
      borderRadius: 18,
      textAlign: "left",
      overflow: "hidden"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6
      }}>
        <strong style={{ color: "#fff", fontSize: 16 }}>
          Recent Activations
        </strong>
        <span style={{
          background: "#7134a5",
          color: "#fff",
          borderRadius: 20,
          padding: "5px 9px",
          fontSize: 10,
          fontWeight: 900
        }}>
          SAMPLE DATA
        </span>
      </div>

      <div style={{ color: "#d8b4fe", fontSize: 11, marginBottom: 13 }}>
        live activating members 
      </div>

      <div style={{
        height: 250,
        overflow: "hidden",
        position: "relative"
      }}>
        <div className="df-activation-track">
          {[0, 1].map(copy => (
            <div key={copy} aria-hidden={copy === 1}>
              {ActivationMembers.map(member => (
                <div key={member.name} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "11px 8px",
                  marginBottom: 7,
                  background: "#ffffff12",
                  borderRadius: 11,
                  border: "1px solid #ffffff18"
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 12
                    }}>
                      {member.name}
                    </div>
                    <div style={{
                      color: "#c4b5fd",
                      fontSize: 10,
                      marginTop: 3
                    }}>
                      {member.phone} · {member.country}
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{
                      color: "#f0abfc",
                      fontWeight: 900,
                      fontSize: 12
                    }}>

const ActivationMembers = [
  { name: "Brian Mwangi", phone: "+254 7** *** 481", country: "🇰🇪 Kenya", amount: "KES 99" },
  { name: "Amina Hassan", phone: "+254 7** *** 206", country: "🇰🇪 Kenya", amount: "KES 99" },
  { name: "Chinedu Okafor", phone: "+234 8** *** 714", country: "🇳🇬 Nigeria", amount: "NGN 1,200" },
  { name: "Grace Wanjiku", phone: "+254 7** *** 853", country: "🇰🇪 Kenya", amount: "KES 99" },
  { name: "Neema Joseph", phone: "+255 7** *** 395", country: "🇹🇿 Tanzania", amount: "TZS 2,500" },
  { name: "Kevin Otieno", phone: "+254 7** *** 164", country: "🇰🇪 Kenya", amount: "KES 99" },
  { name: "Kwame Mensah", phone: "+233 5** *** 128", country: "🇬🇭 Ghana", amount: "GHS 8" },
  { name: "Faith Njeri", phone: "+254 7** *** 917", country: "🇰🇪 Kenya", amount: "KES 99" },
  { name: "Peter Kiprotich", phone: "+254 7** *** 642", country: "🇰🇪 Kenya", amount: "KES 99" },
  { name: "Mutesi Diane", phone: "+250 7** *** 503", country: "🇷🇼 Rwanda", amount: "RWF 700" },
  { name: "Mercy Atieno", phone: "+254 7** *** 730", country: "🇰🇪 Kenya", amount: "KES 99" },
  { name: "David Kiptoo", phone: "+254 7** *** 309", country: "🇰🇪 Kenya", amount: "KES 99" },
  { name: "Priya Sharma", phone: "+91 9** *** 276", country: "🇮🇳 India", amount: "INR 55" },
  { name: "Wanjiru Kamau", phone: "+254 7** *** 510", country: "🇰🇪 Kenya", amount: "KES 99" },
  { name: "Josephine Chebet", phone: "+254 7** *** 288", country: "🇰🇪 Kenya", amount: "KES 99" }
];

function ActivationFeed() {
  return (
    <div style={{
      margin: "0 auto 28px",
      padding: 16,
      maxWidth: 520,
      background: "#21083B",
      border: "1px solid #a855f7",
      borderRadius: 18,
      textAlign: "left",
      overflow: "hidden"
    }}>
      <strong style={{ color: "#fff", fontSize: 16 }}>
        Recent Member Activity
      </strong>

      <div style={{
        color: "#d8b4fe",
        fontSize: 10,
        marginTop: 5,
        marginBottom: 13
      }}>
         activity preview
      </div>

      <div style={{
        height: 250,
        overflow: "hidden",
        position: "relative"
      }}>
        <div className="df-activation-track">
          {[0, 1].map(copy => (
            <div key={copy} aria-hidden={copy === 1}>
              {ActivationMembers.map(member => (
                <div key={`${copy}-${member.name}`} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "11px 8px",
                  marginBottom: 7,
                  background: "#ffffff12",
                  borderRadius: 11,
                  border: "1px solid #ffffff18"
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 12
                    }}>
                      {member.name}
                    </div>
                    <div style={{
                      color: "#c4b5fd",
                      fontSize: 10,
                      marginTop: 3
                    }}>
                      {member.phone}
                    </div>
                    <div style={{
                      color: "#fff",

                      


export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("Home");
  const [showPolicies, setShowPolicies] = useState(false);
const [policyAgreed, setPolicyAgreed] = useState(false);
  const [scratchCards, setScratchCards] = useState<Array<{
  card_id: string;
  card_status: string;
  created_at: string;
}>>([]);
const [scratchLoading, setScratchLoading] = useState(false);
const [scratchError, setScratchError] = useState("");

useEffect(() => {
  if (screen !== "Scratch" || !user?.id) return;

  let mounted = true;

  async function loadScratchCards() {
    setScratchLoading(true);
    setScratchError("");

    const { data, error } = await supabase.rpc("member_list_scratch_cards");

    if (!mounted) return;

    if (error) {
      setScratchError(error.message);
    } else {
      setScratchCards(data || []);
    }

    setScratchLoading(false);
  }

  loadScratchCards();

  return () => {
    mounted = false;
  };
}, [screen, user?.id]);
  const [method, setMethod] = useState("M-PESA");
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");
  const [activationStatus, setActivationStatus] = useState<ActivationStatus>("checking");
  const [usd, setUsd] = useState("1");
  const [rate, setRate] = useState<number | null>(null);
  const [rateError, setRateError] = useState("");
  const [rateLoading, setRateLoading] = useState(true);
const [depositAmount, setDepositAmount] = useState("5");
const [depositPhone, setDepositPhone] = useState("");
  const [depositReference, setDepositReference] = useState("");
const [withdrawAmount, setWithdrawAmount] = useState("");
const [withdrawPhone, setWithdrawPhone] = useState("");
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [withdrawalTransactionId, setWithdrawalTransactionId] = useState("");
const [completedWithdrawalAmount, setCompletedWithdrawalAmount] = useState(0);
  const [completedWithdrawalPhone, setCompletedWithdrawalPhone] = useState("");
const [completedWithdrawalKES, setCompletedWithdrawalKES] = useState(0);
  
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data.user) {
        router.replace("/app/login");
        return;
      }

      const currentUser = data.user;

      const { data: referralCodeRow } = await supabase
        .from("member_referral_codes")
        .select("referral_code")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (!mounted) return;

      const code = referralCodeRow?.referral_code ||
        `BWK${currentUser.id.replace(/-/g, "").slice(0, 10).toUpperCase()}`;

      setUser({
        ...currentUser,
        user_metadata: {
          ...currentUser.user_metadata,
          referral_code: code
        }
      });

      setLoading(false);
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);
  

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    async function checkStatus() {
      const { data, error } = await supabase.from("activation_requests").select("status").eq("user_id", user.id);
      if (!mounted) return;
      if (error) {
        setActivationStatus("unknown");
        return;
      }
      const statuses = (data || []).map((item: any) => String(item.status || "").toLowerCase());
      if (statuses.includes("active") || statuses.includes("approved")) setActivationStatus("active");
      else if (statuses.includes("pending")) setActivationStatus("pending");
      else if (statuses.includes("rejected")) setActivationStatus("rejected");
      else setActivationStatus("not_submitted");
    }
    checkStatus();
    return () => { mounted = false; };
  }, [user?.id]);
  useEffect(() => {
    if (!user?.id) return;

    async function loadWalletBalance() {
      const { data, error } = await supabase
        .from("member_wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error) {
        setWalletBalance(Number(data?.balance ?? 0));
      }
    }

    loadWalletBalance();
  }, [user?.id]);
  useEffect(() => {
    let mounted = true;
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(response => response.json())
      .then(data => {
        const value = Number(data?.rates?.KES);
        if (data?.result === "success" && Number.isFinite(value) && value > 0) {
          if (mounted) setRate(value);
        } else if (mounted) setRateError("Exchange rate is temporarily unavailable.");
      })
      .catch(() => { if (mounted) setRateError("Exchange rate is temporarily unavailable."); })
      .finally(() => { if (mounted) setRateLoading(false); });
    return () => { mounted = false; };
  }, []);

  const memberName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Member";
  const referralCode = user?.user_metadata?.referral_code || (user?.id ? `BWK-${user.id.replace(/-/g, "").slice(0, 12).toUpperCase()}` : "");
  const referralLink = typeof window !== "undefined" && referralCode ? `${window.location.origin}/register?ref=${encodeURIComponent(referralCode)}` : "";
  const kes = rate === null ? null : Number(usd || 0) * rate;

  function openScreen(next: Screen) {
    setScreen(next);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(`${label} copied`);
    } catch {
      setCopied(`Please select and copy: ${value}`);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/app/login");
  }

  async function submitActivation() {
  setMessage("");

  if (method === "M-PESA") {
    if (!phone.trim()) {
      setMessage("Enter your M-PESA phone number.");
      return;
    }
  } else if (!reference.trim()) {
    setMessage("Enter the payment transaction reference/details.");
    return;
  }

  if (!user?.id) {
    setMessage("Please log in again.");
    return;
  }

  setBusy(true);

  try {
    if (method === "M-PESA") {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) throw new Error("Please log in again.");

      const response = await fetch("/api/daraja/stkpush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not start M-PESA payment.");
      }

      setPhone("");
      setMessage(
        `STK prompt sent! Enter your M-PESA PIN on your phone to pay KES ${result.amount}. Your account will remain pending until payment is verified and an administrator approves it.`
      );
    } else {
      const { error } = await supabase.from("activation_requests").insert({
        user_id: user.id,
        amount: 0.76,
        currency: "USD",
        method,
        phone: reference.trim(),
        status: "pending",
      });

      if (error) throw error;

      setReference("");
      setActivationStatus("pending");
      setMessage("Payment details submitted for administrator verification.");
    }
  } catch (error) {
    setMessage(error instanceof Error ? error.message : "Payment request failed.");
  } finally {
    setBusy(false);
  }
  }
    

  
async function submitDeposit() {
  setMessage("");

  const amount = Number(depositAmount);

  if (!amount || amount <= 0) {
    setMessage("Enter a valid deposit amount.");
    return;
  }

  if (!/^\+254\d{9}$/.test(depositPhone.trim())) {
    setMessage("Enter your M-PESA number in format +2547XXXXXXXX.");
    return;
  }

  if (!user?.id) {
    setMessage("Please log in again.");
    return;
  }

  setBusy(true);

  try {
    const { data: request, error } = await supabase
      .from("deposit_requests")
      .insert({
        user_id: user.id,
        amount,
        currency: "USD",
        method: "M-PESA",
        sender_phone: depositPhone.trim(),
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw error;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) throw new Error("Please log in again.");

    const response = await fetch("/api/daraja/stkpush", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        phone: depositPhone.trim(),
        purpose: "deposit",
        deposit_request_id: request.id,
        amount,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not start M-PESA payment.");
    }

    setDepositAmount("5");
    setDepositPhone("");
    setMessage(
      `M-PESA prompt sent. Enter your PIN to pay KES ${result.amount}. Your deposit will be verified before your wallet is credited.`
    );
  } catch (error) {
    setMessage(error instanceof Error ? error.message : "Deposit failed.");
  } finally {
    setBusy(false);
  }
}
async function submitManualDeposit() {
  setMessage("");

  const amount = Number(depositAmount);
  const transactionCode = depositReference.trim().toUpperCase();

  if (!amount || amount <= 0) {
    setMessage("Enter a valid deposit amount.");
    return;
  }

  if (!transactionCode) {
    setMessage("Enter your M-PESA transaction code.");
    return;
  }

  if (!user?.id) {
    setMessage("Please log in again.");
    return;
  }

  setBusy(true);

  try {
    const { error } = await supabase.from("deposit_requests").insert({
      user_id: user.id,
      amount,
      currency: "USD",
      method: "SIM Toolkit",
      payment_reference: transactionCode,
      status: "pending",
    });

    if (error) throw error;

    setDepositReference("");
    setDepositAmount("5");
    setMessage(
      "Deposit details submitted. Your payment will be verified before your wallet is credited."
    );
  } catch (error) {
    setMessage(
      error instanceof Error
        ? error.message
        : "Could not submit deposit details."
    );
  } finally {
    setBusy(false);
  }
   } 
async function submitWithdrawal() {
  setMessage("");
  setWithdrawalSuccess(false);

  const amount = Number(withdrawAmount);

  if (!amount || amount < 5) {
  setMessage("Minimum withdrawal amount is $5 USD.");
  return;
  }

  if (amount > walletBalance) {
    setMessage("Your withdrawal amount exceeds your available balance.");
    return;
  }

  if (!/^\+254\d{9}$/.test(withdrawPhone.trim())) {
    setMessage("Enter your M-PESA number in format +2547XXXXXXXX.");
    return;
  }

  if (!user?.id) {
    setMessage("Please log in again.");
    return;
  }

  setBusy(true);

  try {
    const { data, error } = await supabase.rpc("member_request_withdrawal", {
      p_amount: amount,
      p_method: "M-PESA",
      p_destination_details: withdrawPhone.trim(),
    });

    if (error) throw error;
    if (!data) throw new Error("Withdrawal request was not created.");

    setWalletBalance(currentBalance =>
      Math.max(0, currentBalance - amount)
    );

    setWithdrawalTransactionId(String(data));
    setCompletedWithdrawalAmount(amount);
    setCompletedWithdrawalPhone(withdrawPhone.trim());
    setCompletedWithdrawalKES(amount * (rate ?? 0));

    setWithdrawAmount("");
    setWithdrawPhone("");
    setWithdrawalSuccess(true);
  } catch (error) {
    setMessage(
      error instanceof Error ? error.message : "Withdrawal request failed."
    );
  } finally {
    setBusy(false);
  }
}
  if (loading || activationStatus === "checking") {
    return (
      <main style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#310064",
        color: "#fff",
        fontWeight: 800
      }}>
        Checking account status...
      </main>
    );
  }

  if (activationStatus !== "active" && screen !== "Activation") {
    return (
      <main style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#210044,#6500ad,#30005e)",
        color: "#fff",
        padding: "35px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial,sans-serif"
      }}>
        <style>{`
          @keyframes activatePulse {
            0%,100% { transform: scale(1); }
            50% { transform: scale(1.09); }
          }
          @keyframes activateSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>

        <div style={{
          width: "100%",
          maxWidth: 430,
          textAlign: "center"
        }}>
          <h1 style={{
            fontSize: 29,
            fontWeight: 900,
            marginBottom: 12
          }}>
            Welcome to DollarFetch!
          </h1>

          <div style={{
            fontSize: 25,
            fontWeight: 900,
            color: "#ffdf70",
            marginBottom: 10
          }}>
            $0.76 USD
          </div>

          <p style={{ fontSize: 14, marginBottom: 30 }}>
            One-time account activation fee
          </p>

          <h2 style={{
            fontSize: 22,
            fontWeight: 900,
            textDecoration: "underline",
            textUnderlineOffset: 8,
            marginBottom: 32
          }}>
            ACTIVATE YOUR ACCOUNT
          </h2>

          <div style={{
            width: 180,
            height: 180,
            position: "relative",
            margin: "0 auto 35px",
            display: "grid",
            placeItems: "center"
          }}>
            <div style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "5px solid transparent",
              borderTopColor: "#fff",
              borderRightColor: "#ffdf70",
              animation: "activateSpin 2s linear infinite"
            }} />

            <button
              type="button"
              onClick={() => setScreen("Activation")}
              style={{
                width: 148,
                height: 148,
                borderRadius: "50%",
                border: "3px solid #fff",
                background: "linear-gradient(145deg,#bd63ff,#4b0099)",
                color: "#fff",
                fontSize: 21,
                fontWeight: 900,
                boxShadow: "0 0 30px #ffffff80",
                animation: "activatePulse 1.5s ease-in-out infinite"
              }}
            >
              TAP TO
              <br />
              ACTIVATE
            </button>
          </div>
<SampleActivationFeed />
          <div style={{
            textAlign: "left",
            background: "#ffffff16",
            border: "1px solid #ffffff35",
            borderRadius: 18,
            padding: 20
          }}>
            <div style={{
              fontSize: 17,
              fontWeight: 900,
              textAlign: "center",
              marginBottom: 18
            }}>
              MEMBER FEATURES
            </div>

            <p>1. Dollar Wheel Roll</p>
            <p>2. Scratch Dollar Prize</p>
            <p>3. Referrals — Earn $0.50</p>
          </div>
          
          <button
            type="button"
            onClick={() => setShowPolicies(value => !value)}
            style={{
              marginTop: 15,
              padding: "12px 22px",
              borderRadius: 30,
              border: "1px solid #fff",
              background: "#ffffff20",
              color: "#fff",
              fontWeight: 900,
              textDecoration: "underline"
            }}
          >
            {showPolicies ? "READ LESS" : "READ MORE"}
          </button>

          {showPolicies && (
            <div style={{
              marginTop: 16,
              padding: 18,
              borderRadius: 16,
              background: "#fff",
              color: "#321052",
              textAlign: "left",
              maxHeight: 430,
              overflowY: "auto"
            }}>
              <h2 style={{ textAlign: "center", color: "#6b21a8" }}>
                DOLLARFETCH MEMBER POLICIES
              </h2>
              <p style={{ textAlign: "center" }}>Powered by BWK Solutions</p>

              <h3>1. Account Activation</h3>
              <p>Account activation costs $0.76 USD. Your account becomes active after your payment has been verified and approved. Always submit accurate payment details.</p>
<h4>M-PESA STK Push Payment</h4>
<p>
  DollarFetch uses secure M-PESA STK Push for activation payments.
  Enter your Safaricom M-PESA phone number and submit your payment request.
</p>
<p>
  A payment prompt will appear directly on your phone.
  Enter your M-PESA PIN to complete the payment.
</p>
<p>
  Your activation status will remain pending until your payment
  has been verified and approved by the administrator.
</p>
<p>
  Always confirm the amount before entering your PIN.
  Never share your M-PESA PIN with anyone.
</p>
              <h3>2. Referral Policy</h3>
              <p>Earn $0.50 USD for each person who registers using your referral code and successfully activates their account. Registration alone does not qualify for a referral reward.</p>

              <h3>3. Dollar Wheel Policy</h3>
              <p>Members may participate in the Dollar Wheel according to the platform's spin rules and fair-use requirements.</p>

              <h3>4. Scratch Card Policy</h3>
              <p>Scratch-card participation and rewards are subject to the platform's reward rules. Fraudulent activity is prohibited.</p>

              <h3>5. Withdrawals</h3>
              <p>Withdrawals are sent to your active payment method (M-PESA). Ensure your M-PESA number is correct and active.</p>

              <h3>6. Fair Use</h3>
              <p>Fake accounts, referral manipulation, payment fraud and attempts to exploit the platform are prohibited.</p>

              <h3>7. Policy Updates</h3>
              <p>DollarFetch may update these policies when necessary. Members should review the latest version.</p>

              <div style={{
                marginTop: 18,
                padding: 14,
                background: "#f3e8ff",
                borderRadius: 12
              }}>
                <label style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  fontWeight: 800
                }}>
                  <input
                    type="checkbox"
                    checked={policyAgreed}
                    onChange={e => setPolicyAgreed(e.target.checked)}
                    style={{ width: 20, height: 20 }}
                  />
                  I have read and agree to the DollarFetch Member Policies.
                </label>
                <p style={{ fontSize: 12 }}>
                  {policyAgreed ? "✓ Agreement confirmed." : "Please tick the box to agree."}
                </p>
              </div>
            </div>
          )}
          
        </div>
        <ActivationChat memberName={memberName} />
      </main>
    );
  }
  

  

      
  return (
    <main className="df-app">
      <style>{`
        *{box-sizing:border-box}
        body{margin:0;background:#f5f0ff}
        ..df-app{
  min-height:100vh;
  background:linear-gradient(180deg,#25005d 0%,#4c0b91 24%,#f3eaff 55%,#f3eaff 100%);
  color:#211044;
  font-family:Arial,Helvetica,sans-serif;
  padding-bottom:100px
}
.loading{min-height:100vh;display:grid;place-content:center;justify-items:center;gap:14px;color:#4b12b2}
.spinner{width:36px;height:36px;border:4px solid #e8ddff;border-top-color:#6726d9;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.wrap{width:min(100%,760px);margin:auto;padding:20px 17px 35px}
.top{display:flex;align-items:center;justify-content:space-between;color:#fff;padding:8px 2px 24px}
.brand{display:flex;align-items:center;gap:10px;font-size:25px;font-weight:900;letter-spacing:-1px}
.brandmark{width:42px;height:42px;border-radius:14px;background:linear-gradient(145deg,#fff,#cbb0ff);color:#4c13bb;display:grid;place-items:center;font-size:26px;font-weight:900}
.brand small{display:block;font-size:10px;letter-spacing:1.5px;color:#d9c9ff;margin-top:3px}
.topicons{display:flex;gap:10px}
.round{width:43px;height:43px;border-radius:50%;border:1px solid #ffffff55;background:#ffffff18;color:#fff;display:grid;place-items:center}
.hero{
  position:relative;
  overflow:hidden;
  border-radius:25px;
  padding:26px 22px 28px;
  min-height:190px;
  background:radial-gradient(circle at 78% 40%,#a855f7 0,#6b21a8 38%,#25005d 100%);
  color:#fff;
  box-shadow:0 15px 32px #4a13a744
}
.announcement{
  margin:14px 0;
  padding:13px;
  background:linear-gradient(90deg,#3b0764,#7e22ce);
  border-radius:14px;
  overflow:hidden;
  color:#fff;
  white-space:nowrap
}
.announcement-track{
  display:inline-block;
  width:max-content;
  animation:announcementMove 22s linear infinite
}
.withdrawal-activity{margin:16px 0;padding:17px 0 12px;background:linear-gradient(135deg,#fff,#f4eaff);border:1px solid #e6d5ff;border-radius:20px;overflow:hidden;box-shadow:0 8px 22px #43128a12}
.withdrawal-activity-head{padding:0 17px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.withdrawal-activity-head h2{margin:0;color:#32105d;font-size:17px;font-weight:900}
.sample-label{font-size:9px;font-weight:900;letter-spacing:.7px;color:#6d28d9;background:#eee2ff;border-radius:20px;padding:6px 9px;white-space:nowrap}
.withdrawal-viewport{overflow:hidden;width:100%;display:flex;flex-direction:column;gap:9px;padding:2px 0 8px}
.withdrawal-entry{width:max-content;max-width:none;display:flex;align-items:center;gap:11px;margin-left:0;padding:10px 13px;border:1px solid #eadfff;border-radius:13px;background:#fff;box-shadow:0 3px 10px #32105d0b;white-space:nowrap;animation:withdrawalSlide 19s linear infinite}
.withdrawal-entry:nth-child(even){animation-duration:23s}
.withdrawal-avatar{width:34px;height:34px;flex:0 0 34px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#8b35e8,#4c0b91);color:#fff;font-size:13px;font-weight:900}
.withdrawal-person{display:flex;flex-direction:column;gap:3px}
.withdrawal-person strong{font-size:12px;color:#291044}
.withdrawal-person small{font-size:10px;color:#87769a}
.withdrawal-amount{font-size:13px;font-weight:900;color:#5b21b6;margin-left:5px}
@keyframes withdrawalSlide{from{transform:translateX(105vw)}to{transform:translateX(-110%)}}
@media(prefers-reduced-motion:reduce){.withdrawal-entry{animation:none;transform:none;margin-left:12px}}
@keyframes announcementMove{
  from{transform:translateX(-100%)}
  to{transform:translateX(100vw)}
}
.hero:after{content:"";position:absolute;width:230px;height:230px;border:1px solid #ffffff28;border-radius:50%;right:-50px;top:-90px;box-shadow:0 0 0 24px #ffffff08,0 0 0 48px #ffffff08}
@keyframes announcementMove{
  from{transform:translateX(-100%)}
  to{transform:translateX(100vw)}
}{position:relative;overflow:hidden;border-radius:25px;padding:26px 22px 28px;min-height:190px;background:radial-gradient(circle at 78% 40%,#8f3dff 0,#5412c5 35%,#25005d 100%);color:#fff;box-shadow:0 15px 32px #4a13a744}
        .hero:after{content:"";position:absolute;width:230px;height:230px;border:1px solid #ffffff28;border-radius:50%;right:-50px;top:-90px;box-shadow:0 0 0 24px #ffffff08,0 0 0 48px #ffffff08}
        .hero h1{font-size:30px;line-height:1.1;margin:12px 0 8px;max-width:70%;position:relative;z-index:1}
        .hero p{margin:0;color:#e4d4ff;font-size:14px;position:relative;z-index:1}
        .hero-art{position:absolute;right:18px;bottom:13px;font-size:94px;filter:drop-shadow(0 12px 12px #14002f88);z-index:1}
        .hero-tag{font-size:10px;letter-spacing:2px;color:#d7c2ff;font-weight:800}
        .balance{margin-top:17px;background:linear-gradient(115deg,#fff,#f0e6ff);border:1px solid #e5d5ff;border-radius:22px;padding:19px;display:flex;align-items:center;gap:14px;box-shadow:0 8px 24px #43128a12}
        .balance-icon{width:62px;height:62px;flex-shrink:0;border-radius:18px;background:linear-gradient(145deg,#8d35f4,#4a0cbd);color:#fff;display:grid;place-items:center}
        .balance-label{font-size:13px;color:#77658f;font-weight:700}
        .balance-value{font-size:34px;font-weight:900;letter-spacing:-1.5px;margin-top:4px;color:#18083d}
        .balance-note{font-size:10px;color:#8d7da2;margin-top:3px}
        .actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:17px}
        .action{border:1px solid #e4d5ff;background:#fff;border-radius:17px;min-height:112px;padding:13px 5px;color:#4e16b7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;font-weight:800;font-size:12px;box-shadow:0 7px 18px #4811a20d}
        .action span{text-align:center;color:#2c1653}
        .referral{margin-top:17px;border-radius:22px;background:linear-gradient(110deg,#fff,#e8d7ff);border:1px solid #e0ccff;padding:18px;display:flex;align-items:center;gap:14px;box-shadow:0 8px 24px #43128a12}
        .gift{width:58px;height:58px;display:grid;place-items:center;color:#4b12b2}
        .referral small{font-size:12px;color:#705a8c;font-weight:700}
        .referral strong{display:block;font-size:32px;color:#4b12b2;margin:3px 0}
        .referral p{margin:0;font-size:11px;color:#705a8c}
        .activation-prompt{margin-top:16px;padding:17px;border-radius:18px;background:linear-gradient(110deg,#2a075e,#7624d7);color:#fff;display:flex;align-items:center;gap:14px;box-shadow:0 9px 25px #4b14a52b}
        .activation-prompt p{margin:5px 0 0;color:#e5d7ff;font-size:12px;line-height:1.5}
        .activation-prompt button{margin-left:auto;white-space:nowrap;border:0;border-radius:10px;padding:11px;background:#fff;color:#5715bb;font-weight:800}
        .activation-banner{display:flex;align-items:center;gap:14px;padding:18px;border-radius:18px;background:radial-gradient(circle at 80% 20%,#9d5aff,#4b0fb0 65%,#26005e);color:#fff;margin-bottom:15px;box-shadow:0 10px 25px #4b14a533}
        .activation-rocket{font-size:40px}
        .referral-tools{margin-top:15px;padding:14px;border:1px solid #e8def5;border-radius:14px;background:#fcfaff}
        .referral-value{overflow-wrap:anywhere;font-weight:800;color:#4c168f;font-size:13px;margin:8px 0}
        .copy-action{border:0;border-radius:9px;padding:10px 12px;background:#5b18c7;color:white;font-weight:800;font-size:12px}
        .secure{margin-top:16px;border-radius:18px;padding:16px;background:linear-gradient(110deg,#26005e,#6a19d4);color:#fff;display:flex;align-items:center;gap:14px}
        .secure b{display:block;font-size:14px}.secure small{display:block;color:#dfcaff;margin-top:4px;font-size:11px}
        .socials{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
        .social-link{display:flex;align-items:center;justify-content:center;gap:9px;padding:13px 10px;border-radius:13px;text-decoration:none;font-size:12px;font-weight:800;background:#fff;border:1px solid #e7dcf5;color:#4b168f;box-shadow:0 6px 18px #39116b0b}
        .social-link.whatsapp{color:#168b4b}.social-link.telegram{color:#168ac0}
        .section{margin-top:20px;background:#fff;border:1px solid #e9def8;border-radius:20px;padding:19px;box-shadow:0 8px 22px #39116b0c}
        .section h2{margin:0 0 7px;font-size:19px;color:#2b1154}
        .muted{font-size:12px;color:#857796;line-height:1.6;margin:0 0 15px}
        .primary{border:0;border-radius:13px;padding:14px 18px;background:linear-gradient(100deg,#7d24ed,#4300ae);color:white;font-weight:800;width:100%;font-size:14px}
        .primary:disabled{opacity:.6}
        .method-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
        .method{border:1px solid #e7ddf2;border-radius:13px;background:#fff;padding:11px;display:flex;align-items:center;gap:10px;text-align:left;color:#261244;min-width:0}
        .method.selected{border:2px solid #7524e5;background:#faf6ff;padding:10px}
        .logo{width:43px;height:40px;flex-shrink:0;display:grid;place-items:center;background:#fff;border:1px solid #f0eaf7;border-radius:9px;overflow:hidden}
        .logo img{width:100%;height:100%;object-fit:contain;padding:4px}
        .method b{font-size:12px;display:block}.method small{font-size:9px;color:#8a7b9a;display:block;margin-top:4px}
        .field{margin:14px 0}.field label{display:block;font-size:12px;font-weight:800;margin-bottom:7px}
        .field input{width:100%;padding:13px;border:1px solid #e2d8ed;border-radius:10px;font-size:14px;color:#25133e;background:#fff}
        .payment-steps{background:#fbf8ff;border:1px solid #e7dcf8;border-radius:13px;padding:14px;margin:13px 0;color:#38205e;font-size:12px;line-height:1.7}
        .copy-number{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#fff;border:1px dashed #8b5bd2;border-radius:11px;padding:12px;margin:10px 0;font-size:20px;font-weight:900;letter-spacing:1px}
        .copy-btn{border:0;border-radius:9px;background:#5b18c7;color:#fff;padding:10px 12px;font-weight:800}
        .notice{background:#f5edff;color:#59318e;border:1px solid #e6d7ff;border-radius:11px;padding:12px;font-size:12px;line-height:1.5;margin:13px 0}
        .message{background:#f4efff;color:#4c2382;padding:12px;border-radius:10px;font-size:12px;line-height:1.5;margin:12px 0;overflow-wrap:anywhere}
        .bottom{position:fixed;z-index:10;bottom:0;left:0;right:0;background:#ffffffed;backdrop-filter:blur(12px);border-top:1px solid #e9def8;display:grid;grid-template-columns:repeat(4,1fr);padding:10px max(8px,env(safe-area-inset-right)) calc(9px + env(safe-area-inset-bottom));max-width:760px;margin:auto;border-radius:20px 20px 0 0}
        .bottom button{border:0;background:transparent;color:#817198;display:grid;justify-items:center;gap:4px;font-size:10px;font-weight:700;padding:4px}
        .bottom button.active{color:#5c14c8}
        .bottom button.active:after{content:"";width:34px;height:3px;border-radius:3px;background:#6a20d7;margin-top:2px}
        .pagehead{display:flex;align-items:center;justify-content:space-between;margin:7px 0 17px;color:#fff}
        .pagehead h1{font-size:22px;margin:0}
        .back{border:1px solid #ffffff55;background:#ffffff18;color:white;border-radius:10px;padding:9px 12px}
        .rowline{display:flex;justify-content:space-between;gap:10px;padding:13px 0;border-bottom:1px solid #f0eaf6;font-size:13px}
        .rowline:last-child{border-bottom:0}
        @media(max-width:390px){.wrap{padding-left:12px;padding-right:12px}.brand{font-size:21px}.hero h1{font-size:26px}.hero-art{font-size:75px}.balance-value{font-size:29px}.actions{gap:6px}.action{font-size:10px;min-height:102px}.activation-prompt{align-items:flex-start;flex-wrap:wrap}.activation-prompt button{margin-left:0}.copy-number{font-size:16px}}
      `}</style>

      <div className="wrap">
        <header className="top">
          <div className="brand"><div className="brandmark">BWK</div><div>DollarFetch<small>POWERED BY BWK SOLUTIONS</small></div></div>
          <div className="topicons">
            <button className="round" aria-label="Notifications"><Icon name="bell" /></button>
            <button className="round" aria-label="Profile" onClick={() => openScreen("Settings")}><Icon name="user" /></button>
          </div>
        </header>

        {screen === "Home" && <>
          <section className="hero">
            <div className="hero-tag">DASHBOARD</div>
            <h1>Bravo, {memberName}!</h1>
            <p>lets make some cash 💷💰</p>
            <div className="hero-art">$</div>
                    </section>

          <section className="announcement">
            <div className="announcement-track">
              📢 SPECIAL ANNOUNCEMENT: TO OUR SPECIAL AND TRUSTED DOLLARFETCH MEMBERS, THE ACTIVATION FEE IS NOW AS LOW AS $0.76 USD (APPROXIMATELY KSH 99). • TRANSACT WISELY. • IN CASE OF ANY WITHDRAWAL DELAYS, PLEASE CONTACT OUR TEAM FOR ASSISTANCE. • THANK YOU FOR BEING PART OF DOLLARFETCH! 💜 •
            </div>
          </section>
<SampleWithdrawalActivity />
          <section className="balance">
            <div className="balance-icon">🇺🇸</div>
            <div className="balance-value">${walletBalance.toFixed(2)}</div>
          </section>
          <section className="actions">
            <button className="action" onClick={() => openScreen("Activation")}><Icon name="rocket" size={29} /><span>{activationStatus === "active" ? "Account Active" : "Activate Account"}</span></button>
            <button className="action" onClick={() => openScreen("Deposit")}><Icon name="card" size={29} /><span>Deposit</span></button>
            <button className="action" onClick={() => openScreen("Withdraw")}><Icon name="wallet" size={29} /><span>Withdraw</span></button>
            <button className="action" onClick={() => openScreen("Rewards")}><Icon name="gift" size={29} /><span>Referral</span></button>
          </section>{activationStatus === "active" && (
  <a
    href="/app/lucky-spin"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 14,
      padding: 18,
      borderRadius: 18,
      background: "linear-gradient(110deg,#102b68,#2563eb)",
      color: "#fff",
      textDecoration: "none",
      fontWeight: 800
    }}
  >
    <span>🎡 Lucky Spin<br />
      <small>Spin daily for wallet rewards</small>
    </span>
    <span>PLAY →</span>
  </a>
)}
          <button
  className="referral"
  style={{ width: "100%", textAlign: "left", marginTop: 16 }}
  onClick={() => openScreen("Scratch")}
>
  <div className="gift"><Icon name="gift" size={48} /></div>
  <div>
    <small>DOLLARFETCH GAME</small>
    <strong>Scratch & Win</strong>
    <p>Refer verified members to unlock scratch cards!</p>
  </div>
  <span style={{ marginLeft: "auto", fontWeight: 900 }}>PLAY →</span>
</button>
          <div className="activation-prompt">
            <div>
              <b>{activationStatus === "active" ? "Account Activated 鉁�" : activationStatus === "pending" ? "Activation Pending" : activationStatus === "unknown" ? "Checking account status" : activationStatus === "rejected" ? "Activation not approved" : "You’re one step away!"}</b>
              <p>{activationStatus === "active" ? "Your account has been approved. You can now enjoy your member benefits." : activationStatus === "pending" ? "Your payment details have been submitted. An administrator will verify them." : activationStatus === "unknown" ? "We could not read your activation status. Please try again later." : activationStatus === "rejected" ? "Your activation request was rejected. Contact support for help." : "Activate your account to unlock your DollarFetch member benefits."}</p>
            </div>
            {activationStatus !== "active" && <button onClick={() => openScreen("Activation")}> {activationStatus === "pending" ? "View status" : "Activate"} </button>}
          </div>
          <button className="referral" style={{ width: "100%", textAlign: "left" }} onClick={() => openScreen("Rewards")}>
            <div className="gift"><Icon name="gift" size={48} /></div><div><small>REFERRAL REWARD</small><strong>$0.50</strong><p>Invite friends and earn more!</p></div>
          </button>
          <div className="secure"><Icon name="shield" size={38} /><div><b>Your account is secure</b><small>Protected member access</small></div></div>
          <div className="socials">
            <a className="social-link whatsapp" href="https://whatsapp.com/channel/0029VbEm5GNHAdNQQ8QEXb2f" target="_blank" rel="noreferrer"><Icon name="whatsapp" size={21} /> WhatsApp Channel</a>
            <a className="social-link telegram" href="https://t.me/dollafetch" target="_blank" rel="noreferrer"><Icon name="telegram" size={21} /> Telegram Channel</a>
          </div>
          <section className="section">
            <h2>USD to KES Converter</h2>
            <p className="muted">Convert US Dollars into Kenyan Shillings using a live reference rate.</p>
            <div className="field">
              <label>Amount in USD ($)</label>
              <input type="number" min="0" step="0.01" value={usd} onChange={e => setUsd(e.target.value)} placeholder="Enter USD amount" />
            </div>
            {rateLoading ? <p className="muted">Loading exchange rate...</p> : rateError ? <p className="notice">{rateError}</p> : <>
              <div className="rowline"><span>Exchange rate</span><b>1 USD = {rate?.toFixed(2)} KES</b></div>
              <div className="notice"><b>Estimated conversion</b><h2>KES {kes?.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2></div>
            </>}
          </section>
        </>}

        {screen === "Activation" && <>
          <div className="pagehead"><h1>{activationStatus === "active" ? "Account Active" : "Activate Account"}</h1><button className="back" onClick={() => openScreen("Home")}>Back</button></div>
          <section className="section">
            {activationStatus === "active" ? <>
              <div className="activation-banner"><div className="activation-rocket">✓</div><div><h2>Account activated</h2><p>Your account has been approved by the administrator.</p></div></div>
              <div className="notice">You do not need to submit another activation payment.</div>
            </> : <>
              <div className="activation-banner"><div className="activation-rocket">🚀</div><div><h2>Activate your account</h2><p>Submit your $0.76 app KES 99 activation payment details for  verification.</p></div></div>
              ="button"
      <h2>Pay with M-PESA</h2>

<p className="muted">
  Enter your Safaricom M-PESA number. We will send a secure payment prompt directly to your phone.
</p>

<div className="field">
  <label>M-PESA phone number</label>
  <input
    type="tel"
    value={phone}
    onChange={e => setPhone(e.target.value)}
    placeholder="+254712345678"
    inputMode="tel"
  />
</div>


  
<div className="notice">
  Payment must be verified  before account activation.
  Confirm Details and amount before sending.
</div>

{(message || copied) && (
  <div className="message">{message || copied}</div>
)}

<button className="primary" disabled={busy} onClick={submitActivation}>
  {busy ? "Submitting..." : "Submit payment details"}
</button>
            </>}
          </section>
        </>}

        {screen === "Deposit" && <>
  <div className="pagehead">
    <h1>Deposit</h1>
    <button className="back" onClick={() => openScreen("Home")}>Back</button>
  </div>

  <section className="section">
    <h2>Deposit to your wallet</h2>

    <div style={{
      border: "1px solid #dc2626",
      borderRadius: "16px",
      padding: "16px",
      marginBottom: "18px"
    }}>
      <h3>📱 M-PESA STK Push</h3>
      <p className="muted">Receive an M-PESA payment prompt on your phone.</p>

      <div className="field">
        <label>Amount (USD)</label>
        <input type="number" min="1" value={depositAmount}
          onChange={e => setDepositAmount(e.target.value)} />
      </div>

      <div className="field">
        <label>M-PESA phone number</label>
        <input value={depositPhone}
          onChange={e => setDepositPhone(e.target.value)}
          placeholder="+254712345678" inputMode="tel" />
      </div>

      <button className="primary" disabled={busy} onClick={submitDeposit}>
        {busy ? "Processing..." : "Deposit with STK Push"}
      </button>
    </div>

    

    <div className="notice">
      Deposits are credited to your wallet only after administrator verification.
    </div>

    {(message || copied) && (
      <div className="message">{message || copied}</div>
    )}
  </section>
</>}


{screen === "Withdraw" && <>
  {withdrawalSuccess ? (
    <section style={{
      background: "#ffffff",
      color: "#111111",
      borderRadius: "20px",
      padding: "35px 22px",
      textAlign: "center",
      marginTop: "20px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.08)"
    }}>
      <div style={{
        width: "115px",
        height: "115px",
        borderRadius: "50%",
        border: "7px solid #16a34a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 22px"
      }}>
        <svg viewBox="0 0 60 60" width="85" height="85">
          <path
            d="M10 31 L24 46 L52 13"
            fill="none"
            stroke="#16a34a"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div style={{ fontSize: "38px", marginBottom: "12px" }}>
        🎉
      </div>

      <h2 style={{
        color: "#111111",
        fontSize: "24px",
        fontWeight: 800,
        marginBottom: "12px"
      }}>
        Withdrawal Successful 🎉
      </h2>

      
        <div style={{
  background: "#f8fafc",
  borderRadius: "14px",
  padding: "18px",
  marginTop: "18px",
  color: "#111"
}}>
  <div style={{ fontWeight: 800, fontSize: "25px" }}>
  ${completedWithdrawalAmount.toFixed(2)} USD
</div>

<p style={{ fontWeight: 700, marginTop: "12px" }}>
  Mobile number paid to:
</p>

<p style={{ fontSize: "18px", color: "#6d28d9", fontWeight: 800 }}>
  {completedWithdrawalPhone}
</p>

  <p style={{
    color: "#15803d",
    fontSize: "21px",
    fontWeight: 800,
    marginTop: "8px"
  }}>
    KES {completedWithdrawalKES.toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}
  </p>

  <p style={{ fontSize: "13px", marginTop: "15px" }}>
    Transaction ID
  </p>

  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px"
  }}>
    <strong style={{ fontSize: "13px", wordBreak: "break-all" }}>
      {withdrawalTransactionId}
    </strong>

    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(withdrawalTransactionId)}
      style={{
        background: "#dc2626",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "10px"
      }}
    >
      📋 Copy
    </button>
  </div>
</div>

      <p style={{
        color: "#111111",
        fontWeight: 700,
        marginTop: "18px"
      }}>
        Status: disbursement on process 
      </p>

      <p style={{
        color: "#333333",
        fontSize: "14px",
        marginTop: "12px",
        lineHeight: 1.6
      }}>
        Once processed, payment is expected to reflect in your account within 5–10 minutes. Timing may vary.
      </p>

      <button
        className="primary"
        style={{ marginTop: "25px" }}
        onClick={() => {
          setWithdrawalSuccess(false);
          openScreen("Home");
        }}
      >
        Back to Dashboard
      </button>
    </section>
  ) : (
    <>
      <div className="pagehead">
        <h1>Withdraw</h1>
        <button className="back" onClick={() => openScreen("Home")}>Back</button>
      </div>

      <section className="section">
        <h2>Withdraw funds</h2>
        <p className="muted">
          Available balance: ${walletBalance.toFixed(2)}
        </p>

        <div className="field">
          <label>Amount (USD)</label>
          <input
            type="number"
            min="1"
            value={withdrawAmount}
            onChange={e => setWithdrawAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <div className="field">
          <label>M-PESA phone number</label>
          <input
            value={withdrawPhone}
            onChange={e => setWithdrawPhone(e.target.value)}
            placeholder="+254712345678"
            inputMode="tel"
          />
        </div>

        <div className="notice">
          Your request requires administrator approval before payment is released.
        </div>

        {message && (
          <div className="message">{message}</div>
        )}

        <button
          className="primary"
          disabled={busy}
          onClick={submitWithdrawal}
        >
          {busy ? "Submitting..." : "Request Withdrawal"}
        </button>
      </section>
    </>
  )}
</>}
        
  
            



        {screen === "Earnings" && <>
          <div className="pagehead"><h1>Earnings</h1></div>
          <section className="section"><h2>Your earnings</h2><p className="muted">Your earnings summary will appear here when earning activity is connected.</p>
            <div className="rowline"><span>Total earnings</span><b>$0.00</b></div><div className="rowline"><span>Available balance</span><b>$0.00</b></div>
          </section>
        </>}
{screen === "Scratch" && <>
  <div className="pagehead">
    <h1>🎁 Scratch & Win</h1>
    <button className="back" onClick={() => openScreen("Home")}>Back</button>
  </div>

  <section className="section">
    <h2>Your Scratch Cards</h2>
    <p className="muted">
      Every new referral who completes activation and is verified by an admin
      unlocks one additional scratch card.
    </p>

    {scratchLoading && <p>Loading your scratch cards...</p>}

    {scratchError && (
      <div className="notice">Could not load cards: {scratchError}</div>
    )}

    {!scratchLoading && !scratchError && scratchCards.length === 0 && (
      <div className="notice">
        🎟️ No scratch cards yet. Refer a member and ensure they complete activation and get verified by an admin to unlock a card.
      </div>
    )}
<div style={{
  marginTop: 18,
  padding: 18,
  borderRadius: 16,
  background: "linear-gradient(135deg,#f3e8ff,#e9d5ff)",
  textAlign: "center"
}}>
  <div style={{ fontSize: 35 }}>🎁</div>
  <h3 style={{ color: "#581c87" }}>Invite a Member</h3>
  <p style={{ color: "#6b4b83" }}>
    Invite friends to DollarFetch. When they activate and an admin verifies them, you unlock another scratch card!
  </p>
  <button
    className="copy-action"
    type="button"
    onClick={async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Join DollarFetch",
            text: "Join me on DollarFetch!",
            url: referralLink
          });
        } catch {}
      } else {
        await copyValue(referralLink, "Invitation link");
      }
    }}
  >
    🎁 Invite a Member
  </button>
  <button
    className="copy-action"
    type="button"
    onClick={() => copyValue(referralLink, "Invitation link")}
  >
    Copy Invitation Link
  </button>
  {copied && <p className="message">{copied}</p>}
</div>
    {scratchCards.map(card => (
      <div key={card.card_id} style={{
        padding: 18,
        marginBottom: 12,
        borderRadius: 14,
        background: "linear-gradient(135deg,#3b0764,#7e22ce)",
        color: "#fff"
      }}>
        <div style={{ fontSize: 32 }}>🎁</div>
        <strong>Scratch Card</strong>
        <p>Status: {card.card_status.toUpperCase()}</p>
        <small>{new Date(card.created_at).toLocaleDateString()}</small>
      </div>
    ))}
  </section>
</>}
        {screen === "Rewards" && <>
          <div className="pagehead"><h1>Referral Rewards</h1></div>
          <section className="section"><h2>Invite friends and earn</h2><p className="muted">Earn $0.50 for each eligible referral, subject to the referral rules.</p>
            <div className="rowline"><span>Reward per eligible referral</span><b>$0.50</b></div>
            <div className="rowline"><span>Your referral code</span><b>{referralCode || "Preparing..."}</b></div>
            <div className="referral-tools"><b>Your personal invitation code</b><div className="referral-value">{referralCode || "Preparing..."}</div>
              <button className="copy-action" type="button" onClick={() => copyValue(referralCode, "Referral code")}><Icon name="copy" size={15} /> Copy code</button>
              <div style={{ height: 13 }} /><b>Your personal referral link</b><div className="referral-value">{referralLink || "Preparing..."}</div>
              <button className="copy-action" type="button" onClick={() => copyValue(referralLink, "Referral link")}><Icon name="copy" size={15} /> Copy link</button>
              {copied && <div className="message">{copied}</div>}
            </div>
            <div className="notice">Referral rewards are subject to eligibility checks. Referral tracking and payouts must be enabled in the database.</div>
          </section>
        </>}

        {screen === "Settings" && <>
  <div className="pagehead"><h1>Settings</h1></div>
  <section className="section">
    <h2>Member profile</h2>
    <div className="rowline">
      <span>Name</span><b>{memberName}</b>
    </div>
    <div className="rowline">
      <span>Email</span><b>{user?.email || "—"}</b>
    </div>
    <div className="rowline">
      <span>Account status</span>
      <b>
        {activationStatus === "active"
          ? "Activated"
          : activationStatus === "pending"
          ? "Pending"
          : activationStatus === "rejected"
          ? "Rejected"
          : activationStatus === "unknown"
          ? "Status unavailable"
          : "Not activated"}
      </b>
    </div>
    <button
      className="primary"
      style={{ marginTop: 18 }}
      onClick={logout}
    >
      <Icon name="logout" size={18} /> Log out
    </button>
  </section>
</>}

      <nav className="bottom">
        <button className={screen === "Home" ? "active" : ""} onClick={() => openScreen("Home")}><Icon name="wallet" size={22} />Home</button>
        <button className={screen === "Earnings" ? "active" : ""} onClick={() => openScreen("Earnings")}><Icon name="chart" size={22} />Earnings</button>
        <button className={screen === "Rewards" ? "active" : ""} onClick={() => openScreen("Rewards")}><Icon name="gift" size={22} />Rewards</button>
        <button className={screen === "Settings" ? "active" : ""} onClick={() => openScreen("Settings")}><Icon name="settings" size={22} />Settings</button>
                  </nav>
      </div>
      <ActivationChat memberName={memberName} />
    </main>
  );
}
