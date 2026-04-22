"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { getListingById, updateListing } from "@/lib/listings";
import { Listing, GHANA_LOCATIONS, PROPERTY_TYPES, AMENITIES_LIST } from "@/lib/types";
import toast from "react-hot-toast";
import { Upload, X, ChevronLeft } from "lucide-react";
import Link from "next/link";

const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none transition";
const inputStyle = { border: "1.5px solid rgba(14,165,233,0.2)", background: "#f8faff" };

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "host")) { router.push("/"); return; }
    if (id) {
      getListingById(id).then(l => {
        if (!l || l.hostId !== user?.uid) { toast.error("Not authorized."); router.push("/dashboard"); return; }
        setListing(l); setTitle(l.title); setDescription(l.description); setLocation(l.location);
        setPropertyType(l.propertyType); setPricePerNight(String(l.pricePerNight));
        setAmenities(l.amenities || []); setExistingImages(l.images || []);
        setPageLoading(false);
      });
    }
  }, [id, user, loading, router]);

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (existingImages.length + newImageFiles.length + files.length > 6) { toast.error("Max 6 images total."); return; }
    setNewImageFiles(p => [...p, ...files]);
    files.forEach(f => { const r = new FileReader(); r.onload = ev => setNewPreviews(p => [...p, ev.target?.result as string]); r.readAsDataURL(f); });
  };
  const removeExisting = (i: number) => setExistingImages(p => p.filter((_, idx) => idx !== i));
  const removeNew = (i: number) => { setNewImageFiles(p => p.filter((_, idx) => idx !== i)); setNewPreviews(p => p.filter((_, idx) => idx !== i)); };
  const toggleAmenity = (a: string) => setAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listing) return;
    setSubmitting(true);
    try {
      await updateListing(listing.id, { title, description, location, propertyType, pricePerNight: Number(pricePerNight), amenities, images: existingImages }, newImageFiles);
      toast.success("Listing updated!"); router.push("/dashboard");
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Update failed."); }
    finally { setSubmitting(false); }
  };

  const card = { background: "white", border: "1px solid rgba(14,165,233,0.12)", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 16px rgba(14,165,233,0.06)" };

  if (pageLoading) return <div className="min-h-screen flex items-center justify-center mesh-bg"><div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: "rgba(14,165,233,0.2)", borderTopColor: "var(--sky)" }} /></div>;

  return (
    <div className="min-h-screen mesh-bg pb-16">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-medium mb-6 transition-colors duration-200" style={{ color: "var(--muted)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--sky)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
          <ChevronLeft size={15} /> Back to dashboard
        </Link>
        <h1 className="font-display font-black text-4xl mb-1" style={{ color: "var(--ink)" }}>Edit Listing</h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>Update your property details.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div style={card}>
            <h2 className="font-bold text-base mb-5" style={{ color: "var(--ink)" }}>Basic Information</h2>
            <div className="space-y-4">
              {[
                { label: "Title", val: title, set: setTitle, type: "input" },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>{f.label}</label>
                  <input type="text" required value={f.val} onChange={e => f.set(e.target.value)} className={inputCls} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>Description</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} className={inputCls + " resize-none"} style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Location", val: location, set: setLocation, opts: GHANA_LOCATIONS },
                  { label: "Type", val: propertyType, set: setPropertyType, opts: PROPERTY_TYPES },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>{f.label}</label>
                    <select value={f.val} onChange={e => f.set(e.target.value)} className={inputCls} style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")}>
                      {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>Price Per Night (GHS)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: "var(--muted)" }}>GHS</span>
                  <input type="number" min="1" value={pricePerNight} onChange={e => setPricePerNight(e.target.value)} className={inputCls} style={{ ...inputStyle, paddingLeft: "56px" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
                </div>
              </div>
            </div>
          </div>

          <div style={card}>
            <h2 className="font-bold text-base mb-4" style={{ color: "var(--ink)" }}>Amenities</h2>
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

          <div style={card}>
            <h2 className="font-bold text-base mb-4" style={{ color: "var(--ink)" }}>Photos</h2>
            {existingImages.length + newPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {existingImages.map((src, i) => (
                  <div key={`ex-${i}`} className="relative rounded-xl overflow-hidden h-24 group" style={{ background: "#e0f2fe" }}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExisting(i)} className="absolute top-1 right-1 rounded-full p-1 opacity-0 group-hover:opacity-100 transition" style={{ background: "rgba(255,255,255,0.9)" }}><X size={10} /></button>
                  </div>
                ))}
                {newPreviews.map((p, i) => (
                  <div key={`new-${i}`} className="relative rounded-xl overflow-hidden h-24 group" style={{ background: "#e0f2fe" }}>
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 text-white text-[10px] px-2 py-0.5 rounded font-semibold" style={{ background: "rgba(14,165,233,0.85)" }}>New</span>
                    <button type="button" onClick={() => removeNew(i)} className="absolute top-1 right-1 rounded-full p-1 opacity-0 group-hover:opacity-100 transition" style={{ background: "rgba(255,255,255,0.9)" }}><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}
            {existingImages.length + newImageFiles.length < 6 && (
              <label className="flex flex-col items-center justify-center rounded-xl py-6 cursor-pointer transition-all duration-200"
                style={{ border: "2px dashed rgba(14,165,233,0.25)", background: "rgba(14,165,233,0.02)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--sky)"; e.currentTarget.style.background = "rgba(14,165,233,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(14,165,233,0.25)"; e.currentTarget.style.background = "rgba(14,165,233,0.02)"; }}>
                <Upload size={18} className="mb-1" style={{ color: "var(--muted)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>Add more photos</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleNewImages} />
              </label>
            )}
          </div>

          <button type="submit" disabled={submitting}
            className="w-full text-white font-black py-4 rounded-2xl transition-all duration-200 text-base btn-pulse"
            style={{ background: "linear-gradient(135deg, var(--sky), var(--sky-dd))", boxShadow: submitting ? "none" : "0 6px 24px rgba(14,165,233,0.4)", opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
