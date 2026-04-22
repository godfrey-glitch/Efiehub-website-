"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getListingById } from "@/lib/listings";
import { getBookingsForListing, createBooking } from "@/lib/bookings";
import { Listing, GHS_TO_USD, BANK_DETAILS, PaymentMethod } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";
import { MapPin, CalendarDays, ChevronLeft, ShieldCheck, AlertCircle, Loader2, CreditCard, Building2, Smartphone, Copy, CheckCircle2 } from "lucide-react";
import { differenceInDays, format, addDays, isBefore, isAfter, isSameDay } from "date-fns";

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: React.ReactNode; sub: string; available: boolean }[] = [
  { id: "paystack", label: "Paystack", icon: <CreditCard size={18} />, sub: "Card, Mobile Money, Bank", available: true },
  { id: "paypal", label: "PayPal", icon: <span className="font-black text-base" style={{color:"#003087"}}>P</span>, sub: "Pay with your PayPal account", available: true },
  { id: "bank_transfer", label: "Bank Transfer", icon: <Building2 size={18} />, sub: "Pay directly to our account", available: true },
  { id: "apple_pay", label: "Apple Pay / Cash", icon: <Smartphone size={18} />, sub: "Requires Apple Pay setup", available: false },
];

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [bookedRanges, setBookedRanges] = useState<{ checkIn: Date; checkOut: Date }[]>([]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paystack");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bankConfirmed, setBankConfirmed] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "guest") { router.push("/"); return; }
    if (id) {
      Promise.all([getListingById(id), getBookingsForListing(id)]).then(([l, b]) => {
        setListing(l);
        setBookedRanges(b.map(bk => ({ checkIn: bk.checkIn, checkOut: bk.checkOut })));
        setLoading(false);
      });
    }
  }, [id, user, router]);

  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const nights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0;
  const totalPrice = nights > 0 && listing?.pricePerNight ? nights * listing.pricePerNight : 0;
  const totalUSD = (totalPrice * GHS_TO_USD).toFixed(0);

  const isDateBlocked = (d: string) => {
    const date = new Date(d);
    return bookedRanges.some(({ checkIn: ci, checkOut: co }) => (isAfter(date, ci) || isSameDay(date, ci)) && isBefore(date, co));
  };
  const validateDates = () => {
    if (!checkIn || !checkOut) { toast.error("Please select check-in and check-out dates."); return false; }
    if (nights <= 0) { toast.error("Check-out must be after check-in."); return false; }
    if (isDateBlocked(checkIn) || isDateBlocked(checkOut)) { toast.error("Selected dates overlap with an existing booking."); return false; }
    return true;
  };

  const copyBankDetails = () => {
    const text = `Bank: ${BANK_DETAILS.bankName}\nAccount Name: ${BANK_DETAILS.accountName}\nAccount: ${BANK_DETAILS.accountNumber}\nBranch: ${BANK_DETAILS.branch}`;
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handlePay = async () => {
    if (!listing || !user || !validateDates()) return;
    setSubmitting(true);

    try {
      if (paymentMethod === "paystack") {
        const res = await fetch("/api/paystack/initialize", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email, amount: totalPrice,
            callbackUrl: `${window.location.origin}/bookings/callback`,
            metadata: { listingId: listing.id, listingTitle: listing.title, guestId: user.uid, guestName: user.name, hostId: listing.hostId, checkIn: new Date(checkIn).toISOString(), checkOut: new Date(checkOut).toISOString(), nights },
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.authorizationUrl) { toast.error(data.error || "Failed to start payment."); return; }
        window.location.href = data.authorizationUrl;

      } else if (paymentMethod === "paypal") {
        // PayPal: open PayPal.me link or redirect to PayPal checkout
        const paypalUrl = `https://www.paypal.com/paypalme/efiehub/${(totalPrice * GHS_TO_USD).toFixed(2)}USD`;
        // Create booking as pending then redirect
        await createBooking({
          listingId: listing.id, listingTitle: listing.title,
          guestId: user.uid, guestName: user.name, hostId: listing.hostId,
          checkIn: new Date(checkIn), checkOut: new Date(checkOut),
          totalPrice, nights, status: "pending", paymentMethod: "paypal",
        });
        toast.success("Redirecting to PayPal…");
        setTimeout(() => { window.open(paypalUrl, "_blank"); router.push("/bookings/pending"); }, 1000);

      } else if (paymentMethod === "bank_transfer") {
        if (!bankConfirmed) { toast.error("Please confirm you've read the bank details below."); return; }
        await createBooking({
          listingId: listing.id, listingTitle: listing.title,
          guestId: user.uid, guestName: user.name, hostId: listing.hostId,
          checkIn: new Date(checkIn), checkOut: new Date(checkOut),
          totalPrice, nights, status: "pending", paymentMethod: "bank_transfer",
        });
        router.push("/bookings/bank-pending");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center mesh-bg">
      <div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: "rgba(14,165,233,0.2)", borderTopColor: "var(--sky)" }} />
    </div>
  );
  if (!listing) return <div className="min-h-screen flex items-center justify-center mesh-bg"><p style={{ color: "var(--muted)" }}>Listing not found.</p></div>;

  const iStyle = { border: "1.5px solid rgba(14,165,233,0.2)", background: "#f8faff" };

  return (
    <div className="min-h-screen mesh-bg pb-16">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link href={`/listings/${id}`} className="inline-flex items-center gap-1 text-sm font-medium mb-6 transition-colors duration-200"
          style={{ color: "var(--muted)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--sky)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
          <ChevronLeft size={15} /> Back to listing
        </Link>

        <h1 className="font-display font-black text-4xl mb-1" style={{ color: "var(--ink)" }}>Book Your Stay</h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{listing.title}</p>

        {/* Mini card */}
        <div className="rounded-2xl p-4 flex gap-4 mb-6" style={{ background: "white", border: "1px solid rgba(14,165,233,0.12)", boxShadow: "0 2px 16px rgba(14,165,233,0.06)" }}>
          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0" style={{ background: "#e0f2fe" }}>
            {listing.images?.[0] && <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />}
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--ink)" }}>{listing.title}</p>
            <p className="text-xs flex items-center gap-1 mt-1" style={{ color: "var(--muted)" }}><MapPin size={10} style={{ color: "var(--sky)" }} />{listing.location}</p>
            <p className="text-sm font-bold mt-2" style={{ color: "var(--ink)" }}>GHS {listing.pricePerNight?.toLocaleString()} <span className="font-normal text-xs" style={{ color: "var(--muted)" }}>/night</span></p>
          </div>
        </div>

        {/* Step 1: Dates */}
        <div className="rounded-2xl p-6 mb-4 space-y-5" style={{ background: "white", border: "1px solid rgba(14,165,233,0.12)", boxShadow: "0 2px 16px rgba(14,165,233,0.06)" }}>
          <h2 className="font-bold text-base" style={{ color: "var(--ink)" }}>① Select Dates</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Check-in", val: checkIn, min: today, set: (v: string) => { setCheckIn(v); if (checkOut && v >= checkOut) setCheckOut(""); } },
              { label: "Check-out", val: checkOut, min: checkIn || tomorrow, set: setCheckOut },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>{f.label}</label>
                <div className="relative">
                  <CalendarDays size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted)" }} />
                  <input type="date" min={f.min} value={f.val} onChange={e => f.set(e.target.value)}
                    className="w-full rounded-xl pl-9 pr-3 py-3 text-sm outline-none transition" style={iStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
                </div>
              </div>
            ))}
          </div>

          {bookedRanges.length > 0 && (
            <div className="rounded-xl px-4 py-3 text-xs flex items-start gap-2"
              style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", color: "#92400e" }}>
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              <span>{bookedRanges.length} date range{bookedRanges.length > 1 ? "s are" : " is"} already booked.</span>
            </div>
          )}

          {nights > 0 && (
            <div className="rounded-xl p-4 text-sm space-y-2" style={{ background: "#f0f9ff", border: "1px solid rgba(14,165,233,0.12)" }}>
              <div className="flex justify-between" style={{ color: "var(--muted)" }}>
                <span>GHS {listing.pricePerNight?.toLocaleString()} × {nights} night{nights !== 1 ? "s" : ""}</span>
                <span className="font-semibold">GHS {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-black pt-2" style={{ color: "var(--ink)", borderTop: "1px solid rgba(14,165,233,0.12)" }}>
                <span>Total</span>
                <div className="text-right">
                  <p>GHS {totalPrice.toLocaleString()}</p>
                  <p className="text-xs font-normal" style={{ color: "var(--muted)" }}>≈ ${totalUSD} USD</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Payment Method */}
        <div className="rounded-2xl p-6 mb-4" style={{ background: "white", border: "1px solid rgba(14,165,233,0.12)", boxShadow: "0 2px 16px rgba(14,165,233,0.06)" }}>
          <h2 className="font-bold text-base mb-4" style={{ color: "var(--ink)" }}>② Choose Payment Method</h2>
          <div className="space-y-3">
            {PAYMENT_OPTIONS.map(opt => (
              <button key={opt.id} type="button"
                disabled={!opt.available}
                onClick={() => opt.available && setPaymentMethod(opt.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200"
                style={paymentMethod === opt.id && opt.available
                  ? { border: "2px solid var(--sky)", background: "rgba(14,165,233,0.06)", boxShadow: "0 2px 12px rgba(14,165,233,0.15)" }
                  : opt.available
                    ? { border: "1.5px solid rgba(14,165,233,0.15)", background: "#f8faff" }
                    : { border: "1.5px solid rgba(14,165,233,0.08)", background: "#f8faff", opacity: 0.5, cursor: "not-allowed" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold"
                  style={{ background: paymentMethod === opt.id && opt.available ? "rgba(14,165,233,0.15)" : "rgba(14,165,233,0.07)", color: "var(--sky-d)" }}>
                  {opt.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: opt.available ? "var(--ink)" : "var(--muted)" }}>{opt.label}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{opt.available ? opt.sub : "Coming soon — requires merchant setup"}</p>
                </div>
                {paymentMethod === opt.id && opt.available && (
                  <CheckCircle2 size={18} style={{ color: "var(--sky)", flexShrink: 0 }} />
                )}
                {!opt.available && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ background: "rgba(14,165,233,0.1)", color: "var(--muted)" }}>Soon</span>
                )}
              </button>
            ))}
          </div>

          {/* PayPal info */}
          {paymentMethod === "paypal" && (
            <div className="mt-4 rounded-xl px-4 py-3 text-xs" style={{ background: "rgba(0,48,135,0.05)", border: "1px solid rgba(0,48,135,0.15)", color: "#1e3a5f" }}>
              <p className="font-semibold mb-1">PayPal Payment</p>
              <p>You'll be redirected to PayPal to complete payment. Your booking will be held as <strong>pending</strong> until PayPal confirms the transaction.</p>
              <p className="mt-1">Amount: <strong>${totalUSD} USD</strong> (≈ GHS {totalPrice.toLocaleString()})</p>
            </div>
          )}

          {/* Bank transfer details */}
          {paymentMethod === "bank_transfer" && (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl p-4" style={{ background: "rgba(14,165,233,0.04)", border: "1px solid rgba(14,165,233,0.15)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--sky-d)" }}>Bank Transfer Details</p>
                  <button onClick={copyBankDetails}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition"
                    style={{ background: copied ? "rgba(16,185,129,0.1)" : "rgba(14,165,233,0.1)", color: copied ? "#059669" : "var(--sky-d)" }}>
                    {copied ? <><CheckCircle2 size={11}/> Copied!</> : <><Copy size={11}/> Copy</>}
                  </button>
                </div>
                {[
                  { label: "Bank", val: BANK_DETAILS.bankName },
                  { label: "Account Name", val: BANK_DETAILS.accountName },
                  { label: "Account Number", val: BANK_DETAILS.accountNumber },
                  { label: "Branch", val: BANK_DETAILS.branch },
                  { label: "Amount", val: `GHS ${totalPrice.toLocaleString()} (≈ $${totalUSD} USD)` },
                  { label: "Reference", val: `EFIE-${user?.uid.slice(0,6).toUpperCase()}-${Date.now().toString().slice(-4)}` },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-1.5 text-xs" style={{ borderBottom: "1px solid rgba(14,165,233,0.08)" }}>
                    <span style={{ color: "var(--muted)" }}>{r.label}</span>
                    <span className="font-semibold" style={{ color: "var(--ink)" }}>{r.val}</span>
                  </div>
                ))}
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={bankConfirmed} onChange={e => setBankConfirmed(e.target.checked)}
                  className="mt-0.5 rounded" style={{ accentColor: "var(--sky)" }} />
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  I confirm I have noted the bank details and will transfer <strong>GHS {totalPrice.toLocaleString()}</strong> within 24 hours. I understand my booking will be <strong>pending</strong> until payment is confirmed.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Pay Button */}
        <button onClick={handlePay} disabled={submitting || nights <= 0}
          className="w-full text-white font-bold py-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 btn-pulse"
          style={{
            background: nights > 0 ? (paymentMethod === "paystack" ? "linear-gradient(135deg,#059669,#10b981)" : paymentMethod === "paypal" ? "linear-gradient(135deg,#003087,#009cde)" : "linear-gradient(135deg, var(--sky), var(--sky-dd))") : "rgba(14,165,233,0.15)",
            color: nights > 0 ? "white" : "var(--muted)",
            cursor: nights <= 0 ? "not-allowed" : "pointer",
            boxShadow: nights > 0 && !submitting ? "0 4px 20px rgba(14,165,233,0.3)" : "none",
          }}>
          {submitting ? (
            <><Loader2 size={15} className="animate-spin" /> Processing…</>
          ) : (
            <><ShieldCheck size={15} />
              {paymentMethod === "paystack" && `Pay with Paystack${nights > 0 ? ` · GHS ${totalPrice.toLocaleString()}` : ""}`}
              {paymentMethod === "paypal" && `Continue with PayPal${nights > 0 ? ` · $${totalUSD} USD` : ""}`}
              {paymentMethod === "bank_transfer" && `Reserve with Bank Transfer${nights > 0 ? ` · GHS ${totalPrice.toLocaleString()}` : ""}`}
            </>
          )}
        </button>
        <p className="text-center text-xs mt-3" style={{ color: "var(--muted)" }}>
          {paymentMethod === "paystack" && "Secure checkout via Paystack. Booking confirmed immediately after payment."}
          {paymentMethod === "paypal" && "You'll be redirected to PayPal. Booking confirmed after payment is received."}
          {paymentMethod === "bank_transfer" && "Booking held for 24 hours pending bank transfer confirmation."}
        </p>
      </div>
    </div>
  );
}
