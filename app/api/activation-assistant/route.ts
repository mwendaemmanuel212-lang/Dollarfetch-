
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!groqKey || !supabaseUrl || !supabaseKey) {
      return Response.json(
        { error: "AI configuration is incomplete. Check Cloudflare secrets." },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization") || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!token) {
      return Response.json(
        { error: "Please log in again." },
        { status: 401 }
      );
    }

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!userResponse.ok) {
      return Response.json(
        { error: "Your session is invalid. Please log in again." },
        { status: 401 }
      );
    }

    const user = await userResponse.json() as { id?: string };

    if (!user.id) {
      return Response.json(
        { error: "Your session is invalid. Please log in again." },
        { status: 401 }
      );
    }

    const body = await request.json() as {
      messages?: ChatMessage[];
    };

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json(
        { error: "Please send a message." },
        { status: 400 }
      );
    }

    const messages = body.messages
      .slice(-20)
      .filter(
        (item): item is ChatMessage =>
          !!item &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string"
      )
      .map(item => ({
        role: item.role,
        content: item.content.slice(0, 2000),
      }));

    if (
      messages.length === 0 ||
      messages[messages.length - 1].role !== "user"
    ) {
      return Response.json(
        { error: "Invalid chat message." },
        { status: 400 }
      );
    }

    let activationStatus = "unavailable";

    try {
      const activationUrl = new URL(
        `${supabaseUrl}/rest/v1/activation_requests`
      );

      activationUrl.searchParams.set("select", "status");
      activationUrl.searchParams.set("user_id", `eq.${user.id}`);
      activationUrl.searchParams.set("order", "created_at.desc");
      activationUrl.searchParams.set("limit", "1");

      const activationResponse = await fetch(activationUrl.toString(), {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`,
        },
      });

      if (activationResponse.ok) {
        const rows = await activationResponse.json() as Array<{
          status?: string;
        }>;

        activationStatus = rows[0]?.status || "not_submitted";
      }
    } catch (error) {
      console.error("Activation status lookup failed:", error);
      activationStatus = "unavailable";
    }

    const systemPrompt = `
You are DollarFetch AI, the friendly in-app support assistant for DollarFetch.

ABOUT DOLLARFETCH:
- DollarFetch is an online earning platform.
- DollarFetch is NOT a savings plan, bank account, investment, or deposit scheme.
- Members can use platform earning features including spin rolls, referral rewards, and scratch cards.
- Explain these features simply when asked.
- Do not invent game rules, winning odds, reward amounts, withdrawal conditions, or guarantees.
- Never promise guaranteed earnings, profits, or a specific income.

ACTIVATION AND PAYMENT INFORMATION:
- The one-time activation fee is exactly $0.76 USD.
- The M-PESA STK payment system already charges the correct amount.
- Never tell members to pay a different amount.
- Never invent payment details or claim a payment has been verified without verified information.

MEMBER ACTIVATION STATUS:
${activationStatus}

SUPPORT RULES:
1. Respond naturally and warmly to greetings.
2. Help with activation, M-PESA payments, spin rolls, referrals, scratch cards, and general account questions.
3. Explain instructions patiently, one step at a time.
4. If a member says they paid but cannot activate, ask whether they received an M-PESA confirmation SMS.
5. If they received it, ask them to share only the M-PESA transaction confirmation code.
6. Never ask for an M-PESA PIN, OTP, password, or login security code.
7. If a member shares a transaction code, acknowledge it. Do not claim you have checked or verified it.
8. Never say "admin will activate your account".
9. Never promise that an administrator or anyone else will activate the account or give an activation timeline.
10. Never approve payments, activate accounts, credit balances, reject requests, or modify member records.
11. If activation status is pending, say only that the recorded status is still pending. Do not invent the reason.
12. If activation status is active, congratulate the member.
13. If status is unavailable or not submitted, do not guess.
14. Keep replies short, friendly, clear, and helpful.
15. Never invent payment results, feature rules, reward amounts, or timelines.

You are a support and information assistant only.
`;

    const aiResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          max_completion_tokens: 700,
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();

      let errorMessage = errorText;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage =
          errorData?.error?.message ||
          errorData?.message ||
          errorText;
      } catch {
        // Keep original error text.
      }

      console.error(
        "DollarFetch Groq error:",
        aiResponse.status,
        errorMessage
      );

      return Response.json(
        {
          error: `Groq AI error (${aiResponse.status}): ${errorMessage.slice(0, 300)}`,
        },
        { status: 502 }
      );
    }

    const result = await aiResponse.json() as {
      choices?: Array<{
        message?: { content?: string };
      }>;
    };

    const reply = result.choices?.[0]?.message?.content;

    if (!reply) {
      return Response.json(
        { error: "The AI returned an empty response. Please try again." },
        { status: 502 }
      );
    }

    return Response.json({ reply });

  } catch (error) {
    console.error("DollarFetch assistant error:", error);

    return Response.json(
      { error: "Something went wrong while processing your message." },
      { status: 500 }
    );
  }
}
