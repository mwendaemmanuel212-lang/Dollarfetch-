
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Survey = {
  id: string;
  title: string;
  description: string | null;
  partner_name: string | null;
  survey_url: string;
  reward_amount: number | string;
  estimated_minutes: number | null;
  country: string;
};

type Submission = {
  survey_id: string;
  status: string;
};

export default function PaidSurveys() {
  const [offers, setOffers] = useState<Survey[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [started, setStarted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [surveys, history] = await Promise.all([
        supabase.from("survey_offers")
          .select("id,title,description,partner_name,survey_url,reward_amount,estimated_minutes,country")
          .eq("status", "active")
          .or("country.eq.All,country.eq.Kenya")
          .order("created_at", { ascending: false }),

        supabase.from("survey_submissions")
          .select("survey_id,status")
      ]);

      if (!mounted) return;

      if (surveys.error || history.error) {
        setError(surveys.error?.message || history.error?.message || "Could not load surveys.");
      } else {
        setOffers(surveys.data || []);
        setSubmissions(history.data || []);
      }

      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  function startSurvey(survey: Survey) {
    window.open(
      survey.survey_url,
      "_blank",
      "noopener,noreferrer"
    );

    setStarted(old =>
      old.includes(survey.id) ? old : [...old, survey.id]
    );

    setMessage("Complete the survey in the new tab, then return here.");
  }

  async function submitSurvey(survey: Survey) {
    setError("");
    setMessage("");

    if (!started.includes(survey.id)) {
      setError("Please open the survey first.");
      return;
    }

    setBusy(survey.id);

    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) {
      setError("Please log in again.");
      setBusy("");
      return;
    }

    const { data, error } = await supabase
      .from("survey_submissions")
      .insert({
        survey_id: survey.id,
        user_id: auth.user.id
      })
      .select("survey_id,status")
      .single();

    if (error) {
      setError(
        error.code === "23505"
          ? "You have already submitted this survey."
          : error.message
      );
    } else if (data) {
      setSubmissions(old => [...old, data]);
      setMessage("Survey submitted successfully. Awaiting verification.");
    }

    setBusy("");
  }

  return (
    <section className="section">
      <div className="pagehead">
        <h1>Paid Surveys</h1>
        <span>📋 EARNING HUB</span>
      </div>

      <p className="muted">
        Complete available partner surveys and earn
        rewards after successful verification.
      </p>

      {message && <div className="message">{message}</div>}
      {error && <div className="notice">{error}</div>}

      {loading ? (
        <div className="notice">Loading surveys...</div>
      ) : offers.length === 0 ? (
        <div style={{
          padding: 25,
          borderRadius: 16,
          background: "#f3e8ff",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 38 }}>📋</div>
          <h2>No surveys available</h2>
          <p className="muted">
            New survey opportunities will appear here
            when published.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {offers.map(survey => {
            const submission = submissions.find(
              item => item.survey_id === survey.id
            );

            return (
              <div key={survey.id} style={{
                background: "#fff",
                border: "1px solid #e6d8f7",
                borderRadius: 16,
                padding: 16
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10
                }}>
                  <div>
                    <h3 style={{
                      margin: 0,
                      color: "#32105d"
                    }}>
                      {survey.title}
                    </h3>
                    {survey.partner_name && (
                      <small>Partner: {survey.partner_name}</small>
                    )}
                  </div>

                  <strong style={{
                    color: "#6416c5",
                    fontSize: 18
                  }}>
                    ${Number(survey.reward_amount).toFixed(2)}
                  </strong>
                </div>

                {survey.description && (
                  <p className="muted" style={{ marginTop: 12 }}>
                    {survey.description}
                  </p>
                )}

                <div style={{
                  display: "flex",
                  gap: 12,
                  fontSize: 11,
                  margin: "12px 0"
                }}>
                  <span>⏱ {survey.estimated_minutes || 5} min</span>
                  <span>🌍 {survey.country || "All"}</span>
                </div>

                {submission ? (
                  <div className="notice">
                    Status: {submission.status.toUpperCase()}.
                    Reward awaits verification.
                  </div>
                ) : (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 9
                  }}>
                    <button
                      className="copy-action"
                      onClick={() => startSurvey(survey)}
                    >
                      Start Survey ↗
                    </button>

                    <button
                      className="primary"
                      disabled={
                        busy === survey.id ||
                        !started.includes(survey.id)
                      }
                      onClick={() => submitSurvey(survey)}
                    >
                      {busy === survey.id
                        ? "Submitting..."
                        : "I Completed It"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p style={{
        fontSize: 10,
        color: "#87769a",
        marginTop: 16
      }}>
        Submit only genuinely completed surveys.
        All rewards require verification before wallet credit.
      </p>
    </section>
  );
        }
