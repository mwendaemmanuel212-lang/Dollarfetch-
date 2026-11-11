import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("254") && digits.length === 12) return digits;

  if (digits.startsWith("0") && digits.length === 10) {
    return "254" + digits.slice(1);
  }

  if (digits.length === 9 && /^[17]/.test(digits)) {
    return "254" + digits;
  }

  return null;
}

export async function POST(request: NextRequest) {
  let admin: any = null;
  let paymentId: number | null = null;

  try {
    const token = (request.headers.get("authorization") || "")
      .replace(/^Bearer /i, "")
      .trim();

    if (!token) {
      return NextResponse.json(
        { error: "Please log in again." },
        { status: 401 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    const cfEnv = getCloudflareContext().env as unknown as
      Record<string, string | undefined>;

    const productToken = cfEnv.FITYPAY_PRODUCT_TOKEN || "";

    if (!url || !anon || !service || !productToken) {
      return NextResponse.json(
        { error: "FityPay or Supabase payment configuration is incomplete." },
        { status: 500 }
      );
    }

    const auth = createClient(url, anon, {
      auth: { persistSession: false },
    });

    const { data, error: authError } = await auth.auth.getUser(token);

    if (authError || !data.user) {
      return NextResponse.json(
        { error: "Please log in again." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const phone = normalizePhone(String(body.phone || ""));

    if (!phone) {
      return NextResponse.json(
        { error: "Enter a valid Kenyan M-PESA number." },
        { status: 400 }
      );
    }

    const purpose =
      body.purpose === "deposit" ? "deposit" : "activation";

    let usdAmount: number | null = null;
    let amount = 99;
    let depositRequestId: string | null = null;

    admin = createClient(url, service, {
      auth: { persistSession: false },
    });

    // Deposits use the live USD-to-KES exchange rate.
    // Activation always uses the fixed KES 99 fee.
    if (purpose === "deposit") {
      depositRequestId = String(body.deposit_request_id || "");

      if (!depositRequestId) {
        return NextResponse.json(
          { error: "Deposit request ID is required." },
          { status: 400 }
        );
      }

      const { data: deposit, error: depositError } = await admin
        .from("deposit_requests")
        .select("id, amount, currency, method, status")
        .eq("id", depositRequestId)
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (depositError) throw depositError;

      if (
        !deposit ||
        deposit.status !== "pending" ||
        deposit.currency !== "USD" ||
        deposit.method !== "M-PESA"
      ) {
        return NextResponse.json(
          {
            error:
              "This pending M-PESA deposit request could not be verified.",
          },
          { status: 400 }
        );
      }

      usdAmount = Number(deposit.amount);

      if (!Number.isFinite(usdAmount) || usdAmount <= 0) {
        return NextResponse.json(
          { error: "Enter a valid deposit amount." },
          { status: 400 }
        );
      }

      const fx = await fetch(
        "https://open.er-api.com/v6/latest/USD",
        { cache: "no-store" }
      );

      const fxData = await fx.json();
      const rate = Number(fxData?.rates?.KES);

      if (
        !fx.ok ||
        fxData?.result !== "success" ||
        !Number.isFinite(rate) ||
        rate <= 0
      ) {
        throw new Error("KES exchange rate unavailable.");
      }

      amount = Math.ceil(usdAmount * rate);
    }

    const { data: payment, error: insertError } = await admin
      .from("mpesa_stk_payments")
      .insert({
        user_id: data.user.id,
        phone,
        amount,
        status: "initiating",
        purpose,
        deposit_request_id: depositRequestId,
      })
      .select("id")
      .single();

    if (insertError || !payment) {
      throw new Error(
        insertError?.message || "Payment record failed."
      );
    }

    paymentId = payment.id;

    const webhookUrl =
      "https://dollarfetch.bwk.workers.dev/api/fitypay/webhook";

    const requestBody = {
      phone,
      amount,
      webhook_url: webhookUrl,
      reference: "DollarFetch",
      description:
  purpose === "activation"
    ? "DollarFetch activation"
    : "DollarFetch deposit",
    };

    const response = await fetch(
      "https://api.kinaracloud.co.ke/v1/start",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${productToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
      }
    );

    const result = await response.json().catch(() => ({}));

    const checkoutRequestId = String(
      result.checkout_request_id || ""
    );

    if (
      !response.ok ||
      result.success !== true ||
      !checkoutRequestId
    ) {
      const message = String(
        result.message ||
        result.error ||
        "FityPay STK Push request failed."
      );

      await admin
        .from("mpesa_stk_payments")
        .update({
          status: "failed",
          result_description: message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      return NextResponse.json(
        { error: message },
        { status: 502 }
      );
    }

    const { error: updateError } = await admin
      .from("mpesa_stk_payments")
      .update({
        status: "pending",
        checkout_request_id: checkoutRequestId,
        result_description: "FityPay STK request accepted.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      purpose,
      amount,
      currency: "KES",
      usdAmount,
      paymentId: checkoutRequestId,
      message:
        result.message ||
        "STK prompt sent. Check your phone and enter your M-PESA PIN.",
    });
  } catch (error) {
    if (admin && paymentId !== null) {
      await admin
        .from("mpesa_stk_payments")
        .update({
          status: "failed",
          result_description:
            error instanceof Error
              ? error.message
              : "Payment error.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentId);
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Payment error.",
      },
      { status: 500 }
    );
  }
}  
