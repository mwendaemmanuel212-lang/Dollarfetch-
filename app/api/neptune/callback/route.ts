
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const timestamp = request.headers.get("x-neptune-timestamp") || "";
    const suppliedSignature = (
      request.headers.get("x-neptune-signature") || ""
    ).replace(/^sha256=/i, "").toLowerCase();

    const timestampNumber = Number(timestamp);

    if (
      !timestamp ||
      !Number.isFinite(timestampNumber) ||
      Math.abs(Math.floor(Date.now() / 1000) - timestampNumber) > 300
    ) {
      return NextResponse.json(
        { error: "Invalid or expired webhook timestamp." },
        { status: 401 }
      );
    }

    const cfEnv = getCloudflareContext().env as unknown as
      Record<string, string | undefined>;

    const secretKey = cfEnv.NEPTUNE_SECRET_KEY || "";

    if (!secretKey || !suppliedSignature) {
      return NextResponse.json(
        { error: "Webhook configuration missing." },
        { status: 401 }
      );
    }

    const expectedSignature = createHmac("sha256", secretKey)
      .update(timestamp + "." + rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const suppliedBuffer = Buffer.from(suppliedSignature, "hex");

    if (
      expectedBuffer.length !== suppliedBuffer.length ||
      !timingSafeEqual(expectedBuffer, suppliedBuffer)
    ) {
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);

    const event = String(payload.event || "");
    const providerPaymentId = String(payload.paymentId || "");
    const paymentStatus = String(payload.status || "").toLowerCase();

    if (!providerPaymentId) {
      return NextResponse.json(
        { error: "Payment ID missing." },
        { status: 400 }
      );
    }

    if (
      event !== "payment.success" &&
      event !== "payment.failed"
    ) {
      return NextResponse.json({ received: true });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!url || !serviceKey) {
      throw new Error("Supabase server configuration missing.");
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: payment, error: lookupError } = await admin
      .from("mpesa_stk_payments")
      .select("*")
      .eq("checkout_request_id", providerPaymentId)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found." },
        { status: 404 }
      );
    }

    if (payment.status === "completed") {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (event === "payment.success" && paymentStatus !== "success") {
      return NextResponse.json(
        { error: "Payment status does not match success event." },
        { status: 400 }
      );
    }

    if (event === "payment.failed" && paymentStatus !== "failed") {
      return NextResponse.json(
        { error: "Payment status does not match failed event." },
        { status: 400 }
      );
    }

    if (event === "payment.success") {
      const receivedAmount = Number(payload.amount);
      const receivedPhone = String(payload.phone || "").replace(/\D/g, "");

      if (
        !Number.isFinite(receivedAmount) ||
        receivedAmount !== Number(payment.amount)
      ) {
        return NextResponse.json(
          { error: "Payment amount mismatch." },
          { status: 400 }
        );
      }

      if (
        receivedPhone &&
        receivedPhone !== String(payment.phone).replace(/\D/g, "")
      ) {
        return NextResponse.json(
          { error: "Payment phone number mismatch." },
          { status: 400 }
        );
      }

      const receipt = String(payload.mpesaReceiptNumber || "");

      if (payment.purpose === "deposit") {
        if (!payment.deposit_request_id) {
          throw new Error("Deposit request ID missing.");
        }

        const { error } = await admin
          .from("deposit_requests")
          .update({
            payment_reference: receipt || providerPaymentId,
            sender_phone: payment.phone,
            status: "pending",
          })
          .eq("id", payment.deposit_request_id)
          .eq("user_id", payment.user_id);

        if (error) throw error;
      } else {
        const { error } = await admin
          .from("activation_requests")
          .upsert(
            {
              user_id: payment.user_id,
              amount: 2,
              currency: "USD",
              status: "pending",
            },
            { onConflict: "user_id" }
          );

        if (error) throw error;
      }

      const { error: updateError } = await admin
        .from("mpesa_stk_payments")
        .update({
          status: "completed",
          result_code: "0",
          result_description: "Neptune payment successful.",
          mpesa_receipt_number: receipt || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      if (updateError) throw updateError;
    } else {
      const { error } = await admin
        .from("mpesa_stk_payments")
        .update({
          status: "failed",
          result_code: "failed",
          result_description: "Neptune payment failed.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      if (error) throw error;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
  }
