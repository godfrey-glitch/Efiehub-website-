"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { createListing } from "@/lib/listings";
import { GHANA_LOCATIONS, PROPERTY_TYPES, AMENITIES_LIST, ListingType } from "@/lib/types";
import toast from "react-hot-toast";
import { Upload, X, ChevronLeft, Home, Tag, BedDouble, Bath, Phone, Mail, ImagePlus, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const iStyle = { border: "1.5px solid rgba(14,165,233,0.2)", background: "#f8faff" };
const card = { background: "white", border: "1px solid rgba(14,165,233,0.12)", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 16px rgba(14,165,233,0.06)" };

export default function CreateListingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [listingType, setListingType] = useState<ListingType>("rental");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "host")) {
      toast.error("Only hosts can create listings."); router.push("/");
    }
  }, [user, loading, router]);

  const addFiles = (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith("image/"));
    if (imageFiles.length + valid.length > 10) { toast.error("Max 10 images."); return; }
    setImageFiles(p => [...p, ...valid]);
    valid.forEach(f => {
      const r = new FileReader();
      r.onload = ev => setPreviews(p => [...p, ev.target?.result as string]);
      r.readAsDataURL(f);
    });
  };

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => addFiles(Array.from(e.target.files || []));
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); addFiles(Array.from(e.dataTransfer.files)); };
  const removeImage = (i: number) => { setImageFiles(p => p.filter((_, idx) => idx !== i)); setPreviews(p => p.filter((_, idx) => idx !== i)); };
  const moveFirst = (i: number) => {
    setImageFiles(p => { const a = [...p]; a.unshift(a.splice(i,1)[0]); return a; });
    setPreviews(p => { const a = [...p]; a.unshift(a.splice(i,1)[0]); return a; });
  };
  const toggleAmenity = (a: string) => setAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location || !propertyType) { toast.error("Please fill in all required fields."); return; }
    if (listingType === "rental" && (!pricePerNight || Number(pricePerNight) <= 0)) { toast.error("Please enter a valid rental price."); return; }
    if (listingType === "sale" && (!salePrice || Number(salePrice) <= 0)) { toast.error("Please enter a valid sale price."); return; }
    if (imageFiles.length === 0) { toast.error("Please upload at least one photo."); return; }
    if (!user) return;
    setSubmitting(true);
    try {
      const id = await createListing({
        hostId: user.uid, hostName: user.name,
        title, description, location, propertyType,
        listingType,
        pricePerNight: listingType === "rental" ? Number(pricePerNight) : undefined,
        salePrice: listingType === "sale" ? Number(salePrice) : undefined,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        amenities, images: [], isVerified: false,
        contactPhone: contactPhone || undefined,
        contactEmail: contactEmail || user.email,
      }, imageFiles);
      toast.success("Listing published!");
      router.push(`/listings/${id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create listing.");
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center mesh-bg">
      <div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: "rgba(14,165,233,0.2)", borderTopColor: "var(--sky)" }} />
    </div>
  );

  const steps = ["Listing Type", "Details", "Photos", "Pricing & Contact"];

  return (
    <div className="min-h-screen mesh-bg pb-20">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-medium mb-6 transition-colors duration-200"
          style={{ color: "var(--muted)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--sky)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
          <ChevronLeft size={15} /> Back to dashboard
        </Link>

        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--sky)" }}>Property Owner Tools</p>
        <h1 className="font-display font-black text-4xl mb-1" style={{ color: "var(--ink)" }}>List Your Property</h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>Sell or rent — upload photos and go live in minutes.</p>

        {/* Step labels */}
        <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap px-2 py-1 rounded-full"
                style={{ background: "rgba(14,165,233,0.1)", color: "var(--sky-d)" }}>
                <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black"
                  style={{ background: "var(--sky-d)", color: "white" }}>{i + 1}</span>
                {s}
              </div>
              {i < steps.length - 1 && <div className="w-4 h-px mx-1 flex-shrink-0" style={{ background: "rgba(14,165,233,0.2)" }} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── STEP 1: LISTING TYPE ── */}
          <div style={card}>
            <h2 className="font-bold text-base mb-5 flex items-center gap-2" style={{ color: "var(--ink)" }}>
              <span className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-black text-white" style={{ background: "var(--sky-d)" }}>1</span>
              What are you doing with this property?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {([
                { type: "rental" as ListingType, icon: <Home size={22} />, title: "For Rent", sub: "Short or long term stays", color: "var(--sky)" },
                { type: "sale" as ListingType, icon: <Tag size={22} />, title: "For Sale", sub: "Sell to interested buyers", color: "#f59e0b" },
              ]).map(opt => (
                <button key={opt.type} type="button" onClick={() => setListingType(opt.type)}
                  className="p-5 rounded-2xl text-left transition-all duration-200"
                  style={listingType === opt.type
                    ? { border: `2px solid ${opt.color}`, background: opt.type === "rental" ? "rgba(14,165,233,0.06)" : "rgba(251,191,36,0.08)", boxShadow: `0 4px 16px ${opt.color}30` }
                    : { border: "2px solid rgba(14,165,233,0.15)", background: "#f8faff" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: listingType === opt.type ? `${opt.color}20` : "rgba(14,165,233,0.07)", color: listingType === opt.type ? opt.color : "var(--muted)" }}>
                    {opt.icon}
                  </div>
                  <p className="font-bold text-sm mb-0.5" style={{ color: listingType === opt.type ? "var(--ink)" : "var(--muted)" }}>{opt.title}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{opt.sub}</p>
                  {listingType === opt.type && <CheckCircle2 size={16} className="mt-2" style={{ color: opt.color }} />}
                </button>
              ))}
            </div>
          </div>

          {/* ── STEP 2: PROPERTY DETAILS ── */}
          <div style={card}>
            <h2 className="font-bold text-base mb-5 flex items-center gap-2" style={{ color: "var(--ink)" }}>
              <span className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-black text-white" style={{ background: "var(--sky-d)" }}>2</span>
              Property Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>Property Title *</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                  placeholder={listingType === "sale" ? "e.g. Spacious 4-Bedroom House in East Legon" : "e.g. Luxurious 2-Bedroom Apartment in Osu"}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition" style={iStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>Description *</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your property — features, neighbourhood, what makes it special..."
                  rows={4} className="w-full rounded-xl px-4 py-3 text-sm outline-none transition resize-none" style={iStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>Location *</label>
                  <select required value={location} onChange={e => setLocation(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition" style={iStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")}>
                    <option value="">Select location</option>
                    {GHANA_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>Property Type *</label>
                  <select required value={propertyType} onChange={e => setPropertyType(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition" style={iStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")}>
                    <option value="">Select type</option>
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>
                    <BedDouble size={11} className="inline mr-1" />Bedrooms
                  </label>
                  <input type="number" min="0" max="20" value={bedrooms} onChange={e => setBedrooms(e.target.value)}
                    placeholder="e.g. 3" className="w-full rounded-xl px-4 py-3 text-sm outline-none transition" style={iStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>
                    <Bath size={11} className="inline mr-1" />Bathrooms
                  </label>
                  <input type="number" min="0" max="20" value={bathrooms} onChange={e => setBathrooms(e.target.value)}
                    placeholder="e.g. 2" className="w-full rounded-xl px-4 py-3 text-sm outline-none transition" style={iStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
                </div>
              </div>
            </div>
          </div>

          {/* ── AMENITIES ── */}
          <div style={card}>
            <h2 className="font-bold text-base mb-4" style={{ color: "var(--ink)" }}>Amenities & Features</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES_LIST.map(a => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className="text-xs px-3 py-2.5 rounded-xl text-left font-semibold transition-all duration-200"
                  style={amenities.includes(a)
                    ? { background: "rgba(14,165,233,0.1)", border: "1.5px solid var(--sky)", color: "var(--sky-dd)" }
                    : { background: "#f8faff", border: "1.5px solid rgba(14,165,233,0.15)", color: "var(--muted)" }}>
                  {amenities.includes(a) ? "✓ " : ""}{a}
                </button>
              ))}
            </div>
          </div>

          {/* ── STEP 3: PHOTOS ── */}
          <div style={card}>
            <h2 className="font-bold text-base mb-1 flex items-center gap-2" style={{ color: "var(--ink)" }}>
              <span className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-black text-white" style={{ background: "var(--sky-d)" }}>3</span>
              Property Photos *
            </h2>
            <p className="text-xs mb-4 ml-8" style={{ color: "var(--muted)" }}>Upload up to 10 photos. Drag to reorder — first photo is the cover. Click any photo to set as cover.</p>

            {/* Previews grid */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {previews.map((p, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden group cursor-pointer" style={{ paddingBottom: "75%", background: "#e0f2fe" }}
                    onClick={() => moveFirst(i)}>
                    <img src={p} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-white text-[10px] px-2 py-0.5 rounded font-bold"
                        style={{ background: "var(--sky-d)" }}>Cover</span>
                    )}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                      style={{ background: "rgba(12,26,46,0.4)" }}>
                      <span className="text-white text-[10px] font-bold">{i === 0 ? "✓ Cover" : "Set Cover"}</span>
                    </div>
                    <button type="button" onClick={e => { e.stopPropagation(); removeImage(i); }}
                      className="absolute top-1 right-1 rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow"
                      style={{ background: "rgba(255,255,255,0.95)" }}>
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {imageFiles.length < 10 && (
                  <label className="rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group"
                    style={{ paddingBottom: "75%", position: "relative", border: "2px dashed rgba(14,165,233,0.25)", background: "rgba(14,165,233,0.02)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--sky)"; e.currentTarget.style.background = "rgba(14,165,233,0.06)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(14,165,233,0.25)"; e.currentTarget.style.background = "rgba(14,165,233,0.02)"; }}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <ImagePlus size={18} style={{ color: "var(--muted)" }} />
                      <span className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>Add more</span>
                    </div>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageInput} />
                  </label>
                )}
              </div>
            )}

            {/* Drop zone */}
            {previews.length === 0 && (
              <div
                className="rounded-2xl py-14 flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
                style={{ border: `2px dashed ${dragOver ? "var(--sky)" : "rgba(14,165,233,0.25)"}`, background: dragOver ? "rgba(14,165,233,0.06)" : "rgba(14,165,233,0.02)" }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("main-file-input")?.click()}
              >
                <Upload size={32} className="mb-3" style={{ color: dragOver ? "var(--sky)" : "var(--muted)" }} />
                <p className="font-semibold text-sm mb-1" style={{ color: dragOver ? "var(--sky-d)" : "var(--ink)" }}>
                  {dragOver ? "Drop photos here!" : "Drag & drop photos here"}
                </p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>or click to browse — JPG, PNG, WebP up to 10MB each</p>
                <div className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white btn-pulse"
                  style={{ background: "linear-gradient(135deg, var(--sky), var(--sky-dd))" }}>
                  Browse Photos
                </div>
              </div>
            )}
            <input type="file" id="main-file-input" accept="image/*" multiple className="hidden" onChange={handleImageInput} />

            {imageFiles.length > 0 && (
              <p className="text-xs mt-2 text-center" style={{ color: "var(--muted)" }}>
                {imageFiles.length}/10 photos uploaded · Click a photo to set it as the cover
              </p>
            )}
          </div>

          {/* ── STEP 4: PRICING & CONTACT ── */}
          <div style={card}>
            <h2 className="font-bold text-base mb-5 flex items-center gap-2" style={{ color: "var(--ink)" }}>
              <span className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-black text-white" style={{ background: "var(--sky-d)" }}>4</span>
              {listingType === "rental" ? "Pricing" : "Sale Price & Contact"}
            </h2>
            <div className="space-y-4">
              {listingType === "rental" ? (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>Price Per Night (GHS) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: "var(--muted)" }}>GHS</span>
                    <input type="number" required min="1" value={pricePerNight} onChange={e => setPricePerNight(e.target.value)}
                      placeholder="500" className="w-full rounded-xl py-3 text-sm outline-none transition" style={{ ...iStyle, paddingLeft: "56px", paddingRight: "16px" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
                  </div>
                  {pricePerNight && <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>≈ ${(Number(pricePerNight) * 0.063).toFixed(0)} USD per night</p>}
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>Sale Price (GHS) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: "var(--muted)" }}>GHS</span>
                    <input type="number" required min="1" value={salePrice} onChange={e => setSalePrice(e.target.value)}
                      placeholder="500,000" className="w-full rounded-xl py-3 text-sm outline-none transition" style={{ ...iStyle, paddingLeft: "56px", paddingRight: "16px" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
                  </div>
                  {salePrice && <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>≈ ${(Number(salePrice) * 0.063).toLocaleString()} USD</p>}
                </div>
              )}

              {/* Contact info — always show for sale, optional for rental */}
              <div className={listingType === "sale" ? "" : "opacity-70"}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted)" }}>
                  Contact Information {listingType === "sale" ? "(for buyer enquiries)" : "(optional)"}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>
                      <Phone size={10} className="inline mr-1" />Phone Number
                    </label>
                    <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                      placeholder="+233 24 000 0000" className="w-full rounded-xl px-4 py-3 text-sm outline-none transition" style={iStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>
                      <Mail size={10} className="inline mr-1" />Contact Email
                    </label>
                    <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                      placeholder={user?.email || "you@example.com"} className="w-full rounded-xl px-4 py-3 text-sm outline-none transition" style={iStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary preview */}
          {title && (
            <div className="rounded-2xl p-5" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--sky-d)" }}>Listing Preview</p>
              <div className="flex items-center gap-3">
                {previews[0] && <img src={previews[0]} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />}
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--ink)" }}>{title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{location || "—"} · {propertyType || "—"}</p>
                  <p className="text-xs font-semibold mt-1" style={{ color: listingType === "sale" ? "#f59e0b" : "var(--sky-d)" }}>
                    {listingType === "rental"
                      ? pricePerNight ? `GHS ${Number(pricePerNight).toLocaleString()}/night` : "Price not set"
                      : salePrice ? `GHS ${Number(salePrice).toLocaleString()} for sale` : "Price not set"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full text-white font-black py-4 rounded-2xl transition-all duration-200 text-base btn-pulse"
            style={{ background: "linear-gradient(135deg, var(--sky), var(--sky-dd))", boxShadow: submitting ? "none" : "0 6px 24px rgba(14,165,233,0.4)", opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Publishing your listing…" : `🏠 Publish ${listingType === "sale" ? "For Sale" : "Rental"} Listing`}
          </button>
        </form>
      </div>
    </div>
  );
}
