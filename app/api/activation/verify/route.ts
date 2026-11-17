
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
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

    if (!url || !anon || !service) {
      throw new Error("Payment verification configuration is incomplete.");
    }

    const auth = createClient(url, anon, {
      auth: { persistSession: false },
    });

    const { data: authData, error: authError } =
      await auth.auth.getUser(token);

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Please log in again." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const receipt = String(body.receipt || "").trim().toUpperCase();

    if (!receipt) {
      return NextResponse.json(
        { error: "Paste your M-PESA confirmation code." },
        { status: 400 }
      );
    }

    const admin = createClient(url, service, {
      auth: { persistSession: false },
    });

    const { data: payments, error: lookupError } = await admin
      .from("mpesa_stk_payments")
      .select("id,user_id,amount,status,purpose,result_code,mpesa_receipt_number")
      .eq("mpesa_receipt_number", receipt)
      .limit(2);

    if (lookupError) throw lookupError;

    if (!payments || payments.length === 0) {
      return NextResponse.json(
        {
          error:
            "No matching payment confirmation has arrived yet. If you just paid, wait a little and try again."
        },
        { status: 404 }
      );
    }

    if (payments.length !== 1) {
      return NextResponse.json(
        { error: "This receipt needs additional payment review." },
        { status: 409 }
      );
    }

    const payment = payments[0];

    if (payment.user_id !== authData.user.id) {
      return NextResponse.json(
        { error: "This receipt belongs to another payment account." },
        { status: 403 }
      );
    }

    if (
      payment.status !== "completed" ||
      String(payment.result_code) !== "0"
    ) {
      return NextResponse.json(
        { error: "Your M-PESA payment is not yet confirmed. Please retry shortly." },
        { status: 409 }
      );
    }

    if (
      payment.purpose !== "activation" ||
      Number(payment.amount) !== 99
    ) {
      return NextResponse.json(
        { error: "This receipt does not match the activation payment." },
        { status: 400 }
      );
    }

    const { error: activationError } = await admin
      .from("activation_requests")
      .upsert(
        {
          user_id: authData.user.id,
          amount: 0.76,
          currency: "USD",
          status: "approved",
        },
        { onConflict: "user_id" }
      );

    if (activationError) throw activationError;

    return NextResponse.json({
      success: true,
      message: "Payment verified! Your DollarFetch account is now activated."
    });

  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Payment verification failed. Please try again."
      },
      { status: 500 }
    );
  }
      }
