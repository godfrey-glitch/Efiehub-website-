"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBooking } from "@/lib/bookings";
import { ShieldCheck, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

type Status = "verifying" | "success" | "failed";
interface BookingSummary { listingTitle: string; checkIn: string; checkOut: string; nights: number; totalPrice: number; }

export default function PaystackCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("verifying");
  const [summary, setSummary] = useState<BookingSummary | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (!reference) { setErrorMsg("No payment reference found."); setStatus("failed"); return; }
    const verify = async () => {
      try {
        const res = await fetch(`/api/paystack/verify?reference=${reference}`);
        const data = await res.json();
        if (!res.ok || !data.success) { setErrorMsg(data.error || "Payment could not be verified."); setStatus("failed"); return; }
        const meta = data.metadata;
        if (!meta?.listingId || !meta?.guestId) { setErrorMsg("Booking details missing from payment."); setStatus("failed"); return; }
        await createBooking({ listingId: meta.listingId, listingTitle: meta.listingTitle, guestId: meta.guestId, guestName: meta.guestName, hostId: meta.hostId, checkIn: new Date(meta.checkIn), checkOut: new Date(meta.checkOut), totalPrice: data.amount, nights: meta.nights, status: "confirmed" });
        setSummary({ listingTitle: meta.listingTitle, checkIn: meta.checkIn, checkOut: meta.checkOut, nights: meta.nights, totalPrice: data.amount });
        setStatus("success");
      } catch { setErrorMsg("Something went wrong confirming your booking."); setStatus("failed"); }
    };
    verify();
  }, [searchParams]);

  const wrapStyle: React.CSSProperties = { minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" };

  if (status === "verifying") return (
    <div style={{ ...wrapStyle, background: "#f0f9ff" }}>
      <div className="text-center">
        <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: "var(--sky)" }} />
        <p className="font-bold" style={{ color: "var(--ink)" }}>Verifying your payment…</p>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Please don't close this page.</p>
      </div>
    </div>
  );

  if (status === "failed") return (
    <div style={{ ...wrapStyle, background: "#f0f9ff" }}>
      <div className="w-full max-w-md text-center rounded-2xl p-10" style={{ background: "white", border: "1px solid rgba(239,68,68,0.2)", boxShadow: "0 8px 40px rgba(239,68,68,0.08)" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(239,68,68,0.1)" }}>
          <XCircle size={32} style={{ color: "#dc2626" }} />
        </div>
        <h1 className="font-display font-black text-3xl mb-2" style={{ color: "var(--ink)" }}>Payment Failed</h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>{errorMsg}</p>
        <Link href="/" className="block w-full font-bold py-3.5 rounded-xl text-white text-sm btn-pulse" style={{ background: "linear-gradient(135deg, var(--sky), var(--sky-dd))" }}>
          Back to Listings
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ ...wrapStyle, background: "#f0f9ff" }}>
      <div className="w-full max-w-md text-center rounded-2xl p-10" style={{ background: "white", border: "1px solid rgba(16,185,129,0.2)", boxShadow: "0 8px 40px rgba(16,185,129,0.1)" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(16,185,129,0.1)" }}>
          <ShieldCheck size={32} style={{ color: "#059669" }} />
        </div>
        <h1 className="font-display font-black text-3xl mb-2" style={{ color: "var(--ink)" }}>Booking Confirmed!</h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Your stay at <strong>{summary?.listingTitle}</strong> is booked and paid.</p>
        {summary && (
          <div className="rounded-xl p-4 text-sm text-left space-y-2 mb-6" style={{ background: "#f0f9ff", border: "1px solid rgba(14,165,233,0.12)" }}>
            {[
              { label: "Check-in", val: format(new Date(summary.checkIn), "MMM d, yyyy") },
              { label: "Check-out", val: format(new Date(summary.checkOut), "MMM d, yyyy") },
              { label: "Duration", val: `${summary.nights} night${summary.nights !== 1 ? "s" : ""}` },
            ].map(r => (
              <div key={r.label} className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>{r.label}</span>
                <span className="font-semibold" style={{ color: "var(--ink)" }}>{r.val}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 font-black" style={{ color: "var(--ink)", borderTop: "1px solid rgba(14,165,233,0.12)" }}>
              <span>Total Paid</span>
              <span style={{ color: "#059669" }}>GHS {summary.totalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}
        <Link href="/" className="block w-full font-bold py-3.5 rounded-xl text-white text-sm btn-pulse" style={{ background: "linear-gradient(135deg, var(--sky), var(--sky-dd))", boxShadow: "0 4px 16px rgba(14,165,233,0.35)" }}>
          Back to Listings
        </Link>
      </div>
    </div>
  );
}
