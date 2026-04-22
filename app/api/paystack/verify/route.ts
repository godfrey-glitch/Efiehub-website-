import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Missing reference." }, { status: 400 });
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return NextResponse.json({ error: "Paystack not configured." }, { status: 500 });
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment verification failed.", status: data.data?.status },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      reference: data.data.reference,
      amount: data.data.amount / 100, // Convert pesewas back to GHS
      metadata: data.data.metadata,
    });
  } catch (err) {
    console.error("Paystack verify error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
