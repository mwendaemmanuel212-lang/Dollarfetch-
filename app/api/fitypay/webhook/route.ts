
function challengeResponse(challenge: string | null) {
  if (!challenge) {
    return new Response("Missing challenge", { status: 400 });
  }

  return new Response(challenge, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const challenge = url.searchParams.get("fitypay_challenge");

  return challengeResponse(challenge);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const challenge =
      body.fitypay_challenge ?? body.challenge ?? null;

    return challengeResponse(
      typeof challenge === "string" ? challenge : null
    );
  } catch {
    return new Response("Invalid request", { status: 400 });
  }
}
