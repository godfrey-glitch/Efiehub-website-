import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, amount, metadata, callbackUrl } = await req.json();

    if (!email || !amount || !metadata) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return NextResponse.json({ error: "Paystack not configured." }, { status: 500 });
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        // Paystack expects amount in kobo/pesewas (smallest currency unit)
        // GHS → pesewas: multiply by 100
        amount: Math.round(amount * 100),
        currency: "GHS",
        callback_url: callbackUrl,
        metadata,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message || "Paystack error." }, { status: 400 });
    }

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (err) {
    console.error("Paystack initialize error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
