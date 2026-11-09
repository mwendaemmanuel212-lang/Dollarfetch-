
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
  login_count?: number;
  last_login_at?: string | null;
  wallet_balance?: number;
  wallet_currency?: string;
};

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

type AdminRecord = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  enabled: boolean;
  created_at: string | null;
};

const sections: Record<string, { title: string; description: string }> = {
  members: {
    title: "Members",
    description: "Registered member accounts."
  },
  deposits: {
    title: "Deposits",
    description: "Member deposit records."
  },
  withdrawals: {
    title: "Withdrawals",
    description: "Withdrawal requests."
  },
  activation: {
    title: "Activation",
    description: "Member activation requests."
  },
  transactions: {
    title: "Transactions",
    description: "Transaction records."
  },
  announcements: {
    title: "Announcements",
    description: "Member announcements."
  },
  support: {
    title: "Support Centre",
    description: "Member support requests."
  },
  reports: {
    title: "Reports",
    description: "Financial and membership reports."
  },
  history: {
    title: "Admin History",
    description: "Administrator activity."
  },
  security: {
    title: "Security",
    description: "Administrator security controls."
  },
  admins: {
    title: "Active Admins",
    description: "Directory of enabled DollarFetch administrators and their contact details."
  },
  "scratch-verification": {
    title: "Scratch Verification",
    description: "Review referrals and unlock member scratch cards."
  }
};

