
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const sections: Record<string, { title: string; description: string }> = {
  members: {
    title: "Members",
    description: "View and manage registered members."
  },
  deposits: {
    title: "Deposits",
    description: "Review member deposit records."
  },
  withdrawals: {
    title: "Withdrawals",
    description: "Review and authorize withdrawal requests."
  },
  activation: {
    title: "Activation",
    description: "Manage pending member activation requests."
  },
  transactions: {
    title: "Transactions",
    description: "View transaction records."
  },
  announcements: {
    title: "Announcements",
    description: "Prepare announcements for members."
  },
  support: {
    title: "Support Centre",
    description: "Manage member support requests."
  },
  reports: {
    title: "Reports",
    description: "View financial and membership reports."
  },
  history: {
    title: "Admin History",
    description: "Review administrator activity."
  },
  security: {
    title: "Security",
    description: "Administrator security controls."
  }
};

export default function AdminSectionPage() {
  const params = useParams();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const section = String(params.section || "");
  const item = sections[section];

  useEffect(() => {
    async function checkAccess() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/app/login");
        return;
      }

      setChecking(false);
    }

    checkAccess();
  }, [router]);

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

      <h1 style={{ marginTop: 35, color: "#8ebeff" }}>
        BWK · {item.title}
      </h1>

      <p style={{ color: "#b9c5d5", lineHeight: 1.7 }}>
        {item.description}
      </p>

      <div style={{
        marginTop: 25,
        padding: 20,
        borderRadius: 16,
        background: "#1d2d48",
        border: "1px solid #30445f"
      }}>
        <h3>Management Module</h3>
        <p style={{ color: "#b9c5d5", lineHeight: 1.7 }}>
          This section is ready for its management features.
          Database operations will be connected separately.
        </p>
      </div>
    </main>
  );
}
