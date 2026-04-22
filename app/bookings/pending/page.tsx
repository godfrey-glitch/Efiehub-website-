"use client";
import Link from "next/link";
import { Clock, CheckCircle2 } from "lucide-react";
export default function PayPalPendingPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center mesh-bg px-4">
      <div className="w-full max-w-md text-center rounded-2xl p-10"
        style={{ background: "white", border: "1px solid rgba(0,48,135,0.15)", boxShadow: "0 8px 40px rgba(0,48,135,0.08)" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(0,48,135,0.08)" }}>
          <Clock size={32} style={{ color: "#003087" }} />
        </div>
        <h1 className="font-display font-black text-3xl mb-2" style={{ color: "var(--ink)" }}>Payment Pending</h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          Complete your PayPal payment in the tab that just opened. Your booking will be confirmed once we receive payment.
        </p>
        <div className="rounded-xl p-4 mb-6 text-left space-y-2 text-xs" style={{ background: "#f0f9ff", border: "1px solid rgba(14,165,233,0.12)" }}>
          {["PayPal window opened in new tab", "Complete payment on PayPal", "We'll email you a booking confirmation", "Host will be notified automatically"].map((s,i) => (
            <div key={i} className="flex items-center gap-2" style={{ color: "var(--muted)" }}>
              <CheckCircle2 size={12} style={{ color: "var(--sky)", flexShrink: 0 }} /> {s}
            </div>
          ))}
        </div>
        <Link href="/" className="block w-full font-bold py-3.5 rounded-xl text-white text-sm btn-pulse"
          style={{ background: "linear-gradient(135deg, var(--sky), var(--sky-dd))" }}>
          Back to Listings
        </Link>
      </div>
    </div>
  );
}
