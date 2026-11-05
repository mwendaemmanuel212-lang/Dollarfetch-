
"use client";

import { useState } from "react";
import type { FormEvent, CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

const countries = [
  { code: "+254", name: "Kenya", length: 9 },
  { code: "+256", name: "Uganda", length: 9 },
  { code: "+255", name: "Tanzania", length: 9 },
  { code: "+250", name: "Rwanda", length: 9 },
  { code: "+1", name: "USA/Canada", length: 10 },
  { code: "+44", name: "United Kingdom", length: 10 },
  { code: "+27", name: "South Africa", length: 9 },
  { code: "+234", name: "Nigeria", length: 10 },
  { code: "+91", name: "India", length: 10 },
  { code: "+971", name: "UAE", length: 9 }
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+254");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedCountry = countries.find(
    country => country.code === countryCode
  );

  function normalizePhone(value: string) {
    let digits = value.replace(/\D/g, "");
    const dialCode = countryCode.replace(/\D/g, "");
    const expectedLength = selectedCountry?.length ?? 9;

    // Remove pasted international country code.
    if (
      digits.startsWith(dialCode) &&
      digits.length === expectedLength + dialCode.length
    ) {
      digits = digits.slice(dialCode.length);
    }

    // Remove the national trunk zero where applicable.
    if (digits.length === expectedLength + 1 && digits.startsWith("0")) {
      digits = digits.slice(1);
    }

    return digits;
  }

  async function register(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setMessage("Please enter your full name.");
      return;
    }

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      setMessage(
        "Password must have at least 8 characters, an uppercase letter, a lowercase letter, a number and a special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Your passwords do not match.");
      return;
    }

    const cleanPhone = normalizePhone(phone);

    if (
      !selectedCountry ||
      cleanPhone.length !== selectedCountry.length
    ) {
      setMessage(
        `Please enter a valid ${selectedCountry?.name ?? "country"} mobile number.`
      );
      return;
    }

    const fullPhone = countryCode + cleanPhone;

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            phone: fullPhone,
            country_code: countryCode,
            referral_code: referralCode.trim().toUpperCase()
          }
        }
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(
        data.session
          ? "Account created successfully! You can now log in."
          : "Account created! Check your email to confirm registration."
      );
    } catch {
      setMessage("Registration failed. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  const style: CSSProperties = {
    display: "block",
    width: "100%",
    padding: 12,
    margin: "8px 0 16px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: 6
  };

  return (
    <main style={{
      maxWidth: 400,
      margin: "40px auto",
      padding: 20,
      fontFamily: "Arial"
    }}>
      <h1 style={{ color: "#073b83" }}>BWK</h1>
      <h2>Join DollarFetch</h2>

      <form onSubmit={register}>
        <label>Full name</label>
        <input
          required
          style={style}
          value={name}
          onChange={e => setName(e.target.value)}
          autoComplete="name"
        />

        <label>Email</label>
        <input
          required
          type="email"
          style={style}
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
        />

        <label>Country code</label>
        <select
          style={style}
          value={countryCode}
          onChange={e => setCountryCode(e.target.value)}
        >
          {countries.map(country => (
            <option key={country.code} value={country.code}>
              {country.name} ({country.code})
            </option>
          ))}
        </select>

        <label>Mobile / M-PESA phone number</label>
        <input
          required
          type="tel"
          style={style}
          placeholder="712345678"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          autoComplete="tel-national"
        />
        <small style={{ color: "#64748b" }}>
          Enter your number without the country code.
        </small>

        <label style={{ display: "block", marginTop: 16 }}>
          Password
        </label>
        <input
          required
          type="password"
          minLength={8}
          style={style}
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <small style={{ color: "#64748b" }}>
          Minimum 8 characters, uppercase, lowercase, number and special character.
        </small>

        <label style={{ display: "block", marginTop: 16 }}>
          Confirm password
        </label>
        <input
          required
          type="password"
          style={style}
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />

        <label>Referral code (optional)</label>
        <input
          style={style}
          placeholder="Enter invitation code"
          value={referralCode}
          onChange={e => setReferralCode(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 14,
            background: "#073b83",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p style={{ color: "#b91c1c" }}>{message}</p>
      <a href="/app/login">Already registered? Log in</a>
    </main>
  );
}
