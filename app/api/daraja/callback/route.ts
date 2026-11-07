
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!url || !service) {
      return NextResponse.json(
        { error: "Server configuration missing" },
        { status: 500 }
      );
    }

    const admin = createClient(url, service, {
      auth: { persistSession: false },
    });

    const payload = await request.json();
    const callback = payload?.Body?.stkCallback;

    if (!callback?.CheckoutRequestID) {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      });
    }

    const checkoutId = callback.CheckoutRequestID;
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
        ResultDesc: "Payment not found",
      });
    }

    if (payment.status === "completed") {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Already processed",
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

    if (resultCode === 0 && receipt) {
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
            : "Callback processing failed",
      },
      { status: 500 }
    );
  }
}
