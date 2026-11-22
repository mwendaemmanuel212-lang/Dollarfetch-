import { createClient } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization") || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!token) {
      return Response.json({ error: "Please sign in." }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const publicKey = process.env.OFFERWALL_PUBLIC_API_KEY;
    const secret = process.env.OFFERWALL_PRIVATE_SECRET;

    if (!url || !anonKey || !serviceKey || !publicKey || !secret) {
      return Response.json(
        { error: "Offerwall configuration is incomplete." },
        { status: 503 }
      );
    }

    const auth = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await auth.auth.getUser(token);

    if (error || !data.user) {
      return Response.json({ error: "Please sign in again." }, { status: 401 });
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: activations, error: activationError } = await admin
      .from("activation_requests")
      .select("status")
      .eq("user_id", data.user.id);

    if (activationError) {
      return Response.json(
        { error: "Could not verify account activation." },
        { status: 500 }
      );
    }

    const isActive = (activations || []).some((item) =>
      ["active", "approved"].includes(
        String(item.status || "").toLowerCase()
      )
    );

    if (!isActive) {
      return Response.json(
        { error: "Activate your DollarFetch account before earning." },
        { status: 403 }
      );
    }

    const expires = String(Math.floor(Date.now() / 1000) + 3600);
    const message =
      `offerwall-user-v1\n${publicKey}\n${data.user.id}\n${expires}`;

    const signature = createHmac("sha256", secret)
      .update(message, "utf8")
      .digest("hex");

    const signedUrl =
      `https://offerwall.me/offerwall/${encodeURIComponent(publicKey)}/${encodeURIComponent(data.user.id)}` +
      `?identityExpires=${expires}&identitySignature=${signature}`;

    return Response.json({ url: signedUrl });
  } catch {
    return Response.json(
      { error: "Unable to open earning tasks. Please try again." },
      { status: 500 }
    );
  }
}
