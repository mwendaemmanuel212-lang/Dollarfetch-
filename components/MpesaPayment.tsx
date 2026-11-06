
"use client";

import { useState } from "react";

type Props = {
  accessToken: string;
};

export default function MpesaPayment({ accessToken }: Props) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function payWithMpesa() {
    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^[17]\d{8}$/.test(cleanPhone)) {
      setMessage("Enter a valid Kenyan M-PESA number.");
      setSuccess(false);
      return;
    }

    if (!accessToken) {
      setMessage("Please log in again.");
      setSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/daraja/stkpush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          phone: `254${cleanPhone}`,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "STK Push failed.");
      }

      setSuccess(true);
      setMessage(
        result.message || "STK prompt sent. Check your phone."
      );
    } catch (error) {
      setSuccess(false);
      setMessage(
        error instanceof Error ? error.message : "Payment failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.heading}>Activate with M-PESA</h2>

      <p style={styles.description}>
        Enter your M-PESA number to receive a payment prompt.
      </p>

      <label style={styles.label}>M-PESA phone number</label>

      <div style={styles.phoneBox}>
        <div style={styles.logo}>M-PESA</div>
        <strong style={styles.prefix}>+254</strong>
        <input
          type="tel"
          inputMode="numeric"
          placeholder="7XX XXX XXX"
          maxLength={9}
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))
          }
          style={styles.input}
        />
      </div>

      <div style={styles.nameBox}>
        <small style={styles.smallHeading}>
          REGISTERED ACCOUNT NAME
        </small>
        <p style={styles.nameText}>
          Automatic name verification is not available yet.
        </p>
        <small style={styles.hint}>
          Please confirm that this is your own M-PESA number.
        </small>
      </div>

      <div style={styles.amountRow}>
        <span>Activation fee</span>
        <strong>$2 equivalent in KES</strong>
      </div>

      <button
        onClick={payWithMpesa}
        disabled={loading}
        style={{
          ...styles.button,
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Sending STK Push..." : "Send STK Push"}
      </button>

      {message && (
        <p
          style={{
            ...styles.message,
            color: success ? "#168443" : "#c0392b",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
    color: "#173b2b",
  },
  heading: {
    fontSize: 21,
    margin: "0 0 8px",
  },
  description: {
    color: "#718078",
    fontSize: 13,
    marginBottom: 20,
  },
  label: {
    display: "block",
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 8,
  },
  phoneBox: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    border: "1px solid #cbd8cf",
    borderRadius: 11,
    padding: "10px",
    marginBottom: 14,
  },
  logo: {
    color: "#168443",
    fontWeight: 900,
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  prefix: {
    color: "#263c30",
  },
  input: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    fontSize: 16,
    padding: 5,
    color: "#263c30",
    background: "transparent",
  },
  nameBox: {
    background: "#f0f6f1",
    borderRadius: 10,
    padding: 13,
    marginBottom: 17,
  },
  smallHeading: {
    color: "#52705d",
    fontWeight: 700,
    fontSize: 10,
  },
  nameText: {
    fontSize: 13,
    fontWeight: 600,
    margin: "7px 0",
  },
  hint: {
    color: "#718078",
    fontSize: 11,
  },
  amountRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    fontSize: 13,
    marginBottom: 17,
  },
  button: {
    width: "100%",
    padding: 15,
    border: "none",
    borderRadius: 10,
    background: "#168443",
    color: "white",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
  message: {
    fontSize: 13,
    marginTop: 13,
  },
};
      
