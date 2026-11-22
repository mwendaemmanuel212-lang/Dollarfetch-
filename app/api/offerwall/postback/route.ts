
import { createHash, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function readSignature(value: string) {
  return /^[a-f0-9]{32}$/i.test(value);
}

function safeCompare(a: string, b: string) {
  if (!readSignature(a) || !readSignature(b)) return false;

  return timingSafeEqual(
    Buffer.from(a.toLowerCase(), "hex"),
    Buffer.from(b.toLowerCase(), "hex")
  );
}

async function getParams(request: Request) {
  if (request.method === "GET") {
    return new URL(request.url).searchParams;
  }

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    return new URLSearchParams(
      Object.entries(body).map(([key, value]) => [
        key,
        String(value),
      ])
    );
  }

  const form = await request.formData();
  const params = new URLSearchParams();

  form.forEach((value, key) => {
    if (typeof value === "string") params.set(key, value);
  });

  return params;
}

async function handlePostback(request: Request) {
  try {
    const secret = process.env.OFFERWALL_PRIVATE_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!secret || !supabaseUrl || !serviceKey) {
      return new Response("Server configuration error", {
        status: 500,
      });
    }

    const params = await getParams(request);

    const userId = params.get("subId") || "";
    const transId = params.get("transId") || "";
    const rewardText = params.get("reward") || "";
    const statusText = params.get("status") || "";
    const signature = params.get("signature") || "";
    const offerName = params.get("offer_name") || "";
    const offerType = params.get("offer_type") || "";
    const payoutText = params.get("payout") || "0";

    if (
      !userId ||
      !transId ||
      !rewardText ||
      !signature ||
      !["1", "2"].includes(statusText) ||
      !/^[0-9a-f-]{36}$/i.test(userId) ||
      transId.length > 200
    ) {
      return new Response("Invalid parameters", {
        status: 400,
      });
    }

    const reward = Number(rewardText);
    const payout = Number(payoutText);

    if (
      !Number.isFinite(reward) ||
      reward <= 0 ||
      !Number.isFinite(payout) ||
      payout < 0
    ) {
      return new Response("Invalid reward", { status: 400 });
    }

    // Offerwall.me postback signature:
    // MD5(subId + transId + reward + private secret)
    const expected = createHash("md5")
      .update(userId + transId + rewardText + secret, "utf8")
      .digest("hex");

    if (!safeCompare(signature, expected)) {
      return new Response("Invalid signature", {
        status: 403,
      });
    }

    const supabase = createClient(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { error } = await supabase.rpc(
      "process_offerwall_postback",
      {
        p_user_id: userId,
        p_trans_id: transId,
        p_reward: reward,
        p_status: Number(statusText),
        p_offer_name: offerName,
        p_offer_type: offerType,
        p_payout: payout,
      }
    );

    if (error) {
      return new Response("Processing failed", {
        status: 500,
      });
    }

    return new Response("ok", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch {
    return new Response("Postback error", {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  return handlePostback(request);
}

export async function POST(request: Request) {
  return handlePostback(request);
}
