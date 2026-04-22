"use client";
import Link from "next/link";
import { Building2, CheckCircle2, Clock } from "lucide-react";
import { BANK_DETAILS } from "@/lib/types";
export default function BankPendingPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center mesh-bg px-4">
      <div className="w-full max-w-md rounded-2xl p-10"
        style={{ background: "white", border: "1px solid rgba(14,165,233,0.15)", boxShadow: "0 8px 40px rgba(14,165,233,0.1)" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(14,165,233,0.1)" }}>
          <Building2 size={32} style={{ color: "var(--sky-d)" }} />
        </div>
        <h1 className="font-display font-black text-2xl mb-2 text-center" style={{ color: "var(--ink)" }}>Booking Reserved!</h1>
        <p className="text-sm mb-6 text-center" style={{ color: "var(--muted)" }}>
          Your booking is held for <strong>24 hours</strong>. Please complete your bank transfer to confirm it.
        </p>
        <div className="rounded-xl p-4 mb-5" style={{ background: "#f0f9ff", border: "1px solid rgba(14,165,233,0.12)" }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--sky-d)" }}>Transfer To</p>
          {[
            { label: "Bank", val: BANK_DETAILS.bankName },
            { label: "Account Name", val: BANK_DETAILS.accountName },
            { label: "Account Number", val: BANK_DETAILS.accountNumber },
            { label: "Branch", val: BANK_DETAILS.branch },
          ].map(r => (
            <div key={r.label} className="flex justify-between py-1.5 text-xs" style={{ borderBottom: "1px solid rgba(14,165,233,0.08)" }}>
              <span style={{ color: "var(--muted)" }}>{r.label}</span>
              <span className="font-bold" style={{ color: "var(--ink)" }}>{r.val}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2 mb-6">
          {[
            "Transfer within 24 hours to hold your booking",
            "Use your name as the payment reference",
            "Email your receipt to support@efiehub.com",
            "We'll confirm within 2 business hours",
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
              <Clock size={12} style={{ color: "var(--sky)", flexShrink: 0 }} /> {s}
            </div>
          ))}
        </div>
        <Link href="/" className="block w-full font-bold py-3.5 rounded-xl text-white text-sm text-center btn-pulse"
          style={{ background: "linear-gradient(135deg, var(--sky), var(--sky-dd))" }}>
          Back to Listings
        </Link>
      </div>
    </div>
  );
}
