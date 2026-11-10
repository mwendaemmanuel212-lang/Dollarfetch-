
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function challengeResponse(challenge: string | null) {
  if (!challenge) {
    return new Response("Missing challenge", { status: 400 });
  }

  return new Response(challenge, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const challenge = url.searchParams.get("fitypay_challenge");

  return challengeResponse(challenge);
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Support FityPay's legacy POST verification as well.
    if (
      payload?.event === "webhook.verification" &&
      typeof payload?.verification_token === "string"
    ) {
      return new Response(payload.verification_token, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!url || !service) {
      return NextResponse.json(
        { error: "Server configuration missing." },
        { status: 500 }
      );
    }

    const admin = createClient(url, service, {
      auth: { persistSession: false },
    });

    const callback = payload?.Body?.stkCallback;

    if (!callback?.CheckoutRequestID) {
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: "Invalid callback." },
        { status: 400 }
      );
    }

    const checkoutId = String(callback.CheckoutRequestID);
    const resultCode = Number(callback.ResultCode);
    const description = String(callback.ResultDesc || "");

    const { data: payment, error: lookupError } = await admin
      .from("mpesa_stk_payments")
      .select("*")
      .eq("checkout_request_id", checkoutId)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (!payment) {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Payment not found.",
      });
    }

    // Prevent a repeated callback from processing the same payment twice.
    if (payment.status === "completed") {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Already processed.",
      });
    }

    const items = callback.CallbackMetadata?.Item || [];

    const getItem = (name: string) =>
      items.find(
        (item: { Name: string; Value?: string | number }) =>
          item.Name === name
      )?.Value;

    const receipt = getItem("MpesaReceiptNumber");
    const transactionDate = getItem("TransactionDate");
    const callbackAmount = getItem("Amount");
    const callbackPhone = getItem("PhoneNumber");

    if (resultCode === 0 && receipt) {
      // Verify the amount against the payment record.
      if (
        callbackAmount !== undefined &&
        Number(callbackAmount) !== Number(payment.amount)
      ) {
        throw new Error("Callback amount does not match the payment record.");
      }

      // Verify the payer's phone when the callback supplies it.
      if (
        callbackPhone !== undefined &&
        String(callbackPhone).replace(/\D/g, "") !==
          String(payment.phone).replace(/\D/g, "")
      ) {
        throw new Error("Callback phone does not match the payment record.");
      }

      if (payment.purpose === "deposit") {
        if (!payment.deposit_request_id) {
          throw new Error("Deposit request ID is missing.");
        }

        const { error } = await admin
          .from("deposit_requests")
          .update({
            payment_reference: String(receipt),
            sender_phone: payment.phone,
            status: "pending",
          })
          .eq("id", payment.deposit_request_id)
          .eq("user_id", payment.user_id);

        if (error) throw error;
      } else {
        // Payment is confirmed, but activation remains pending
        // until an administrator verifies and approves it.
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
          result_code: String(resultCode),
          result_description: description,
          mpesa_receipt_number: String(receipt),
          transaction_date: transactionDate
            ? String(transactionDate)
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      if (updateError) throw updateError;
    } else {
      const { error } = await admin
        .from("mpesa_stk_payments")
        .update({
          status: "failed",
          result_code: String(resultCode),
          result_description: description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      if (error) throw error;
    }

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ResultCode: 1,
        ResultDesc:
          error instanceof Error
            ? error.message
            : "Callback processing failed.",
      },
      { status: 500 }
    );
  }
}
