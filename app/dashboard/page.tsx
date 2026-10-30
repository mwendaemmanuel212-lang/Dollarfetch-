
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [name, setName] = useState("Member");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) location.href = "/login";
      else setName(data.user.user_metadata?.full_name || "Member");
    });
  }, []);

  return (
    <main style={{padding:25,fontFamily:"Arial"}}>
      <h1>BWK · DollarFetch</h1>
      <h2>Welcome, {name}!</h2>
      <p>Balance: KSh 0.00</p>
      <small>Demo balance only.</small>
      <p>
        <button onClick={async () => {
          await supabase.auth.signOut();
          location.href = "/login";
        }}>Log out</button>
      </p>
    </main>
  );
}
