
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
  const [working, setWorking] = useState("");
  const [error, setError] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  async function loadMembers() {
    setLoading(true);
    setError("");

    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) {
      window.location.href = "/app/login";
      return;
    }

    setAdminEmail(auth.user.email || "");

    const { data: isAdmin, error: adminError } =
      await supabase.rpc("is_admin");

    if (adminError || isAdmin !== true) {
      setError("Access denied. Administrator permission required.");
      setLoading(false);
      return;
    }

    const { data, error: listError } = await supabase.rpc(
      "admin_list_activation_requests"
    );

    if (listError) {
      setError(listError.message);
      setLoading(false);
      return;
    }

    setMembers((data || []) as Member[]);
    setLoading(false);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  async function updateStatus(member: Member, nextStatus: string) {
    if (member.status !== "pending") {
      alert("This request is no longer pending.");
      return;
    }

    const action =
      nextStatus === "active" ? "APPROVE" : "REJECT";

    const confirmed = window.confirm(
      `${action} activation for ${member.email}?\n\nOnly continue after independently verifying the payment.`
    );

    if (!confirmed) return;

    setWorking(member.user_id);
    setError("");

    const { data: isAdmin } = await supabase.rpc("is_admin");

    if (isAdmin !== true) {
      setError("Administrator permission could not be verified.");
      setWorking("");
      return;
    }

    const { data, error: updateError } = await supabase
      .from("activation_requests")
      .update({ status: nextStatus })
      .eq("user_id", member.user_id)
      .eq("status", "pending")
      .select("user_id");

    if (updateError) {
      setError(updateError.message);
    } else if (!data || data.length === 0) {
      setError("No pending request was updated. Refresh and check its status.");
    } else {
      alert(
        nextStatus === "active"
          ? "Member activated successfully."
          : "Activation request rejected."
      );
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

  const card = {
    background: "white",
    padding: 18,
    borderRadius: 14,
    boxShadow: "0 3px 12px #0000000b"
  } as const;

  if (loading) {
    return <main style={{ padding: 30 }}>Checking administrator access...</main>;
  }

  if (error && members.length === 0) {
    return (
      <main style={{
        minHeight: "100vh",
        padding: 25,
        background: "#eff4fb",
        fontFamily: "Arial"
      }}>
        <h2>BWK · DollarFetch Admin</h2>
        <p style={{ color: "#b42318" }}>{error}</p>
        <button onClick={loadMembers}>Try Again</button>
        <button onClick={logout} style={{ marginLeft: 10 }}>Log Out</button>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: "100vh",
      padding: 18,
      paddingBottom: 50,
      background: "#eff4fb",
      color: "#12315b",
      fontFamily: "Arial, sans-serif"
    }}>
      <header style={{
        background: "linear-gradient(120deg,#073b83,#1264bd)",
        color: "white",
        padding: 22,
        borderRadius: 16,
        marginBottom: 20
      }}>
        <h1 style={{ margin: 0 }}>BWK · DollarFetch</h1>
        <h2>Administrator Panel</h2>
        <p>{adminEmail}</p>
        <p style={{ fontSize: 13 }}>
          Private administration area
        </p>
      </header>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
        gap: 12
      }}>
        <div style={card}>
          <small>Total Requests</small>
          <h2>{members.length}</h2>
        </div>
        <div style={card}>
          <small>Pending</small>
          <h2 style={{ color: "#c17b00" }}>{pending}</h2>
        </div>
        <div style={card}>
          <small>Activated</small>
          <h2 style={{ color: "#168447" }}>{active}</h2>
        </div>
        <div style={card}>
          <small>Rejected</small>
          <h2 style={{ color: "#b42318" }}>{rejected}</h2>
        </div>
      </div>

      <section style={{
        ...card,
        marginTop: 20,
        background: "#fff8e8",
        border: "1px solid #edcf91"
      }}>
        <strong>Payment verification required</strong>
        <p style={{ lineHeight: 1.5, fontSize: 14 }}>
          Verify each payment independently before approving.
          Saving a payment choice is not proof of payment.
          Approval activates the member's account.
        </p>
      </section>

      <section style={{ ...card, marginTop: 20 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap"
        }}>
          <h2>Member Activation Requests</h2>
          <button
            onClick={loadMembers}
            style={{
              padding: 11,
              border: 0,
              borderRadius: 8,
              background: "#073b83",
              color: "white"
            }}
          >
            Refresh
          </button>
        </div>

        {error && (
          <p style={{ color: "#b42318" }}>{error}</p>
        )}

        {members.length === 0 ? (
          <p>No activation requests found.</p>
        ) : (
          members.map(member => (
            <article key={member.user_id} style={{
              border: "1px solid #dce5f1",
              borderRadius: 12,
              padding: 15,
              marginTop: 14,
              overflowWrap: "anywhere"
            }}>
              <h3 style={{ marginTop: 0 }}>
                {member.full_name || "Member"}
              </h3>

              <p><b>Email:</b> {member.email || "Not available"}</p>
              <p><b>Phone:</b> {member.phone || "Not provided"}</p>
              <p><b>Member ID:</b> {member.user_id}</p>
              <p><b>Activation fee:</b> {member.currency} {member.amount}</p>
              <p><b>Submitted:</b> {new Date(member.created_at).toLocaleString()}</p>

              <p>
                <b>Status:</b>{" "}
                <strong style={{
                  color: member.status === "active"
                    ? "#168447"
                    : member.status === "pending"
                    ? "#c17b00"
                    : "#b42318"
                }}>
                  {member.status.toUpperCase()}
                </strong>
              </p>

              {member.status === "pending" && (
                <div style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 14
                }}>
                  <button
                    disabled={working === member.user_id}
                    onClick={() => updateStatus(member, "active")}
                    style={{
                      padding: 12,
                      background: "#168447",
                      color: "white",
                      border: 0,
                      borderRadius: 8,
                      fontWeight: "bold"
                    }}
                  >
                    {working === member.user_id ? "Please wait..." : "Approve & Activate"}
                  </button>

                  <button
                    disabled={working === member.user_id}
                    onClick={() => updateStatus(member, "rejected")}
                    style={{
                      padding: 12,
                      background: "#b42318",
                      color: "white",
                      border: 0,
                      borderRadius: 8,
                      fontWeight: "bold"
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
          marginTop: 20,
          padding: 15,
          background: "#12315b",
          color: "white",
          border: 0,
          borderRadius: 10,
          fontWeight: "bold"
        }}
      >
        Log Out
      </button>
    </main>
  );
        }
