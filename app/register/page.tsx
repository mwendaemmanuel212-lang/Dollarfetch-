
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

    if (
      digits.startsWith(dialCode) &&
      digits.length === expectedLength + dialCode.length
    ) {
      digits = digits.slice(dialCode.length);
    }

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

  const inputStyle: CSSProperties = {
    display: "block",
    width: "100%",
    padding: "14px 15px",
    marginTop: 8,
    boxSizing: "border-box",
    background: "#071F18",
    border: "1px solid #315744",
    borderRadius: 12,
    color: "#FFFFFF",
    fontSize: 15,
    outline: "none",
    minHeight: 49
  };

  const labelStyle: CSSProperties = {
    display: "block",
    color: "#E8C76C",
    fontSize: 13,
    fontWeight: 600,
    marginTop: 17,
    letterSpacing: "0.2px"
  };

  const helperStyle: CSSProperties = {
    display: "block",
    color: "#A9BDB1",
    fontSize: 11,
    lineHeight: 1.6,
    marginTop: 7
  };

  return (
    <main style={{
      minHeight: "100vh",
      width: "100%",
      boxSizing: "border-box",
      background: "radial-gradient(circle at top, #17432D 0%, #071F18 48%, #04140F 100%)",
      padding: "28px 15px 35px",
      fontFamily: "Arial, sans-serif",
      color: "#FFFFFF"
    }}>
      <div style={{
        maxWidth: 440,
        margin: "0 auto"
      }}>
        <header style={{
          textAlign: "center",
          marginBottom: 23
        }}>
          <div style={{
            width: 66,
            height: 66,
            borderRadius: 20,
            margin: "0 auto 13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(145deg, #F1D17B, #B88D36)",
            color: "#071F18",
            fontSize: 24,
            fontWeight: 900,
            boxShadow: "0 8px 28px rgba(214,180,95,0.22)"
          }}>
            BWK
          </div>

          <h1 style={{
            color: "#F1D17B",
            fontSize: 27,
            margin: "0 0 7px",
            fontWeight: 800,
            letterSpacing: "0.3px"
          }}>
            Join DollarFetch
          </h1>

          <p style={{
            color: "#B9CFC1",
            fontSize: 13,
            margin: 0
          }}>
            Create your account and get started
          </p>
        </header>

        <section style={{
          background: "linear-gradient(160deg, #103526, #0A251B)",
          border: "1px solid rgba(214,180,95,0.27)",
          borderRadius: 22,
          padding: "23px 20px",
          boxShadow: "0 18px 55px rgba(0,0,0,0.3)"
        }}>
          <form onSubmit={register}>
            <label style={labelStyle}>Full name</label>
            <input
              required
              style={inputStyle}
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
            />

            <label style={labelStyle}>Email</label>
            <input
              required
              type="email"
              style={inputStyle}
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />

            <label style={labelStyle}>Country code</label>
            <select
              style={{
                ...inputStyle,
                colorScheme: "dark",
                cursor: "pointer"
              }}
              value={countryCode}
              onChange={e => setCountryCode(e.target.value)}
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
            </select>

            <label style={labelStyle}>
              Mobile / M-PESA phone number
            </label>
            <input
              required
              type="tel"
              style={inputStyle}
              placeholder="712345678"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              autoComplete="tel-national"
            />
            <small style={helperStyle}>
              Enter your number without the country code.
            </small>

            <label style={labelStyle}>Password</label>
            <input
              required
              type="password"
              minLength={8}
              style={inputStyle}
              placeholder="Create a strong password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <small style={helperStyle}>
              Minimum 8 characters, uppercase, lowercase, number and special character.
            </small>

            <label style={labelStyle}>Confirm password</label>
            <input
              required
              type="password"
              style={inputStyle}
              placeholder="Enter your password again"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />

            <label style={labelStyle}>
              Referral code <span style={{ color: "#A9BDB1", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              style={inputStyle}
              placeholder="Enter invitation code"
              value={referralCode}
              onChange={e => setReferralCode(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: 16,
                marginTop: 25,
                background: loading
                  ? "#9D854B"
                  : "linear-gradient(100deg, #B88D36, #F1D17B, #D6B45F)",
                color: "#10251A",
                border: "none",
                borderRadius: 13,
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "0.7px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 7px 22px rgba(214,180,95,0.18)"
              }}
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>
          </form>

          {message && (
            <div
              role="status"
              style={{
                marginTop: 17,
                padding: 13,
                borderRadius: 10,
                background: message.toLowerCase().includes("success") ||
                  message.toLowerCase().includes("created")
                  ? "rgba(46,160,95,0.15)"
                  : "rgba(220,70,70,0.12)",
                border: "1px solid rgba(214,180,95,0.25)",
                color: "#F1D17B",
                fontSize: 13,
                lineHeight: 1.6,
                textAlign: "center"
              }}
            >
              {message}
            </div>
          )}

          <div style={{
            textAlign: "center",
            marginTop: 22,
            fontSize: 13,
            color: "#C3D2C8"
          }}>
            Already registered?{" "}
            <a
              href="/app/login"
              style={{
                color: "#F1D17B",
                fontWeight: 700,
                textDecoration: "none"
              }}
            >
              Log in
            </a>
          </div>
        </section>

        <footer style={{
          textAlign: "center",
          marginTop: 23,
          color: "#91A99A",
          fontSize: 11,
          letterSpacing: "0.5px"
        }}>
          Powered by <strong style={{ color: "#D6B45F" }}>BWK Solutions</strong>
        </footer>
      </div>
    </main>
  );
      }
                
