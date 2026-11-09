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

const sections = [
  { icon: "users", title: "Members", note: "Member records", color: "#60a5fa" },
  { icon: "wallet", title: "Deposits", note: "Payment review", color: "#34d399" },
  { icon: "bank", title: "Withdrawals", note: "Withdrawal authorization", color: "#fbbf24" },
  { icon: "shield", title: "Activation", note: "Approvals and activation codes", color: "#c4b5fd" },
  { icon: "receipt", title: "Transactions", note: "Transaction records", color: "#fb7185" },
  { icon: "megaphone", title: "Announcements", note: "Member notices", color: "#f9a8d4" },
  { icon: "support", title: "Support Centre", note: "Member assistance", color: "#67e8f9" },
  { icon: "chart", title: "Reports", note: "Financial reports", color: "#86efac" },
  { icon: "history", title: "Admin History", note: "Administrator actions", color: "#cbd5e1" },
  { icon: "lock", title: "Security", note: "Admin protection", color: "#fca5a5" },
{ icon: "gift", title: "Scratch Verification", note: "Approve member scratch cards", color: "#f0abfc" },
];

const paths: Record<string, string> = {
  Members: "members",
  Deposits: "deposits",
  Withdrawals: "withdrawals",
  Activation: "activation",
  Transactions: "transactions",
  Announcements: "announcements",
  "Support Centre": "support",
  Reports: "reports",
    "Admin History": "history",
  Security: "security",
  "Scratch Verification": "scratch-verification",
};

