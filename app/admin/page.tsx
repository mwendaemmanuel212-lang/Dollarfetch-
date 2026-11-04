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

    const user = sessionData.session.user;
    setEmail(user.email || "");

    const { data, error: rpcError } = await supabase.rpc(
      "admin_list_activation_requests"
    );

    if (rpcError) {
      setError(
        "Administrator access check failed: " + rpcError.message +
        " | Signed-in ID: " + user.id
      );
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

    if (!confirm(
      `${action} activation for ${member.email}? Verify payment first.`
    )) return;

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
      alert("Request updated. Refreshing records.");
      await loadMembers();
    }

    setWorking("");
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/app/login";
  }

  if (loading) {
    return <main style={{ padding: 30 }}>Checking administrator access...</main>;
  }

  if (error && members.length === 0) {
    return (
      <main style={{
        padding: 25,
        minHeight: "100vh",
        background: "#eff4fb",
        fontFamily: "Arial"
      }}>
        <h2>BWK · DollarFetch Admin</h2>
        <p style={{ color: "red", overflowWrap: "anywhere" }}>{error}</p>
        <button onClick={loadMembers}>Try Again</button>
        <button onClick={logout} style={{ marginLeft: 10 }}>Log Out</button>
      </main>
    );
  }

  const pending = members.filter(m => m.status === "pending").length;
  const active = members.filter(m => m.status === "active").length;
  const rejected = members.filter(m => m.status === "rejected").length;

  const card: React.CSSProperties = {
    background: "white",
    padding: 18,
    borderRadius: 14,
    marginTop: 15,
    boxShadow: "0 3px 12px #0000000b"
  };

  return (
    <main style={{
      minHeight: "100vh",
      padding: 18,
      background: "#eff4fb",
      color: "#12315b",
      fontFamily: "Arial, sans-serif"
    }}>
      <header style={{
        background: "#073b83",
        color: "white",
        padding: 22,
        borderRadius: 15
      }}>
        <h1>BWK · DollarFetch</h1>
        <h2>Administrator Panel</h2>
        <p>{email}</p>
      </header>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2,1fr)",
        gap: 12,
        marginTop: 18
      }}>
        <div style={card}>
          <b>Total Requests</b>
          <h2>{members.length}</h2>
        </div>
        <div style={card}>
          <b>Pending</b>
          <h2>{pending}</h2>
        </div>
        <div style={card}>
          <b>Activated</b>
          <h2>{active}</h2>
        </div>
        <div style={card}>
          <b>Rejected</b>
          <h2>{rejected}</h2>
        </div>
      </div>

      <section style={card}>
        <h2>Member Activation Requests</h2>
        <button onClick={loadMembers}>Refresh</button>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {members.length === 0 ? (
          <p>No activation requests found.</p>
        ) : (
          members.map(member => (
            <article key={member.user_id} style={{
              border: "1px solid #dce5f1",
              borderRadius: 12,
              padding: 14,
              marginTop: 15,
              overflowWrap: "anywhere"
            }}>
              <h3>{member.full_name || "Member"}</h3>
              <p><b>Email:</b> {member.email}</p>
              <p><b>Phone:</b> {member.phone}</p>
              <p><b>Member ID:</b> {member.user_id}</p>
              <p><b>Fee:</b> {member.currency} {member.amount}</p>
              <p><b>Date:</b> {new Date(member.created_at).toLocaleString()}</p>
              <p><b>Status:</b> {member.status.toUpperCase()}</p>

              {member.status === "pending" && (
                <div style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap"
                }}>
                  <button
                    disabled={working === member.user_id}
                    onClick={() => updateStatus(member, "active")}
                    style={{
                      padding: 12,
                      background: "#168447",
                      color: "white",
                      border: 0,
                      borderRadius: 8
                    }}
                  >
                    Approve & Activate
                  </button>

                  <button
                    disabled={working === member.user_id}
                    onClick={() => updateStatus(member, "rejected")}
                    style={{
                      padding: 12,
                      background: "#b42318",
                      color: "white",
                      border: 0,
                      borderRadius: 8
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

      <button
        onClick={logout}
        style={{
          width: "100%",
          padding: 15,
          marginTop: 20,
          background: "#12315b",
          color: "white",
          border: 0,
          borderRadius: 10
        }}
      >
        Log Out
      </button>
    </main>
  );
}
