
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return "254" + digits.slice(1);
  if (digits.length === 9 && /^[17]/.test(digits)) return "254" + digits;
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const token = (request.headers.get("authorization") || "").replace(/^Bearer /, "");
    if (!token) {
      return NextResponse.json({ error: "Please log in again." }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const key = process.env.DARAJA_CONSUMER_KEY!;
    const secret = process.env.DARAJA_CONSUMER_SECRET!;
    const passkey = process.env.DARAJA_PASSKEY!;
    const shortcode = process.env.DARAJA_SHORTCODE!;

    if (!url || !anon || !service || !key || !secret || !passkey || !shortcode) {
      return NextResponse.json({
        error: "Missing configuration: " + [
          !url && "NEXT_PUBLIC_SUPABASE_URL",
          !anon && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          !service && "SUPABASE_SERVICE_ROLE_KEY",
          !key && "DARAJA_CONSUMER_KEY",
          !secret && "DARAJA_CONSUMER_SECRET",
          !passkey && "DARAJA_PASSKEY",
          !shortcode && "DARAJA_SHORTCODE"
        ].filter(Boolean).join(", ")
      }, { status: 500 });
    }

    const auth = createClient(url, anon, {
      auth: { persistSession: false }
    });

    const { data, error } = await auth.auth.getUser(token);

    if (error || !data.user) {
      return NextResponse.json({ error: "Please log in again." }, { status: 401 });
    }

    const body = await request.json();
    const phone = normalizePhone(String(body.phone || ""));

    if (!phone) {
      return NextResponse.json({
        error: "Enter a valid Kenyan M-PESA number."
      }, { status: 400 });
    }

    const fx = await fetch("https://open.er-api.com/v6/latest/USD", {
      cache: "no-store"
    });

    const fxData = await fx.json();
    const rate = Number(fxData?.rates?.KES);

    if (!fx.ok || fxData?.result !== "success" || !Number.isFinite(rate) || rate <= 0) {
      throw new Error("KES exchange rate unavailable.");
    }

    const amount = Math.ceil(2 * rate);

    const timestamp = new Date(Date.now() + 3 * 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14);

    const password = Buffer.from(
      shortcode + passkey + timestamp
    ).toString("base64");

    const baseUrl = "https://sandbox.safaricom.co.ke";

    const oauth = await fetch(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: "Basic " + Buffer.from(key + ":" + secret).toString("base64")
        },
        cache: "no-store"
      }
    );

    const oauthData = await oauth.json();

    if (!oauth.ok || !oauthData.access_token) {
      throw new Error("Daraja authentication failed.");
    }

    const admin = createClient(url, service, {
      auth: { persistSession: false }
    });

    const { data: payment, error: insertError } = await admin
      .from("mpesa_stk_payments")
      .insert({
        user_id: data.user.id,
        phone,
        amount,
        status: "initiating"
      })
      .select("id")
      .single();

    if (insertError || !payment) {
      throw new Error(insertError?.message || "Payment record failed.");
    }

    const response = await fetch(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + oauthData.access_token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: phone,
          PartyB: shortcode,
          PhoneNumber: phone,
          CallBackURL: "https://dollarfetch.bwk.workers.dev/api/daraja/callback",
          AccountReference: "452055031",
          TransactionDesc: "MANUH Activate"
        })
      }
    );

    const result = await response.json();

    if (!response.ok || result.ResponseCode !== "0" || !result.CheckoutRequestID) {
      await admin
        .from("mpesa_stk_payments")
        .update({
          status: "failed",
          result_description:
            result.errorMessage || result.ResponseDescription || "STK failed"
        })
        .eq("id", payment.id);

      return NextResponse.json({
        error: result.errorMessage || result.ResponseDescription || "STK request failed."
      }, { status: 502 });
    }

    const { error: updateError } = await admin
      .from("mpesa_stk_payments")
      .update({
        status: "pending",
        merchant_request_id: result.MerchantRequestID || null,
        checkout_request_id: result.CheckoutRequestID
      })
      .eq("id", payment.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      success: true,
      amount,
      message: "STK prompt sent. Check your phone and enter your M-PESA PIN."
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Payment error."
    }, { status: 500 });
  }
    }
