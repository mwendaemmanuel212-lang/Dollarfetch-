import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!openaiKey || !supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Assistant configuration is incomplete." },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!token) {
      return NextResponse.json(
        { error: "Please log in again." },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Your session is invalid. Please log in again." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const incoming = body.messages;

    if (!Array.isArray(incoming) || incoming.length === 0) {
      return NextResponse.json(
        { error: "Please send a message." },
        { status: 400 }
      );
    }

    const messages = incoming
      .slice(-20)
      .filter(
        (item: any) =>
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string"
      )
      .map((item: any) => ({
        role: item.role,
        content: item.content.slice(0, 2000),
      }));

    if (
      messages.length === 0 ||
      messages[messages.length - 1].role !== "user"
    ) {
      return NextResponse.json(
        { error: "Invalid chat message." },
        { status: 400 }
      );
    }

    // Read only this logged-in member's activation status.
    const { data: activation, error: activationError } = await supabase
      .from("activation_requests")
      .select("status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const activationStatus = activationError
      ? "unavailable"
      : activation?.status || "not_submitted";

    const systemPrompt = `
You are DollarFetch AI Activation Assistant.

Help DollarFetch members with account activation in a friendly,
clear and professional way.

IMPORTANT BUSINESS INFORMATION:
- The one-time activation fee is exactly $0.76 USD.
- The M-PESA STK payment system already charges the correct amount.
- Never tell members to pay a different amount.
- Never change payment instructions or invent payment details.

MEMBER ACTIVATION STATUS:
${activationStatus}

ACTIVATION SUPPORT RULES:
1. Explain activation steps patiently and one step at a time.
2. If the member says they paid but cannot activate, ask whether
   they received an M-PESA confirmation SMS.
3. If they received it, ask them to type the M-PESA transaction
   code exactly as shown in the confirmation SMS.
4. Never ask for their M-PESA PIN, OTP, password or account credentials.
5. If they provide a transaction code, acknowledge receiving it.
   Explain that support/admin must verify the payment manually.
6. Never claim that a transaction code has been verified.
7. Never approve payments, activate accounts, credit balances,
   reject requests or modify member records.
8. If status is pending, explain that admin verification is required.
9. If status is active, congratulate the member.
10. If the status is unavailable, do not guess. Explain that the
    status could not be checked and direct them to support.
11. Keep replies short, clear and focused on activation.
12. Do not invent payment receipts, transaction results or timelines.

You are a support assistant only. You cannot perform account actions.
`;

    const aiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          max_tokens: 350,
          temperature: 0.4,
        }),
      }
    );

    if (!aiResponse.ok) {
      return NextResponse.json(
        { error: "The assistant is temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }

    const result = await aiResponse.json();
    const reply = result.choices?.[0]?.message?.content;

    return NextResponse.json({
      reply: reply || "Sorry, I couldn't generate a response. Please try again.",
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
