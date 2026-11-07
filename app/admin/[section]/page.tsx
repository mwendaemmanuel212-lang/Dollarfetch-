
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Member = {
  id?: string;
  user_id?: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  status?: string | null;
  activation_status?: string | null;
  created_at?: string | null;
  is_active?: boolean;
}
type Withdrawal = {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  amount: number;
  currency: string;
  method: string;
  destination_details: string;
  status: string;
  admin_note: string | null;
  created_at: string;
};

const sections: Record<string, { title: string; description: string }> = {
  members: { title: "Members", description: "Registered member accounts." },
  deposits: { title: "Deposits", description: "Member deposit records." },
  withdrawals: { title: "Withdrawals", description: "Withdrawal requests." },
  activation: { title: "Activation", description: "Member activation requests." },
  transactions: { title: "Transactions", description: "Transaction records." },
  announcements: { title: "Announcements", description: "Member announcements." },
  support: { title: "Support Centre", description: "Member support requests." },
  reports: { title: "Reports", description: "Financial and membership reports." },
  history: { title: "Admin History", description: "Administrator activity." },
  security: { title: "Security", description: "Administrator security controls." }
};

export default function AdminSectionPage() {
  const params = useParams();
  const router = useRouter();

  const section = String(params.section || "");
  const item = sections[section];

async function reviewWithdrawal(
  requestId: string,
  decision: "approved" | "rejected"
) {
  const note = window.prompt("Optional admin note:") || null;

  const { error: reviewError } = await supabase.rpc(
    "admin_review_withdrawal_request",
    {
      p_request_id: requestId,
      p_status: decision,
      p_admin_note: note
    }
  );

  if (reviewError) {
    setError(reviewError.message);
    return;
  }

  setWithdrawals(current =>
    current.map(row =>
      row.id === requestId
        ? { ...row, status: decision, admin_note: note }
        : row
    )
  );
}
  
  const [checking, setChecking] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPage() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/app/login");
        return;
      }

      setChecking(false);
      if (section === "withdrawals") {
  setLoading(true);
  setError("");

  const { data: rows, error: dbError } = await supabase.rpc(
    "admin_list_withdrawal_requests"
  );

  if (dbError) {
    setError(dbError.message);
  } else {
    setWithdrawals((rows || []) as Withdrawal[]);
  }

  setLoading(false);
      }

      if (section === "members") {
        setLoading(true);
        setError("");

        const { data: rows, error: dbError } = await supabase.rpc(
  "admin_list_members"
);

        if (dbError) {
          setError(dbError.message);
        } else {
          setMembers((rows || []) as Member[]);
        }

        setLoading(false);
      }
    }

    loadPage();
  }, [router, section]);

  if (checking) {
    return <main style={{ padding: 25 }}>Checking access...</main>;
  }

  if (!item) {
    return <main style={{ padding: 25 }}>Section not found.</main>;
  }

  return (
    <main style={{
      minHeight: "100vh",
      padding: 22,
      background: "#0b1425",
      color: "white",
      fontFamily: "Arial, sans-serif"
    }}>
      <button
        onClick={() => router.push("/admin")}
        style={{
          padding: "11px 17px",
          borderRadius: 10,
          border: "1px solid #52627b",
          background: "#203653",
          color: "white",
          fontWeight: 700
        }}
      >
        ← Back to Dashboard
      </button>

      <h1 style={{ marginTop: 30, color: "#8ebeff" }}>
        BWK · {item.title}
      </h1>

      <p style={{ color: "#b9c5d5" }}>{item.description}</p>

      {section === "withdrawals" ? (
  <div style={{
    marginTop: 25,
    padding: 18,
    borderRadius: 16,
    background: "#1d2d48"
  }}>
    <h2>Withdrawal Requests ({withdrawals.length})</h2>

    {loading && <p>Loading withdrawals...</p>}

    {error && <p style={{ color: "#ff9999" }}>{error}</p>}

    {!loading && withdrawals.length === 0 && (
      <p>No withdrawal requests found.</p>
    )}

    {withdrawals.map(row => (
      <div key={row.id} style={{
        marginTop: 15,
        padding: 15,
        borderRadius: 12,
        background: "#263b5b"
      }}>
        <h3>{row.full_name || row.email || row.user_id}</h3>
        <p>Email: {row.email || "Not available"}</p>
        <p>Amount: {row.currency} {row.amount}</p>
        <p>Method: {row.method}</p>
        <p>Payment details: {row.destination_details}</p>
        <p>Status: {row.status}</p>
        <p>Admin note: {row.admin_note || "None"}</p>

        {row.status === "pending" && (
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button
              onClick={() => reviewWithdrawal(row.id, "approved")}
              style={{
                padding: 12,
                background: "#16834a",
                color: "white",
                border: 0,
                borderRadius: 8
              }}
            >
              Approve
            </button>

            <button
              onClick={() => reviewWithdrawal(row.id, "rejected")}
              style={{
                padding: 12,
                background: "#b83232",
                color: "white",
                border: 0,
                borderRadius: 8
              }}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    ))}
  </div>
) : section === "members" ? (
        <div style={{
          marginTop: 25,
          padding: 18,
          borderRadius: 16,
          background: "#1d2d48",
          border: "1px solid #30445f"
        }}>
          <h2>Registered Members ({members.length})</h2>

          {loading && <p>Loading members...</p>}

          {error && (
            <p style={{ color: "#ff9999" }}>
              Database error: {error}
            </p>
          )}

          {!loading && !error && members.length === 0 && (
            <p>No members found in the profiles table.</p>
          )}

          {members.map((member, index) => (
            <div key={member.user_id || member.id || index} style={{
              marginTop: 14,
              padding: 15,
              borderRadius: 12,
              background: "#263b5b",
              border: "1px solid #405779"
            }}>
              <h3 style={{ color: "#8ebeff" }}>
                {member.full_name || "Name not provided"}
              </h3>
              <p>Email: {member.email || "Not provided"}</p>
              <p>Phone: {member.phone || "Not provided"}</p>
              <p>
                Status: {member.activation_status || member.status || "Pending verification"}
              </p>
              <p>
                Registered: {member.created_at
                  ? new Date(member.created_at).toLocaleString()
                  : "Date unavailable"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          marginTop: 25,
          padding: 20,
          borderRadius: 16,
          background: "#1d2d48"
        }}>
          <h3>{item.title} Management</h3>
          <p>{item.description}</p>
          <p>Management features will be connected in the next steps.</p>
        </div>
      )}
    </main>
  );
}