export default function AdminSectionPage() {
  const params = useParams();
  const router = useRouter();

  const section = String(params.section || "");
  const item = sections[section];

  const [checking, setChecking] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [workingMember, setWorkingMember] = useState<string | null>(null);
  const [workingWalletMember, setWorkingWalletMember] = useState<string | null>(null);
  const [workingSpinMember, setWorkingSpinMember] = useState<string | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  async function updateMemberAccess(member: Member) {
    const userId = member.user_id || member.id;
    if (!userId) return;

    const activate = member.is_active === false;

    const confirmed = window.confirm(
      activate
        ? "Reactivate this member?"
        : "Deactivate this member?"
    );

    if (!confirmed) return;

    setWorkingMember(userId);
    setError("");

    const { error: updateError } = await supabase.rpc(
      "admin_set_member_active",
      {
        p_user_id: userId,
        p_is_active: activate
      }
    );

    if (updateError) {
      setError(updateError.message);
    } else {
      setMembers(current =>
        current.map(row =>
          (row.user_id || row.id) === userId
            ? { ...row, is_active: activate }
            : row
        )
      );
    }

    setWorkingMember(null);
  }

  async function updateMemberWallet(member: Member) {
    const userId = member.user_id || member.id;
    if (!userId) return;

    const balanceInput = window.prompt(
      "Enter the new wallet balance:",
      String(member.wallet_balance ?? 0)
    );

    if (balanceInput === null) return;

    const newBalance = Number(balanceInput);

    if (!Number.isFinite(newBalance) || newBalance < 0) {
      setError("Enter a valid balance.");
      return;
    }

    const note = window.prompt("Enter the private admin note:");

    if (!note || note.trim().length < 3) {
      setError("Please enter a note of at least 3 characters.");
      return;
    }

    setWorkingWalletMember(userId);
    setError("");

    const { error: walletError } = await supabase.rpc(
      "admin_set_member_wallet_balance",
      {
        p_user_id: userId,
        p_balance: newBalance,
        p_note: note.trim()
      }
    );

    if (walletError) {
      setError(walletError.message);
    } else {
      setMembers(current =>
        current.map(row =>
          (row.user_id || row.id) === userId
            ? { ...row, wallet_balance: newBalance }
            : row
        )
      );
    }

    setWorkingWalletMember(null);
  }

  async function addMemberSpinCredits(member: Member) {
    const userId = member.user_id || member.id;
    if (!userId) return;

    const input = window.prompt(
      "How many extra spins should this member receive?",
      "1"
    );

    if (input === null) return;

    const spins = Number(input);

    if (!Number.isInteger(spins) || spins < 1 || spins > 100) {
      setError("Enter a whole number from 1 to 100.");
      return;
    }

    setWorkingSpinMember(userId);
    setError("");

    const { data, error: spinError } = await supabase.rpc(
      "admin_add_lucky_spin_credits",
      {
        p_user_id: userId,
        p_spins: spins
      }
    );

    if (spinError) {
      setError(spinError.message);
    } else {
      alert(`Success! Member now has ${data} extra spins.`);
    }

    setWorkingSpinMember(null);
  }

  async function loadPage() {
    setLoading(true);
    setError("");

    if (section === "withdrawals") {
      const { data: rows, error: dbError } = await supabase.rpc(
        "admin_list_withdrawal_requests"
      );

      if (dbError) {
        setError(dbError.message);
      } else {
        setWithdrawals((rows || []) as Withdrawal[]);
      }
    }

    if (section === "members") {
      const { data: rows, error: dbError } = await supabase.rpc(
        "admin_list_members"
      );

      if (dbError) {
        setError(dbError.message);
      } else {
        setMembers((rows || []) as Member[]);
      }
    }

    if (section === "admins") {
      const { data: rows, error: dbError } = await supabase.rpc(
        "admin_list_active_admins"
      );

      if (dbError) {
        setError(dbError.message);
      } else {
        setAdmins((rows || []) as AdminRecord[]);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    async function checkAccess() {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !data.session) {
        router.replace("/app/login");
        return;
      }

      setChecking(false);

      if (
        section === "withdrawals" ||
        section === "members" ||
        section === "admins"
      ) {
        await loadPage();
      }
    }

    checkAccess();
  }, [router, section]);

  if (checking) {
    return (
      <main style={{ padding: 25, background: "#0b1425", color: "white", minHeight: "100vh" }}>
        Checking access...
      </main>
    );
  }

  if (!item) {
    return (
      <main style={{ padding: 25, background: "#0b1425", color: "white", minHeight: "100vh" }}>
        Section not found.
      </main>
    );
  }

  const panel: React.CSSProperties = {
    marginTop: 25,
    padding: 18,
    borderRadius: 16,
    background: "#1d2d48",
    border: "1px solid #30445f"
  };

  const card: React.CSSProperties = {
    marginTop: 14,
    padding: 15,
    borderRadius: 12,
    background: "#263b5b",
    border: "1px solid #405779",
    overflowWrap: "anywhere"
  };

  const button: React.CSSProperties = {
    padding: "11px 16px",
    border: 0,
    borderRadius: 8,
    color: "white",
    fontWeight: 700,
    cursor: "pointer"
  };

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

      {error && (
        <div style={{
          marginTop: 15,
          padding: 12,
          borderRadius: 10,
          background: "#512b36",
          color: "#ffc1c1",
          overflowWrap: "anywhere"
        }}>
          {error}
        </div>
      )}

      {section === "admins" ? (
        <section style={panel}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap"
          }}>
            <h2 style={{ margin: 0 }}>
              Active Administrators ({admins.length})
            </h2>

            <button
              onClick={loadPage}
              style={{ ...button, background: "#315b91" }}
            >
              ↻ Refresh
            </button>
          </div>

          <p style={{
            color: "#b9c5d5",
            fontSize: 12,
            lineHeight: 1.6
          }}>
            This directory displays administrators whose access is currently enabled.
            Contact details are taken from their registered account information.
          </p>

          {loading && <p>Loading administrators...</p>}

          {!loading && admins.length === 0 && (
            <p style={{ color: "#b9c5d5" }}>
              No active administrators were returned.
            </p>
          )}

          {admins.map(admin => (
            <article key={admin.user_id} style={card}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap"
              }}>
                <h3 style={{
                  color: "#c4b5fd",
                  margin: "0 0 8px"
                }}>
                  {admin.full_name ||
                    (admin.email
                      ? admin.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, letter => letter.toUpperCase())
                      : "Administrator")}
                </h3>

                <span style={{
                  color: "#72e0a0",
                  background: "rgba(34,197,94,.12)",
                  border: "1px solid #28794d",
                  padding: "5px 9px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 900
                }}>
                  ACTIVE
                </span>
              </div>

              <p style={{
                color: "#d2dbea",
                fontSize: 13,
                lineHeight: 1.9,
                marginBottom: 0
              }}>
                Email: {admin.email || "Not provided"}
                <br />
                Mobile: {admin.phone || "Not provided"}
                <br />
                Admin ID: {admin.user_id}
                <br />
                Added: {admin.created_at
                  ? new Date(admin.created_at).toLocaleString()
                  : "Date unavailable"}
              </p>
            </article>
          ))}
        </section>
      ) : section === "withdrawals" ? (
        <div style={panel}>
          <h2>Withdrawal Requests ({withdrawals.length})</h2>

          {loading && <p>Loading withdrawals...</p>}

          {!loading && withdrawals.length === 0 && (
            <p>No withdrawal requests found.</p>
          )}

          {withdrawals.map(row => (
            <div key={row.id} style={card}>
              <h3>{row.full_name || row.email || row.user_id}</h3>
              <p>Email: {row.email || "Not available"}</p>
              <p>Amount: {row.currency} {row.amount}</p>
              <p>Method: {row.method}</p>
              <p>Payment details: {row.destination_details}</p>
              <p>Status: {row.status}</p>
              <p>Admin note: {row.admin_note || "None"}</p>

              {row.status === "pending" && (
                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  <button
                    onClick={() => reviewWithdrawal(row.id, "approved")}
                    style={{ ...button, background: "#16834a" }}
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => reviewWithdrawal(row.id, "rejected")}
                    style={{ ...button, background: "#b83232" }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : section === "members" ? (
        <div style={panel}>
          <h2>Registered Members ({members.length})</h2>

          {loading && <p>Loading members...</p>}

          {!loading && !error && members.length === 0 && (
            <p>No members found in the profiles table.</p>
          )}

          {members.map((member, index) => (
            <div key={member.user_id || member.id || index} style={card}>
              <h3 style={{ color: "#8ebeff" }}>
                {member.full_name || "Name not provided"}
              </h3>

              <p>Email: {member.email || "Not provided"}</p>
              <p>Phone: {member.phone || "Not provided"}</p>
              <p>
                Status: {member.activation_status || member.status || "Pending verification"}
              </p>
              <p>
                Account: {member.is_active === false ? "DEACTIVATED" : "ACTIVE"}
              </p>
              <p>
                Registered: {member.created_at
                  ? new Date(member.created_at).toLocaleString()
                  : "Date unavailable"}
              </p>
              <p>Total Logins: {member.login_count ?? 0}</p>
              <p>
                Last Login: {member.last_login_at
                  ? new Date(member.last_login_at).toLocaleString()
                  : "No login recorded yet"}
              </p>
              <p>
                Wallet Balance: {member.wallet_currency || "USD"} {Number(member.wallet_balance ?? 0).toFixed(2)}
              </p>

              <button
                onClick={() => addMemberSpinCredits(member)}
                disabled={workingSpinMember === (member.user_id || member.id)}
                style={{
                  ...button,
                  marginTop: 12,
                  marginRight: 10,
                  background: "#d97706"
                }}
              >
                {workingSpinMember === (member.user_id || member.id)
                  ? "Adding..."
                  : "Add Extra Spins"}
              </button>

              <button
                onClick={() => updateMemberWallet(member)}
                disabled={workingWalletMember === (member.user_id || member.id)}
                style={{
                  ...button,
                  marginTop: 12,
                  marginRight: 10,
                  background: "#8b5cf6"
                }}
              >
                {workingWalletMember === (member.user_id || member.id)
                  ? "Saving..."
                  : "Edit Wallet Balance"}
              </button>

              <button
                onClick={() => updateMemberAccess(member)}
                disabled={workingMember === (member.user_id || member.id)}
                style={{
                  ...button,
                  marginTop: 12,
                  background: member.is_active === false ? "#16834a" : "#b83232"
                }}
              >
                {workingMember === (member.user_id || member.id)
                  ? "Please wait..."
                  : member.is_active === false
                    ? "Reactivate Member"
                    : "Deactivate Member"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={panel}>
          <h3>{item.title} Management</h3>
          <p>{item.description}</p>
          <p>Management features will be connected in the next steps.</p>
        </div>
      )}
    </main>
  );
          }
                
