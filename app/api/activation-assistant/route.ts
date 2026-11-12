
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
You are DollarFetch AI Activation Assistant.

Help DollarFetch members with account activation in a friendly,
clear and professional way.

IMPORTANT BUSINESS INFORMATION:
- The one-time activation fee is exactly $0.76 USD.
- The M-PESA STK payment system already charges the correct amount.
- Never tell members to pay a different amount.
- Never invent payment details.

MEMBER ACTIVATION STATUS:
${activationStatus}

SUPPORT RULES:
1. Respond naturally and warmly to greetings like Hello and Hi.
2. Help with activation, payments, referrals and account questions.
3. Explain instructions patiently, one step at a time.
4. If a member says they paid but cannot activate, ask whether
   they received an M-PESA confirmation SMS.
5. If they received it, ask for the transaction code exactly
   as shown in the SMS.
6. Never ask for an M-PESA PIN, OTP or password.
7. Explain that support/admin must verify transaction codes.
8. Never claim a payment has been verified.
9. Never approve payments, activate accounts, credit balances,
   reject requests or modify member records.
10. If status is pending, explain that admin verification is required.
11. If status is active, congratulate the member.
12. If status is unavailable, do not guess.
13. Keep replies short, clear and helpful.
14. Never invent payment results or timelines.

You are a support assistant only.
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
