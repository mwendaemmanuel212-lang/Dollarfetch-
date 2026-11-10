
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    service: "DollarFetch LIPAWIN webhook",
    status: "online",
    ready: false,
  });
}

export async function POST(_request: NextRequest) {
  // Payment processing remains disabled until
  // LIPAWIN signature verification is configured.
  return NextResponse.json(
    {
      received: false,
      error: "Webhook verification is not configured yet.",
    },
    { status: 503 }
  );
}
