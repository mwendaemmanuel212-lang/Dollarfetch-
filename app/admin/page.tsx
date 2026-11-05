"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Member = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
};

const tools = [
  { icon: "👥", title: "Members", note: "Member records" },
  { icon: "💳", title: "Deposits", note: "Payment review" },
  { icon: "🏦", title: "Withdrawals", note: "Authorization" },
  { icon: "✅", title: "Activation", note: "Activation requests" },
  { icon: "🧾", title: "Transactions", note: "Transaction records" },
  { icon: "📢", title: "Announcements", note: "Member notices" },
  { icon: "🎧", title: "Support Centre", note: "Member assistance" },
  { icon: "📊", title: "Reports", note: "Financial reports" },
  { icon: "🕘", title: "Admin History", note: "Action records" },
  { icon: "🛡️", title: "Security", note: "Admin protection" },
];

export default function AdminPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState("");
  const [email, setEmail] = useState("");

  async function loadMembers() {
    setLoading(true);
    setError("");

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      window.location.href = "/app/login";
      return;
    }

    setEmail(sessionData.session.user.email || "");

    const { data, error: rpcError } = await supabase.rpc(
      "admin_list_activation_requests"
    );

    if (rpcError) {
      setError("Administrator access check failed: " + rpcError.message);
      setLoading(false);
      return;
    }

    setMembers((data || []) as Member[]);
    setLoading(false);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  async function updateStatus(member: Member, status: string) {
    if (member.status !== "pending") {
      alert("This request is no longer pending.");
      return;
    }

    const action = status === "active" ? "APPROVE" : "REJECT";

    if (
      !confirm(
        `${action} activation for ${member.email}? Verify payment first.`
      )
    ) return;

    setWorking(member.user_id);
    setError("");

    const { error: updateError } = await supabase
      .from("activation_requests")
      .update({ status })
      .eq("user_id", member.user_id)
      .eq("status", "pending");

    if (updateError) {
      setError(updateError.message);
    } else {
      alert("Request updated.");
      await loadMembers();
    }

    setWorking("");
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/app/login";
  }

  if (loading) {
    return (
      <main style={{
        minHeight: "100vh",
        background: "#101b30",
        color: "white",
        padding: 30
      }}>
        Checking administrator access...
      </main>
    );
  }

  const pending = members.filter(m => m.status === "pending").length;
  const active = members.filter(m => m.status === "active").length;
  const rejected = members.filter(m => m.status === "rejected").length;

  const panel: React.CSSProperties = {
    background: "#1d2b43",
    border: "1px solid #30415c",
    borderRadius: 16,
    padding: 15,
  };

  const smallButton: React.CSSProperties = {
    border: "1px solid #52627b",
    background: "#293a55",
    color: "#f4f6fa",
    padding: "10px 12px",
    borderRadius: 9,
    fontWeight: 700,
  };

  if (error && members.length === 0) {
    return (
      <main style={{
        padding: 25,
        minHeight: "100vh",
        background: "#101b30",
        color: "white",
        fontFamily: "Arial"
      }}>
        <h2>BWK · DollarFetch Admin</h2>
        <p style={{ color: "#ffb4a9", overflowWrap: "anywhere" }}>{error}</p>
        <button onClick={loadMembers}>Try Again</button>
        <button onClick={logout} style={{ marginLeft: 10 }}>Log Out</button>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#101b30",
      color: "#f7f8fb",
      padding: "18px 14px 30px",
      fontFamily: "Arial, sans-serif",
      maxWidth: 900,
      margin: "0 auto"
    }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 2px 18px"
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>
            BWK · DollarFetch
          </div>
          <div style={{
            color: "#d5b96e",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.5,
            marginTop: 4
          }}>
            ADMINISTRATION CENTRE
          </div>
        </div>
        <div style={{ fontSize: 22 }}>🔔　👤</div>
      </header>

      <div style={{
        borderTop: "1px solid #35435a",
        paddingTop: 20,
        marginBottom: 17
      }}>
        <h1 style={{ fontSize: 25, margin: "0 0 5px" }}>
          Admin Dashboard
        </h1>
        <p style={{ color: "#aab8cc", fontSize: 13, margin: 0 }}>
          Welcome, Administrator · {email}
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2,minmax(0,1fr))",
        gap: 10
      }}>
        {[
          { label: "Activation requests", value: members.length, icon: "👥" },
          { label: "Pending requests", value: pending, icon: "🕒" },
          { label: "Activated", value: active, icon: "✅" },
          { label: "Rejected", value: rejected, icon: "⛔" },
        ].map(item => (
          <div key={item.label} style={panel}>
            <div style={{ color: "#d5b96e", fontSize: 20 }}>
              {item.icon}
            </div>
            <div style={{ fontSize: 27, fontWeight: 800, marginTop: 8 }}>
              {item.value}
            </div>
            <div style={{ color: "#b9c5d5", fontSize: 12, marginTop: 4 }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <section style={{
        ...panel,
        marginTop: 13,
        background: "#263650"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8
        }}>
          <strong>Financial overview</strong>
          <span style={{
            color: "#d5b96e",
            fontSize: 10,
            border: "1px solid #8d7846",
            borderRadius: 20,
            padding: "5px 8px"
          }}>
            AWAITING VERIFIED DATA
          </span>
        </div>
        <div style={{
          fontSize: 14,
          color: "#c7d2e1",
          marginTop: 12
        }}>
          Financial totals will appear here when deposit and withdrawal
          records are connected.
        </div>
      </section>

      <section style={{ marginTop: 22 }}>
        <h2 style={{
          fontSize: 16,
          letterSpacing: .7,
          margin: "0 0 12px"
        }}>
          MANAGEMENT CENTRE
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,minmax(0,1fr))",
          gap: 9
        }}>
          {tools.map(item => (
            <div key={item.title} style={{ ...panel, padding: 13 }}>
              <div style={{ fontSize: 22 }}>{item.icon}</div>
              <div style={{
                fontWeight: 700,
                fontSize: 13,
                marginTop: 8
              }}>
                {item.title}
              </div>
              <div style={{
                color: "#aab8cc",
                fontSize: 11,
                marginTop: 4
              }}>
                {item.note}
              </div>
              <div style={{
                color: "#d5b96e",
                fontSize: 9,
                marginTop: 9,
                letterSpacing: .5
              }}>
                PLANNED
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...panel, marginTop: 20 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10
        }}>
          <h2 style={{ fontSize: 17, margin: 0 }}>
            Member Activation Requests
          </h2>
          <button onClick={loadMembers} style={smallButton}>
            Refresh
          </button>
        </div>

        {error && <p style={{ color: "#ffb4a9" }}>{error}</p>}

        {members.length === 0 ? (
          <p style={{ color: "#aab8cc", fontSize: 13 }}>
            No activation requests found.
          </p>
        ) : (
          members.map(member => (
            <article key={member.user_id} style={{
              border: "1px solid #40516b",
              borderRadius: 12,
              padding: 13,
              marginTop: 12,
              overflowWrap: "anywhere"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                flexWrap: "wrap"
              }}>
                <strong>{member.full_name || "Member"}</strong>
                <span style={{
                  color:
                    member.status === "active"
                      ? "#72d6a0"
                      : member.status === "pending"
                      ? "#e7c46e"
                      : "#ff9b91",
                  fontSize: 11,
                  fontWeight: 800
                }}>
                  {member.status.toUpperCase()}
                </span>
              </div>

              <p style={{ color: "#c2cede", fontSize: 12 }}>
                Email: {member.email || "—"}
              </p>
              <p style={{ color: "#c2cede", fontSize: 12 }}>
                Phone: {member.phone || "—"}
              </p>
              <p style={{ color: "#c2cede", fontSize: 12 }}>
                Member ID: {member.user_id}
              </p>
              <p style={{ color: "#c2cede", fontSize: 12 }}>
                Fee: {member.currency} {member.amount}
              </p>
              <p style={{ color: "#c2cede", fontSize: 12 }}>
                Date: {new Date(member.created_at).toLocaleString()}
              </p>

              {member.status === "pending" && (
                <div style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap"
                }}>
                  <button
                    disabled={working === member.user_id}
                    onClick={() => updateStatus(member, "active")}
                    style={{
                      ...smallButton,
                      background: "#17633e",
                      border: 0
                    }}
                  >
                    Approve & Activate
                  </button>

                  <button
                    disabled={working === member.user_id}
                    onClick={() => updateStatus(member, "rejected")}
                    style={{
                      ...smallButton,
                      background: "#8f302d",
                      border: 0
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </section>

      <button onClick={logout} style={{
        width: "100%",
        padding: 15,
        marginTop: 18,
        background: "#d5b96e",
        color: "#101b30",
        border: 0,
        borderRadius: 11,
        fontWeight: 800
      }}>
        Log Out
      </button>

      <p style={{
        color: "#8796aa",
        textAlign: "center",
        fontSize: 10,
        marginTop: 15
      }}>
        BWK ADMIN · SECURE MANAGEMENT
      </p>
    </main>
  );
}
