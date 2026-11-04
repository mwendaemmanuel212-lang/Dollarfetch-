"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Tab =
  | "Dashboard"
  | "Deposit"
  | "Withdraw"
  | "Transactions"
  | "Referrals"
  | "Profile";

const paymentMethods = [
  "M-PESA",
  "Postbank",
  "Equity Bank",
  "Binance",
  "Airtel Money",
  "SIM Toolkit",
];

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [activationStatus, setActivationStatus] = useState("not_requested");
  const [paymentMethod, setPaymentMethod] = useState("M-PESA");
  const [phone, setPhone] = useState("+254");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data.user) {
        window.location.href = "/login";
        return;
      }

      setUser(data.user);

      const { data: request } = await supabase
        .from("activation_requests")
        .select("status")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (request?.status) {
        setActivationStatus(request.status.toLowerCase());
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  async function requestActivation() {
    if (!user) return;

    if (paymentMethod === "M-PESA" && !/^\+\d{8,15}$/.test(phone)) {
      setMessage("Enter your phone number with country code, for example +254712345678.");
      return;
    }

    setSending(true);
    setMessage("");

    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        activation_payment_method: paymentMethod,
        activation_phone: paymentMethod === "M-PESA" ? phone : null,
      },
    });

    if (metadataError) {
      setMessage(metadataError.message);
      setSending(false);
      return;
    }

    const { error } = await supabase
      .from("activation_requests")
      .insert({
        user_id: user.id,
        amount: 2,
        currency: "USD",
        status: "pending",
      });

    if (error) {
      setMessage("Could not submit your activation request: " + error.message);
    } else {
      setActivationStatus("pending");
      setMessage(
        "Your activation request has been submitted. Your account will only be activated after payment is verified."
      );
    }

    setSending(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function copyReferralLink() {
    if (!user) return;

    const referralCode = user.id.slice(0, 8).toUpperCase();
    const link =
      `${window.location.origin}/register?ref=${referralCode}`;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage("Unable to copy the referral link on this device.");
    }
  }

  const referralCode = user?.id
    ? user.id.slice(0, 8).toUpperCase()
    : "";

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-blue-900 font-semibold">
          Loading BWK DollarFetch...
        </p>
      </main>
    );
  }

  const menu: Tab[] = [
    "Dashboard",
    "Deposit",
    "Withdraw",
    "Transactions",
    "Referrals",
    "Profile",
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-[#073b83] text-white px-4 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white text-[#073b83] flex items-center justify-center font-black text-xl">
              BWK
            </div>

            <div>
              <h1 className="font-bold text-xl">DollarFetch</h1>
              <p className="text-xs text-blue-100">
                BWK Member Dashboard
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-[#073b83]">
            Welcome to DollarFetch
          </h2>
          <p className="text-sm text-slate-500 break-all">
            {user?.email}
          </p>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-3 mb-5">
          {menu.map((item) => (
            <button
              key={item}
              onClick={() => {
                setTab(item);
                setMessage("");
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold ${
                tab === item
                  ? "bg-[#073b83] text-white"
                  : "bg-white text-[#073b83] border border-blue-100"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {message && (
          <div className="mb-5 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-sm">
            {message}
          </div>
        )}

        {activationStatus !== "active" &&
          activationStatus !== "approved" && (
            <section className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-blue-100">
              <h2 className="text-xl font-bold text-[#073b83] mb-2">
                Account Activation
              </h2>

              <p className="text-sm text-slate-600 mb-4">
                Choose your preferred payment method to request account
                activation.
              </p>

              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-slate-600">
                  Account activation fee
                </p>
                <p className="text-3xl font-black text-[#073b83]">
                  $2 USD
                </p>
              </div>

              <label className="block font-semibold text-sm mb-2">
                Select payment method
              </label>

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 mb-4 bg-white"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>

              {paymentMethod === "M-PESA" && (
                <div className="mb-4">
                  <label className="block font-semibold text-sm mb-2">
                    M-PESA phone number
                  </label>

                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254712345678"
                    className="w-full border border-slate-300 rounded-xl p-3"
                  />

                  <p className="text-xs text-slate-500 mt-2">
                    Include your country calling code, for example +254.
                  </p>
                </div>
              )}

              <button
                onClick={requestActivation}
                disabled={sending || activationStatus === "pending"}
                className="w-full bg-[#073b83] hover:bg-blue-900 disabled:opacity-50 text-white font-bold py-3 rounded-xl"
              >
                {sending
                  ? "Submitting..."
                  : activationStatus === "pending"
                  ? "Activation Pending"
                  : "Submit Activation Request"}
              </button>

              <p className="text-xs text-slate-500 mt-3">
                Payment processing and automatic verification are not
                connected yet. Do not send money until an official payment
                method has been configured and verified.
              </p>

              {activationStatus === "pending" && (
                <p className="mt-3 text-amber-700 font-semibold text-sm">
                  Your activation request is awaiting verification.
                </p>
              )}
            </section>
          )}

        {activationStatus === "active" ||
        activationStatus === "approved" ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 text-green-800">
            Your account is active.
          </div>
        ) : null}

        {tab === "Dashboard" && (
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#073b83] text-white rounded-2xl p-5 shadow">
                <p className="text-blue-100 text-sm">
                  Available Balance
                </p>
                <h2 className="text-3xl font-black mt-2">
                  $0.00
                </h2>
                <p className="text-xs text-blue-100 mt-2">
                  USD wallet balance
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-slate-500 text-sm">
                  Account Status
                </p>
                <h2 className="text-xl font-bold text-[#073b83] mt-2">
                  {activationStatus === "active" ||
                  activationStatus === "approved"
                    ? "Active"
                    : activationStatus === "pending"
                    ? "Pending"
                    : "Not Activated"}
                </h2>
                <p className="text-xs text-slate-500 mt-2">
                  Activation verification status
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
              <h3 className="font-bold text-lg text-[#073b83] mb-3">
                Quick Actions
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["Deposit", "Withdraw", "Transactions", "Referrals"] as Tab[]).map(
                  (item) => (
                    <button
                      key={item}
                      onClick={() => setTab(item)}
                      className="bg-blue-50 hover:bg-blue-100 text-[#073b83] font-semibold p-4 rounded-xl text-sm"
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-lg text-[#073b83] mb-2">
                Member Information
              </h3>
              <p className="text-sm text-slate-600 break-all">
                Email: {user?.email}
              </p>
              <p className="text-sm text-slate-600 mt-2">
                Member ID: {user?.id}
              </p>
            </div>
          </section>
        )}

        {tab === "Deposit" && (
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-xl font-bold text-[#073b83] mb-3">
              Deposit
            </h2>

            <p className="text-slate-600 text-sm mb-4">
              Select a payment method for your deposit.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <div
                  key={method}
                  className="border border-blue-100 rounded-xl p-4 font-semibold text-[#073b83]"
                >
                  {method}
                </div>
              ))}
            </div>

            <p className="text-sm text-amber-700 mt-5">
              Deposit processing is not connected yet. No deposit will
              be credited until payment verification is implemented.
            </p>
          </section>
        )}

        {tab === "Withdraw" && (
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-xl font-bold text-[#073b83] mb-3">
              Withdraw Funds
            </h2>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="font-bold text-amber-800">
                Admin authorization required
              </p>
              <p className="text-sm text-amber-700 mt-2">
                Withdrawal requests must be reviewed and authorized by
                the administrator before funds can be released.
              </p>
            </div>
          </section>
        )}

        {tab === "Transactions" && (
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-xl font-bold text-[#073b83] mb-3">
              Transactions
            </h2>

            <div className="text-center py-10">
              <p className="text-slate-500">
                No transactions to display yet.
              </p>
            </div>
          </section>
        )}

        {tab === "Referrals" && (
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-xl font-bold text-[#073b83] mb-3">
              Referral Program
            </h2>

            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-slate-600">
                Referral reward
              </p>
              <p className="text-3xl font-black text-[#073b83]">
                $0.50
              </p>
              <p className="text-xs text-slate-500 mt-1">
                For each referred member whose activation is verified.
              </p>
            </div>

            <p className="font-semibold text-sm mb-2">
              Your referral code
            </p>

            <div className="flex gap-2 items-center">
              <div className="flex-1 bg-slate-100 rounded-xl p-3 font-bold text-[#073b83]">
                {referralCode}
              </div>

              <button
                onClick={copyReferralLink}
                className="bg-[#073b83] text-white px-4 py-3 rounded-xl text-sm font-semibold"
              >
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-3">
              Referral rewards are subject to verified registrations
              and activation. Referral tracking must be connected to
              the referral database before rewards can be credited.
            </p>
          </section>
        )}

        {tab === "Profile" && (
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-xl font-bold text-[#073b83] mb-4">
              Member Profile
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500">Email Address</p>
                <p className="font-semibold break-all">
                  {user?.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Member ID</p>
                <p className="font-semibold break-all text-sm">
                  {user?.id}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Account Status</p>
                <p className="font-semibold">
                  {activationStatus === "active" ||
                  activationStatus === "approved"
                    ? "Active"
                    : activationStatus === "pending"
                    ? "Pending verification"
                    : "Not activated"}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-3 rounded-xl"
            >
              Logout
            </button>
          </section>
        )}

        <footer className="text-center text-xs text-slate-400 py-8">
          BWK DollarFetch © 2026. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
