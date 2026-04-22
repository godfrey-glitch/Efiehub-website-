"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getListingsByHost, deleteListing } from "@/lib/listings";
import { getBookingsForHostListings } from "@/lib/bookings";
import { getInquiriesForHost, markInquiryRead } from "@/lib/inquiries";
import { Listing, Booking, Inquiry } from "@/lib/types";
import Link from "next/link";
import toast from "react-hot-toast";
import { PlusCircle, Edit2, Trash2, MapPin, CalendarDays, BadgeCheck, Eye, TrendingUp, MessageSquare, Tag, BedDouble } from "lucide-react";
import { format } from "date-fns";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "bookings" | "inquiries">("listings");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "host")) { toast.error("Host access only."); router.push("/"); return; }
    if (user && user.role === "host") {
      Promise.all([
        getListingsByHost(user.uid),
        getInquiriesForHost(user.uid),
      ]).then(async ([ls, inqs]) => {
        setListings(ls);
        setInquiries(inqs);
        if (ls.length > 0) setBookings(await getBookingsForHostListings(ls.map(l => l.id)));
        setPageLoading(false);
      });
    }
  }, [user, loading, router]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try { await deleteListing(id); setListings(p => p.filter(l => l.id !== id)); toast.success("Listing deleted."); }
    catch { toast.error("Failed to delete listing."); }
    finally { setDeletingId(null); }
  };

  const handleReadInquiry = async (inq: Inquiry) => {
    if (inq.status === "new") {
      await markInquiryRead(inq.id);
      setInquiries(p => p.map(i => i.id === inq.id ? { ...i, status: "read" } : i));
    }
  };

  const statusBadge = (status: Booking["status"]) => {
    const map: Record<string, React.CSSProperties> = {
      confirmed: { background: "rgba(16,185,129,0.1)", color: "#059669", border: "1px solid rgba(16,185,129,0.2)" },
      pending: { background: "rgba(251,191,36,0.1)", color: "#b45309", border: "1px solid rgba(251,191,36,0.3)" },
      cancelled: { background: "rgba(239,68,68,0.08)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)" },
    };
    return <span className="text-xs px-2.5 py-1 rounded-full font-semibold capitalize" style={map[status]}>{status}</span>;
  };

  if (pageLoading) return (
    <div className="min-h-screen flex items-center justify-center mesh-bg">
      <div className="w-12 h-12 rounded-full border-4 animate-spin" style={{ borderColor: "rgba(14,165,233,0.2)", borderTopColor: "var(--sky)" }} />
    </div>
  );

  const totalRevenue = bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + b.totalPrice, 0);
  const activeBookings = bookings.filter(b => b.status !== "cancelled").length;
  const newInquiries = inquiries.filter(i => i.status === "new").length;
  const rentalListings = listings.filter(l => l.listingType === "rental").length;
  const saleListings = listings.filter(l => l.listingType === "sale").length;

  const TABS = [
    { key: "listings" as const, label: "Listings", count: listings.length },
    { key: "bookings" as const, label: "Bookings", count: bookings.length },
    { key: "inquiries" as const, label: "Enquiries", count: inquiries.length, badge: newInquiries },
  ];

  return (
    <div className="min-h-screen mesh-bg">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--sky)" }}>Host Dashboard</p>
            <h1 className="font-display font-black text-4xl" style={{ color: "var(--ink)" }}>
              Welcome, {user?.name?.split(" ")[0]} 👋
            </h1>
          </div>
          <Link href="/listings/create"
            className="inline-flex items-center gap-2 font-bold px-5 py-3 rounded-xl transition-all duration-200 text-sm btn-pulse"
            style={{ background: "linear-gradient(135deg, var(--sky), var(--sky-dd))", color: "white", boxShadow: "0 4px 20px rgba(14,165,233,0.35)" }}>
            <PlusCircle size={15} /> New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Listings", value: listings.length, sub: `${rentalListings} rental · ${saleListings} sale`, color: "var(--sky)" },
            { label: "Active Bookings", value: activeBookings, sub: `${bookings.filter(b=>b.status==="pending").length} pending`, color: "#10b981" },
            { label: "New Enquiries", value: newInquiries, sub: `${inquiries.length} total`, color: "#f59e0b" },
            { label: "Total Revenue", value: `GHS ${totalRevenue.toLocaleString()}`, sub: "from confirmed bookings", color: "#059669", wide: true },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl p-5 ${s.wide ? "col-span-2 md:col-span-1" : ""}`}
              style={{ background: "white", border: "1px solid rgba(14,165,233,0.12)", boxShadow: "0 2px 16px rgba(14,165,233,0.07)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--muted)" }}>{s.label}</p>
              <p className="font-display font-black text-2xl mb-0.5" style={{ color: s.wide ? "#059669" : "var(--ink)" }}>{s.value}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: "rgba(14,165,233,0.08)" }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2"
              style={activeTab === tab.key
                ? { background: "white", color: "var(--ink)", boxShadow: "0 2px 8px rgba(14,165,233,0.15)" }
                : { color: "var(--muted)" }}>
              {tab.label}
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: activeTab === tab.key ? "rgba(14,165,233,0.1)" : "rgba(14,165,233,0.08)", color: "var(--sky-d)" }}>
                {tab.count}
              </span>
              {tab.badge != null && tab.badge > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-black text-white"
                  style={{ background: "#ef4444" }}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* LISTINGS TAB */}
        {activeTab === "listings" && (
          <div className="space-y-4">
            {listings.length === 0 ? (
              <div className="text-center py-20 rounded-2xl" style={{ background: "white", border: "1px solid rgba(14,165,233,0.1)" }}>
                <p className="text-5xl mb-4">🏠</p>
                <p className="font-bold text-lg mb-1" style={{ color: "var(--ink)" }}>No listings yet</p>
                <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Create your first rental or sale listing</p>
                <Link href="/listings/create"
                  className="inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl text-sm text-white"
                  style={{ background: "linear-gradient(135deg, var(--sky), var(--sky-dd))" }}>
                  <PlusCircle size={15} /> Create Listing
                </Link>
              </div>
            ) : listings.map(l => {
              const isSale = l.listingType === "sale";
              const lBks = bookings.filter(b => b.listingId === l.id && b.status !== "cancelled");
              const lInqs = inquiries.filter(i => i.listingId === l.id);
              return (
                <div key={l.id} className="rounded-2xl p-4 flex gap-4 transition-all duration-200"
                  style={{ background: "white", border: "1px solid rgba(14,165,233,0.1)", boxShadow: "0 2px 12px rgba(14,165,233,0.05)" }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 8px 30px rgba(14,165,233,0.12)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(14,165,233,0.05)")}>
                  <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0 relative" style={{ background: "#e0f2fe" }}>
                    {l.images?.[0] ? <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🏘️</div>}
                    <span className="absolute top-1 left-1 text-white text-[9px] px-1.5 py-0.5 rounded font-bold"
                      style={{ background: isSale ? "#f59e0b" : "var(--sky-d)" }}>
                      {isSale ? "SALE" : "RENT"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm truncate" style={{ color: "var(--ink)" }}>{l.title}</h3>
                      {l.isVerified && <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#059669" }}><BadgeCheck size={12} /> Verified</span>}
                    </div>
                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "var(--muted)" }}><MapPin size={10} /> {l.location} · {l.propertyType}</p>
                    {(l.bedrooms || l.bathrooms) && (
                      <p className="text-xs flex items-center gap-2 mt-0.5" style={{ color: "var(--muted)" }}>
                        {l.bedrooms && <span className="flex items-center gap-1"><BedDouble size={10}/>{l.bedrooms}bd</span>}
                        {l.bathrooms && <span>{l.bathrooms}ba</span>}
                      </p>
                    )}
                    <p className="text-sm font-bold mt-1" style={{ color: "var(--ink)" }}>
                      GHS {(isSale ? l.salePrice : l.pricePerNight)?.toLocaleString()}
                      {!isSale && <span className="font-normal text-xs" style={{ color: "var(--muted)" }}> /night</span>}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                      {isSale ? `${lInqs.length} enquir${lInqs.length !== 1 ? "ies" : "y"}` : `${lBks.length} active booking${lBks.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {[
                      { href: `/listings/${l.id}`, icon: <Eye size={13} />, hc: "var(--sky)" },
                      { href: `/listings/${l.id}/edit`, icon: <Edit2 size={13} />, hc: "#059669" },
                    ].map((b, i) => (
                      <Link key={i} href={b.href} className="p-2 rounded-lg transition-all duration-200 flex items-center justify-center"
                        style={{ border: "1px solid rgba(14,165,233,0.15)", color: "var(--muted)" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = b.hc; e.currentTarget.style.color = b.hc; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(14,165,233,0.15)"; e.currentTarget.style.color = "var(--muted)"; }}>
                        {b.icon}
                      </Link>
                    ))}
                    <button onClick={() => handleDelete(l.id, l.title)} disabled={deletingId === l.id}
                      className="p-2 rounded-lg transition-all duration-200 flex items-center justify-center"
                      style={{ border: "1px solid rgba(14,165,233,0.15)", color: "var(--muted)" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(14,165,233,0.15)"; e.currentTarget.style.color = "var(--muted)"; }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <div>
            {bookings.length === 0 ? (
              <div className="text-center py-20 rounded-2xl" style={{ background: "white", border: "1px solid rgba(14,165,233,0.1)" }}>
                <p className="text-5xl mb-4">📅</p>
                <p className="font-bold" style={{ color: "var(--ink)" }}>No bookings yet</p>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Bookings from your rental listings will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => {
                  const lst = listings.find(l => l.id === b.listingId);
                  return (
                    <div key={b.id} className="rounded-2xl p-5" style={{ background: "white", border: "1px solid rgba(14,165,233,0.1)" }}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-bold text-sm" style={{ color: "var(--ink)" }}>{lst?.title || b.listingId}</p>
                            {statusBadge(b.status)}
                            {b.paymentMethod && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                                style={{ background: "rgba(14,165,233,0.08)", color: "var(--sky-d)" }}>
                                {b.paymentMethod.replace("_"," ")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Guest: {b.guestName || b.guestId}</p>
                          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                            <CalendarDays size={11} />
                            <span>{format(b.checkIn, "MMM d")} → {format(b.checkOut, "MMM d, yyyy")}</span>
                            <span>· {b.nights} night{b.nights !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-lg" style={{ color: "#059669" }}>GHS {b.totalPrice.toLocaleString()}</p>
                          <p className="text-xs" style={{ color: "var(--muted)" }}>{b.nights} × GHS {lst?.pricePerNight?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* INQUIRIES TAB */}
        {activeTab === "inquiries" && (
          <div>
            {inquiries.length === 0 ? (
              <div className="text-center py-20 rounded-2xl" style={{ background: "white", border: "1px solid rgba(14,165,233,0.1)" }}>
                <p className="text-5xl mb-4">💬</p>
                <p className="font-bold" style={{ color: "var(--ink)" }}>No enquiries yet</p>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Buyer enquiries from your sale listings will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map(inq => (
                  <div key={inq.id} className="rounded-2xl p-5 transition-all duration-200 cursor-pointer"
                    style={{ background: inq.status === "new" ? "rgba(14,165,233,0.04)" : "white", border: `1px solid ${inq.status === "new" ? "rgba(14,165,233,0.3)" : "rgba(14,165,233,0.1)"}` }}
                    onClick={() => handleReadInquiry(inq)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-bold text-sm" style={{ color: "var(--ink)" }}>{inq.senderName}</span>
                          {inq.status === "new" && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "var(--sky)" }}>New</span>
                          )}
                        </div>
                        <p className="text-xs mb-1 flex items-center gap-2" style={{ color: "var(--muted)" }}>
                          <Tag size={10} style={{ color: "var(--sky)" }} />
                          {inq.listingTitle}
                        </p>
                        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--ink)" }}>{inq.message}</p>
                        <div className="flex gap-4 text-xs" style={{ color: "var(--muted)" }}>
                          <a href={`mailto:${inq.senderEmail}`} className="flex items-center gap-1 hover:underline" style={{ color: "var(--sky-d)" }} onClick={e => e.stopPropagation()}>
                            ✉ {inq.senderEmail}
                          </a>
                          {inq.senderPhone && (
                            <a href={`tel:${inq.senderPhone}`} className="flex items-center gap-1 hover:underline" style={{ color: "var(--sky-d)" }} onClick={e => e.stopPropagation()}>
                              📞 {inq.senderPhone}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs" style={{ color: "var(--muted)" }}>{format(inq.createdAt, "MMM d, yyyy")}</p>
                        <a href={`mailto:${inq.senderEmail}?subject=Re: ${inq.listingTitle}`}
                          className="inline-flex items-center gap-1 mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition btn-pulse"
                          style={{ background: "var(--sky-d)" }} onClick={e => e.stopPropagation()}>
                          <MessageSquare size={11} /> Reply
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
