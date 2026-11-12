
export const runtime = "edge";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!openaiKey || !supabaseUrl || !supabaseKey) {
      return Response.json(
        { error: "Assistant configuration is incomplete." },
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
    } catch {
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

ACTIVATION SUPPORT RULES:
1. Explain activation steps patiently and one step at a time.
2. If a member says they paid but cannot activate, ask whether
   they received an M-PESA confirmation SMS.
3. If they received it, ask them to type the M-PESA transaction
   code exactly as shown in the SMS.
4. Never ask for their M-PESA PIN, OTP or password.
5. If they provide a transaction code, explain that support/admin
   must verify the payment manually.
6. Never claim a transaction code has been verified.
7. Never approve payments, activate accounts, credit balances,
   reject requests or modify member records.
8. If status is pending, explain that admin verification is required.
9. If status is active, congratulate the member.
10. If status is unavailable, do not guess.
11. Keep replies short, clear and focused on activation.
12. Never invent payment results or timelines.

You are a support assistant only.
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
      return Response.json(
        { error: "The assistant is temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }

    const result = await aiResponse.json() as {
      choices?: Array<{
        message?: { content?: string };
      }>;
    };

    return Response.json({
      reply:
        result.choices?.[0]?.message?.content ||
        "Sorry, I couldn't generate a response. Please try again.",
    });

  } catch {
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
