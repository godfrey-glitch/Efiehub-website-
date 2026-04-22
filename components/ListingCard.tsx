import Link from "next/link";
import { Listing, GHS_TO_USD } from "@/lib/types";
import { MapPin, Star, BadgeCheck, Tag, BedDouble, Bath } from "lucide-react";

interface Props { listing: Listing; }

export default function ListingCard({ listing }: Props) {
  const isSale = listing.listingType === "sale";
  const price = isSale ? listing.salePrice : listing.pricePerNight;
  const usd = price ? (price * GHS_TO_USD).toFixed(0) : "0";
  const img = listing.images?.[0] || "/placeholder.jpg";

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="card-hover rounded-2xl overflow-hidden border"
        style={{ background: "white", borderColor: "rgba(14,165,233,0.12)", boxShadow: "0 2px 16px rgba(14,165,233,0.07)" }}>

        {/* Image */}
        <div className="relative h-52 overflow-hidden" style={{ background: "#e0f2fe" }}>
          <img src={img} alt={listing.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(to top, rgba(12,26,46,0.5) 0%, transparent 60%)" }} />

          {/* Sale / Rental badge */}
          <span className="absolute top-3 left-3 flex items-center gap-1 text-white text-xs px-2.5 py-1 rounded-full font-bold"
            style={{ background: isSale ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#0ea5e9,#0284c7)" }}>
            {isSale ? <><Tag size={9}/> For Sale</> : "For Rent"}
          </span>

          {listing.isVerified && (
            <span className="absolute top-3 right-3 flex items-center gap-1 text-white text-xs px-2 py-1 rounded-full font-semibold"
              style={{ background: "rgba(16,185,129,0.9)", backdropFilter: "blur(8px)" }}>
              <BadgeCheck size={10} /> Verified
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-sm leading-snug line-clamp-1 transition-colors duration-200 group-hover:text-sky-600" style={{ color: "var(--ink)" }}>
              {listing.title}
            </h3>
            {!isSale && (
              <div className="flex items-center gap-1 shrink-0">
                <Star size={12} fill="#fbbf24" className="text-amber-400" />
                <span className="text-xs font-semibold" style={{ color: "var(--ink)" }}>4.8</span>
              </div>
            )}
          </div>

          <p className="flex items-center gap-1 text-xs mb-2" style={{ color: "var(--muted)" }}>
            <MapPin size={10} style={{ color: "var(--sky)" }} /> {listing.location} · {listing.propertyType}
          </p>

          {(listing.bedrooms || listing.bathrooms) && (
            <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: "var(--muted)" }}>
              {listing.bedrooms && <span className="flex items-center gap-1"><BedDouble size={11}/> {listing.bedrooms} bed</span>}
              {listing.bathrooms && <span className="flex items-center gap-1"><Bath size={11}/> {listing.bathrooms} bath</span>}
            </div>
          )}

          <div className="flex items-end justify-between">
            <div>
              <span className="font-bold text-base" style={{ color: "var(--ink)" }}>
                GHS {price?.toLocaleString() || "—"}
              </span>
              {!isSale && <span className="text-xs ml-1" style={{ color: "var(--muted)" }}>/night</span>}
              <p className="text-xs" style={{ color: "var(--muted)" }}>≈ ${usd} USD{isSale ? "" : "/night"}</p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl"
              style={{ background: isSale ? "rgba(251,191,36,0.15)" : "var(--yellow)", color: isSale ? "#92400e" : "var(--ink)", border: isSale ? "1px solid rgba(251,191,36,0.4)" : "none" }}>
              {isSale ? "Enquire" : "Book Now"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
