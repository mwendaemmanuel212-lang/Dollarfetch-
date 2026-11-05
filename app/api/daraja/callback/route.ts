import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!url || !service) {
      return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
    }

    const admin = createClient(url, service, {
      auth: { persistSession: false },
    });

    const payload = await request.json();
    const callback = payload?.Body?.stkCallback;

    if (!callback?.CheckoutRequestID) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
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
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Payment not found" });
    }

    if (payment.status === "completed") {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Already processed" });
    }

    const items = callback.CallbackMetadata?.Item || [];
    const getItem = (name: string) =>
      items.find((item: { Name: string; Value?: string | number }) => item.Name === name)?.Value;

    const receipt = getItem("MpesaReceiptNumber");
    const transactionDate = getItem("TransactionDate");

    if (resultCode === 0 && receipt) {
      const { error: activationError } = await admin
        .from("activation_requests")
        .insert({
          user_id: payment.user_id,
          amount: 2,
          currency: "USD",
          method: "M-PESA",
          phone: payment.phone,
          status: "pending",
        });

      if (activationError) throw activationError;

      const { error: updateError } = await admin
        .from("mpesa_stk_payments")
        .update({
          status: "completed",
          result_code: String(resultCode),
          result_description: description,
          mpesa_receipt_number: String(receipt),
          transaction_date: transactionDate ? String(transactionDate) : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      if (updateError) throw updateError;
    } else {
      const { error: updateError } = await admin
        .from("mpesa_stk_payments")
        .update({
          status: "failed",
          result_code: String(resultCode),
          result_description: description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      if (updateError) throw updateError;
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch {
    return NextResponse.json(
      { ResultCode: 1, ResultDesc: "Callback processing failed" },
      { status: 500 }
    );
  }
    }