function PanelIcon({ name, color }: { name: string; color: string }) {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const paths: Record<string, React.ReactNode> = {
    users: <>
      <path {...common} d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
      <circle {...common} cx="9" cy="7" r="4" />
      <path {...common} d="M22 20v-1.5a4 4 0 0 0-3-3.87M16 3.2a4 4 0 0 1 0 7.6" />
    </>,
    wallet: <>
      <rect {...common} x="3" y="5" width="18" height="15" rx="2.5" />
      <path {...common} d="M3 9h18M16 14h.01M6 5V4a1 1 0 0 1 1-1h11" />
    </>,
    bank: <>
      <path {...common} d="m3 9 9-6 9 6M4 10h16M5 20h14M7 10v9m5-9v9m5-9v9M3 22h18" />
    </>,
    shield: <>
      <path {...common} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path {...common} d="m9 12 2 2 4-4" />
    </>,
    receipt: <>
      <path {...common} d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6m-6 4h6m-6 4h3" />
    </>,
    megaphone: <>
      <path {...common} d="m3 11 14-6v14L3 13zM17 10h3a2 2 0 0 1 0 4h-3M6 14l2 7h4l-2-5" />
    </>,
    support: <>
      <path {...common} d="M4 13v-2a8 8 0 0 1 16 0v2M4 13H3v4h4v-4H4Zm16 0h1v4h-4v-4h3ZM17 20a5 5 0 0 1-5 2" />
    </>,
    chart: <>
      <path {...common} d="M3 3v18h18M7 14l4-4 3 3 6-7" />
      <path {...common} d="M16 6h4v4" />
    </>,
    history: <>
      <path {...common} d="M3 12a9 9 0 1 0 2.6-6.4L3 8" />
      <path {...common} d="M3 3v5h5m4-1v5l4 2" />
    </>,
        lock: <>
      <rect {...common} x="4" y="10" width="16" height="11" rx="2" />
      <path {...common} d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
    </>,
    gift: <>
      <rect {...common} x="3" y="10" width="18" height="11" rx="2" />
      <path {...common} d="M12 10v11M3 14h18M12 10H7a2.5 2.5 0 1 1 2.5-2.5L12 10Zm0 0h5a2.5 2.5 0 1 0-2.5-2.5L12 10Z" />
    </>,
  };

  return (
    <div style={{
      width: 48,
      height: 48,
      borderRadius: 15,
      display: "grid",
      placeItems: "center",
      background: "linear-gradient(145deg,rgba(255,255,255,.15),rgba(255,255,255,.025))",
      border: "1px solid rgba(255,255,255,.12)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.12),0 8px 20px rgba(0,0,0,.18)"
    }}>
      <svg width="27" height="27" viewBox="0 0 24 24">
        {paths[name] || paths.lock}
      </svg>
    </div>
  );
}

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

    if (!confirm(`${action} activation for ${member.email}? Verify payment first.`)) {
      return;
    }

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

  const pending = members.filter(m => m.status === "pending").length;
  const active = members.filter(m => m.status === "active").length;
  const rejected = members.filter(m => m.status === "rejected").length;

  const panel: React.CSSProperties = {
    background: "linear-gradient(145deg,#1d2d48,#17243a)",
    border: "1px solid #30445f",
    borderRadius: 18,
    padding: 15,
    boxShadow: "0 10px 25px rgba(0,0,0,.12)",
  };

  const button: React.CSSProperties = {
    border: "1px solid #52627b",
    background: "#293a55",
    color: "#f4f6fa",
    padding: "10px 12px",
    borderRadius: 10,
    fontWeight: 700,
  };

  if (loading) {
    return (
      <main style={{
        minHeight: "100vh",
        background: "#0b1425",
        color: "white",
        padding: 30
      }}>
        Checking administrator access...
      </main>
    );
  }

  if (error && members.length === 0) {
    return (
      <main style={{
        padding: 25,
        minHeight: "100vh",
        background: "#0b1425",
        color: "white"
      }}>
        <h2>BWK · DollarFetch Admin</h2>
        <p style={{ color: "#ffb4a9", overflowWrap: "anywhere" }}>{error}</p>
        <button onClick={loadMembers} style={button}>Try Again</button>
        <button onClick={logout} style={{ ...button, marginLeft: 10 }}>Log Out</button>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at top right,#1b3152 0,#0b1425 42%)",
      color: "#f7f8fb",
      padding: "18px 14px 32px",
      fontFamily: "Arial,sans-serif",
      maxWidth: 960,
      margin: "0 auto"
    }}>

      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 2px 18px"
      }}>
        <div>
          <div style={{ fontSize: 23, fontWeight: 900 }}>
            BWK <span style={{ color: "#7db8ff" }}>·</span> DollarFetch
          </div>
          <div style={{
            color: "#8ebeff",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 2,
            marginTop: 5
          }}>
            ADMIN CONTROL CENTRE
          </div>
        </div>

        <div style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          background: "#203957",
          border: "1px solid #3c5b7c"
        }}>
          <PanelIcon name="lock" color="#9bcaff" />
        </div>
      </header>

      <section style={{
        border: "1px solid rgba(245,190,80,.35)",
        background: "linear-gradient(110deg,rgba(245,190,80,.13),rgba(255,255,255,.025))",
        borderRadius: 17,
        padding: "17px 12px",
        textAlign: "center",
        marginBottom: 19
      }}>
        <div style={{
          color: "#f7c96c",
          fontSize: 23,
          fontWeight: 900,
          fontStyle: "italic",
          letterSpacing: .5,
          textShadow: "0 2px 14px rgba(247,201,108,.2)"
        }}>
          Niaje bossie
        </div>

        <div style={{
          color: "#aebed3",
          fontSize: 10,
          letterSpacing: 1.8,
          fontWeight: 800,
          marginTop: 7
        }}>
          BWK ADMIN CONTROL CENTRE
        </div>
      </section>

      <div style={{
        borderTop: "1px solid #30415b",
        paddingTop: 17,
        marginBottom: 16
      }}>
        <h1 style={{ fontSize: 25, margin: "0 0 5px" }}>
          Admin Dashboard
        </h1>

        <p style={{
          color: "#aab8cc",
          fontSize: 12,
          margin: 0,
          overflowWrap: "anywhere"
        }}>
          Welcome, Administrator · {email}
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2,minmax(0,1fr))",
        gap: 10
      }}>
        {[
          { label: "Activation requests", value: members.length, color: "#60a5fa", icon: "users" },
          { label: "Pending requests", value: pending, color: "#fbbf24", icon: "history" },
          { label: "Activated", value: active, color: "#34d399", icon: "shield" },
          { label: "Rejected", value: rejected, color: "#fb7185", icon: "lock" },
        ].map(item => (
          <div key={item.label} style={panel}>
            <PanelIcon name={item.icon} color={item.color} />
            <div style={{ fontSize: 27, fontWeight: 900, marginTop: 10 }}>
              {item.value}
            </div>
            <div style={{ color: "#b9c5d5", fontSize: 11, marginTop: 4 }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <section style={{
        ...panel,
        marginTop: 13,
        background: "linear-gradient(135deg,#203653,#192943)"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap"
        }}>
          <strong>Financial overview</strong>

          <span style={{
            color: "#f2c66d",
            fontSize: 9,
            border: "1px solid #8d7846",
            borderRadius: 20,
            padding: "5px 8px"
          }}>
            AWAITING VERIFIED DATA
          </span>
        </div>

        <div style={{
          fontSize: 13,
          color: "#c7d2e1",
          marginTop: 11,
          lineHeight: 1.6
        }}>
          Financial totals will appear here when verified deposit and withdrawal records are connected.
        </div>
      </section>

      <section style={{ marginTop: 23 }}>
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, letterSpacing: 1, margin: 0 }}>
            MANAGEMENT CENTRE
          </h2>

          <p style={{ color: "#8fa2bc", fontSize: 11, margin: "5px 0 0" }}>
            All administration tools in one place
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,minmax(0,1fr))",
          gap: 10
        }}>
          {sections.map(item => (
            <a
              key={item.title}
              href={`/admin/${paths[item.title]}`}
              style={{
                ...panel,
                padding: 13,
                display: "block",
                color: "inherit",
                textDecoration: "none",
                cursor: "pointer"
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10
              }}>
                <PanelIcon name={item.icon} color={item.color} />

                <div>
                  <div style={{ fontWeight: 800, fontSize: 12 }}>
                    {item.title}
                  </div>

                  <div style={{
                    color: "#aab8cc",
                    fontSize: 10,
                    marginTop: 4,
                    lineHeight: 1.4
                  }}>
                    {item.note}
                  </div>
                </div>
              </div>

              <div style={{
                color: "#8ebeff",
                fontSize: 9,
                marginTop: 12,
                letterSpacing: .8,
                fontWeight: 800
              }}>
                OPEN MODULE →
              </div>
            </a>
          ))}
        </div>
      </section>

      <section style={{ ...panel, marginTop: 20 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap"
        }}>
          <h2 style={{ fontSize: 16, margin: 0 }}>
            Member Activation Requests
          </h2>

          <button onClick={loadMembers} style={button}>
            ↻ Refresh
          </button>
        </div>

        <p style={{
          color: "#91a5bf",
          fontSize: 11,
          lineHeight: 1.5
        }}>
          Check the member's payment before approving an activation request.
        </p>

        {error && <p style={{ color: "#ffb4a9" }}>{error}</p>}

        {members.length === 0 ? (
          <p style={{ color: "#aab8cc", fontSize: 13 }}>
            No activation requests found.
          </p>
        ) : (
          members.map(member => (
            <article key={member.user_id} style={{
              border: "1px solid #40516b",
              borderRadius: 13,
              padding: 13,
              marginTop: 12,
              overflowWrap: "anywhere",
              background: "rgba(7,16,30,.25)"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                flexWrap: "wrap"
              }}>
                <strong>{member.full_name || "Member"}</strong>

                <span style={{
                  color: member.status === "active"
                    ? "#72d6a0"
                    : member.status === "pending"
                    ? "#e7c46e"
                    : "#ff9b91",
                  fontSize: 10,
                  fontWeight: 900
                }}>
                  {member.status.toUpperCase()}
                </span>
              </div>

              <p style={{
                color: "#c2cede",
                fontSize: 11,
                lineHeight: 1.7
              }}>
                Email: {member.email || "—"}<br />
                Phone: {member.phone || "—"}<br />
                Member ID: {member.user_id}<br />
                Fee: {member.currency} {member.amount}<br />
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
                      ...button,
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
                      ...button,
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
        background: "linear-gradient(100deg,#f2c66d,#d9a943)",
        color: "#101b30",
        border: 0,
        borderRadius: 12,
        fontWeight: 900
      }}>
        Log Out
      </button>

      <p style={{
        color: "#71839b",
        textAlign: "center",
        fontSize: 10,
        marginTop: 15,
        letterSpacing: 1
      }}>
        BWK ADMIN · SECURE MANAGEMENT
      </p>
    </main>
  );
          }
