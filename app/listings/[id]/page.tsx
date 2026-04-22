"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getListingById } from "@/lib/listings";
import { createInquiry } from "@/lib/inquiries";
import { Listing, GHS_TO_USD } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";
import { MapPin, BadgeCheck, ChevronLeft, ChevronRight, Star, Wifi, Car, Waves, Wind, ShieldCheck, Phone, Mail, MessageSquare, BedDouble, Bath, Tag, Send, CheckCircle2 } from "lucide-react";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={13} />, Parking: <Car size={13} />,
  "Swimming Pool": <Waves size={13} />, "Air Conditioning": <Wind size={13} />,
};

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  // Inquiry form state
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [inquirySent, setInquirySent] = useState(false);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);

  useEffect(() => {
    if (id) getListingById(id).then(l => { setListing(l); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (user) { setInquiryName(user.name); setInquiryEmail(user.email); }
  }, [user]);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;
    setInquirySubmitting(true);
    try {
      await createInquiry({
        listingId: listing.id, listingTitle: listing.title,
        senderId: user?.uid || "anonymous", senderName: inquiryName,
        senderEmail: inquiryEmail, senderPhone: inquiryPhone || undefined,
        message: inquiryMsg, hostId: listing.hostId,
      });
      setInquirySent(true);
      toast.success("Enquiry sent to the property owner!");
    } catch { toast.error("Failed to send enquiry. Please try again."); }
    finally { setInquirySubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center mesh-bg">
      <div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: "rgba(14,165,233,0.2)", borderTopColor: "var(--sky)" }} />
    </div>
  );
  if (!listing) return (
    <div className="min-h-screen flex items-center justify-center mesh-bg">
      <p style={{ color: "var(--muted)" }}>Listing not found.</p>
    </div>
  );

  const isSale = listing.listingType === "sale";
  const images = listing.images?.length ? listing.images : ["/placeholder.jpg"];
  const price = isSale ? listing.salePrice : listing.pricePerNight;
  const usd = price ? (price * GHS_TO_USD).toFixed(0) : "0";
  const iStyle = { border: "1.5px solid rgba(14,165,233,0.2)", background: "#f8faff" };

  return (
    <div className="min-h-screen mesh-bg pb-16">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium mb-6 transition-colors duration-200"
          style={{ color: "var(--muted)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--sky)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
          <ChevronLeft size={15} /> Back to listings
        </Link>

        {/* Gallery */}
        <div className="relative rounded-3xl overflow-hidden mb-10 shadow-2xl" style={{ height: "clamp(260px, 45vw, 480px)", background: "#e0f2fe" }}>
          <img src={images[imgIdx]} alt={listing.title} className="w-full h-full object-cover transition-opacity duration-300" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,26,46,0.4) 0%, transparent 50%)" }} />
          {images.length > 1 && (
            <>
              {[{ dir: "prev", icon: <ChevronLeft size={18} />, fn: () => setImgIdx(i => (i - 1 + images.length) % images.length), pos: "left-4" },
                { dir: "next", icon: <ChevronRight size={18} />, fn: () => setImgIdx(i => (i + 1) % images.length), pos: "right-4" }
              ].map(b => (
                <button key={b.dir} onClick={b.fn}
                  className={`absolute ${b.pos} top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all duration-200`}
                  style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}>
                  {b.icon}
                </button>
              ))}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className="rounded-full transition-all duration-200"
                    style={{ width: i === imgIdx ? "20px" : "6px", height: "6px", background: i === imgIdx ? "white" : "rgba(255,255,255,0.5)" }} />
                ))}
              </div>
            </>
          )}
          {/* Image count */}
          {images.length > 1 && (
            <span className="absolute bottom-4 right-4 text-xs font-semibold text-white px-2.5 py-1 rounded-full"
              style={{ background: "rgba(12,26,46,0.7)", backdropFilter: "blur(8px)" }}>
              {imgIdx + 1} / {images.length}
            </span>
          )}
          <span className="absolute top-4 left-4 flex items-center gap-1 text-white text-xs px-3 py-1.5 rounded-full font-bold"
            style={{ background: isSale ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#0ea5e9,#0284c7)" }}>
            {isSale ? <><Tag size={10}/> For Sale</> : "For Rent"}
          </span>
          {listing.isVerified && (
            <span className="absolute top-4 right-4 flex items-center gap-1 text-white text-xs px-3 py-1.5 rounded-full font-semibold"
              style={{ background: "linear-gradient(135deg, #059669, #10b981)", backdropFilter: "blur(8px)" }}>
              <BadgeCheck size={12} /> Verified Host
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="font-display font-black text-4xl leading-tight" style={{ color: "var(--ink)" }}>{listing.title}</h1>
                {!isSale && (
                  <div className="flex items-center gap-1.5 shrink-0 mt-1 px-3 py-1.5 rounded-xl"
                    style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}>
                    <Star size={14} fill="#fbbf24" className="text-amber-400" />
                    <span className="font-bold text-sm" style={{ color: "var(--ink)" }}>4.8</span>
                  </div>
                )}
              </div>
              <p className="flex items-center gap-1.5 text-sm mt-2" style={{ color: "var(--muted)" }}>
                <MapPin size={13} style={{ color: "var(--sky)" }} /> {listing.location} · {listing.propertyType}
              </p>
              {(listing.bedrooms || listing.bathrooms) && (
                <div className="flex items-center gap-4 mt-3">
                  {listing.bedrooms && (
                    <span className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl"
                      style={{ background: "rgba(14,165,233,0.08)", color: "var(--sky-dd)", border: "1px solid rgba(14,165,233,0.15)" }}>
                      <BedDouble size={14} /> {listing.bedrooms} Bed{listing.bedrooms > 1 ? "s" : ""}
                    </span>
                  )}
                  {listing.bathrooms && (
                    <span className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl"
                      style={{ background: "rgba(14,165,233,0.08)", color: "var(--sky-dd)", border: "1px solid rgba(14,165,233,0.15)" }}>
                      <Bath size={14} /> {listing.bathrooms} Bath{listing.bathrooms > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid rgba(14,165,233,0.1)" }}>
              <h2 className="font-bold text-base mb-3" style={{ color: "var(--ink)" }}>About this property</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{listing.description}</p>
            </div>

            {listing.amenities?.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid rgba(14,165,233,0.1)" }}>
                <h2 className="font-bold text-base mb-4" style={{ color: "var(--ink)" }}>Amenities & Features</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {listing.amenities.map(a => (
                    <div key={a} className="flex items-center gap-2 text-sm rounded-xl px-3 py-2.5"
                      style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.12)", color: "var(--ink)" }}>
                      <span style={{ color: "var(--sky)" }}>{AMENITY_ICONS[a] || "✓"}</span> {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── INQUIRY FORM for sale listings ── */}
            {isSale && (
              <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid rgba(14,165,233,0.1)" }}>
                <h2 className="font-bold text-base mb-1 flex items-center gap-2" style={{ color: "var(--ink)" }}>
                  <MessageSquare size={16} style={{ color: "var(--sky)" }} /> Send an Enquiry
                </h2>
                <p className="text-xs mb-5" style={{ color: "var(--muted)" }}>Interested? Send the owner a message and they'll get back to you.</p>

                {inquirySent ? (
                  <div className="text-center py-8">
                    <CheckCircle2 size={40} className="mx-auto mb-3" style={{ color: "#059669" }} />
                    <p className="font-bold" style={{ color: "var(--ink)" }}>Enquiry Sent!</p>
                    <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>The property owner will contact you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleInquiry} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--muted)" }}>Your Name *</label>
                        <input type="text" required value={inquiryName} onChange={e => setInquiryName(e.target.value)}
                          placeholder="Kwame Mensah" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition" style={iStyle}
                          onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--muted)" }}>Phone Number</label>
                        <input type="tel" value={inquiryPhone} onChange={e => setInquiryPhone(e.target.value)}
                          placeholder="+233 24 000 0000" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition" style={iStyle}
                          onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--muted)" }}>Email *</label>
                      <input type="email" required value={inquiryEmail} onChange={e => setInquiryEmail(e.target.value)}
                        placeholder="you@example.com" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition" style={iStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--muted)" }}>Message *</label>
                      <textarea required value={inquiryMsg} onChange={e => setInquiryMsg(e.target.value)}
                        placeholder="I'm interested in this property. Could you provide more information about..."
                        rows={3} className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition resize-none" style={iStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
                    </div>
                    <button type="submit" disabled={inquirySubmitting}
                      className="w-full font-bold py-3 rounded-xl text-white text-sm flex items-center justify-center gap-2 transition-all btn-pulse"
                      style={{ background: "linear-gradient(135deg, var(--sky), var(--sky-dd))", boxShadow: "0 4px 16px rgba(14,165,233,0.3)", opacity: inquirySubmitting ? 0.7 : 1 }}>
                      <Send size={14} /> {inquirySubmitting ? "Sending…" : "Send Enquiry"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right: Price Widget */}
          <div>
            <div className="sticky top-20 space-y-4">
              {/* Price card */}
              <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid rgba(14,165,233,0.15)", boxShadow: "0 12px 40px rgba(14,165,233,0.12)" }}>
                <div className="mb-5 pb-5" style={{ borderBottom: "1px solid rgba(14,165,233,0.1)" }}>
                  <span className="font-display font-black text-3xl" style={{ color: "var(--ink)" }}>
                    GHS {price?.toLocaleString() || "—"}
                  </span>
                  {!isSale && <span className="text-sm ml-1" style={{ color: "var(--muted)" }}>/night</span>}
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                    ≈ ${usd} USD{isSale ? "" : " per night"}
                  </p>
                  {isSale && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(251,191,36,0.15)", color: "#92400e", border: "1px solid rgba(251,191,36,0.3)" }}>
                      <Tag size={10}/> For Sale
                    </span>
                  )}
                </div>

                {isSale ? (
                  <div className="space-y-3">
                    {listing.contactPhone && (
                      <a href={`tel:${listing.contactPhone}`}
                        className="flex items-center gap-2 w-full font-bold py-3 rounded-xl text-white text-sm justify-center transition-all btn-pulse"
                        style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 4px 16px rgba(16,185,129,0.35)" }}>
                        <Phone size={14} /> Call Owner
                      </a>
                    )}
                    {listing.contactEmail && (
                      <a href={`mailto:${listing.contactEmail}?subject=Enquiry: ${listing.title}`}
                        className="flex items-center gap-2 w-full font-bold py-3 rounded-xl text-sm justify-center transition-all"
                        style={{ border: "1.5px solid rgba(14,165,233,0.3)", color: "var(--sky-d)", background: "white" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(14,165,233,0.05)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "white")}>
                        <Mail size={14} /> Email Owner
                      </a>
                    )}
                    <p className="text-xs text-center" style={{ color: "var(--muted)" }}>Or use the enquiry form below ↓</p>
                  </div>
                ) : user ? (
                  user.role === "guest" ? (
                    <Link href={`/listings/${listing.id}/book`}
                      className="block w-full text-center font-bold py-3.5 rounded-xl transition-all duration-200 text-sm btn-pulse"
                      style={{ background: "var(--yellow)", color: "var(--ink)", boxShadow: "0 4px 16px rgba(251,191,36,0.4)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--yellow-d)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "var(--yellow)")}>
                      Book Now →
                    </Link>
                  ) : (
                    <p className="text-xs text-center rounded-xl p-3" style={{ background: "rgba(14,165,233,0.05)", color: "var(--muted)" }}>
                      Hosts cannot book listings.
                    </p>
                  )
                ) : (
                  <div className="space-y-2.5">
                    <Link href="/login"
                      className="block w-full text-center font-bold py-3.5 rounded-xl transition-all duration-200 text-sm text-white btn-pulse"
                      style={{ background: "linear-gradient(135deg, var(--sky), var(--sky-dd))", boxShadow: "0 4px 16px rgba(14,165,233,0.35)" }}>
                      Sign In to Book
                    </Link>
                    <Link href="/signup" className="block text-center text-sm" style={{ color: "var(--muted)" }}>Create an account</Link>
                  </div>
                )}

                <div className="flex items-center justify-center gap-1.5 mt-4 text-xs" style={{ color: "var(--muted)" }}>
                  <ShieldCheck size={12} style={{ color: "var(--sky)" }} />
                  {isSale ? "Verified listing · No agent fees" : "No charge yet · Free cancellation"}
                </div>
              </div>

              {/* Host contact card (for sale listings) */}
              {isSale && listing.hostName && (
                <div className="rounded-2xl p-5" style={{ background: "white", border: "1px solid rgba(14,165,233,0.1)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted)" }}>Listed By</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white"
                      style={{ background: "linear-gradient(135deg, var(--sky), var(--sky-dd))" }}>
                      {listing.hostName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--ink)" }}>{listing.hostName}</p>
                      {listing.isVerified && <p className="text-xs" style={{ color: "#059669" }}>✓ Verified Owner</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
