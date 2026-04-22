"use client";
import { useEffect, useRef, useState } from "react";
import { getAllListings } from "@/lib/listings";
import { Listing, GHANA_LOCATIONS, PROPERTY_TYPES } from "@/lib/types";
import ListingCard from "@/components/ListingCard";
import { Search, MapPin, SlidersHorizontal, ArrowRight, Star, Shield, Zap, Home, Tag } from "lucide-react";
import Link from "next/link";

/* ─── 3D HERO ─────────────────────────────────────────────────── */
function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let animId: number;
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => {
      
      const THREE = window.THREE;
      if (!THREE || !canvas) return;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.set(0, 2, 12);
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const sun = new THREE.DirectionalLight(0x7dd3fc, 1.5); sun.position.set(5,10,5); scene.add(sun);
      const yl = new THREE.PointLight(0xfbbf24, 2, 20); yl.position.set(-5,3,3); scene.add(yl);
      const hg = new THREE.Group(); scene.add(hg);
      hg.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(3,2,2.5), new THREE.MeshPhongMaterial({color:0xffffff,shininess:80,transparent:true,opacity:0.9})), {position:{x:0,y:1,z:0}}));
      const roof = new THREE.Mesh(new THREE.CylinderGeometry(0,2.2,1.4,4), new THREE.MeshPhongMaterial({color:0x0ea5e9,shininess:120}));
      roof.position.y=2.7; roof.rotation.y=Math.PI/4; hg.add(roof);
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.9,0.05), new THREE.MeshPhongMaterial({color:0xfbbf24,shininess:100}));
      door.position.set(0,0.55,1.28); hg.add(door);
      [-0.9,0.9].forEach(x => { const w=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.05),new THREE.MeshPhongMaterial({color:0xbae6fd,shininess:200,transparent:true,opacity:0.85})); w.position.set(x,1.2,1.28); hg.add(w); });
      hg.position.set(2,-1,0); hg.rotation.y=-0.3;
      const cubes: import("three").Mesh[] = [];
      const mats = [new THREE.MeshPhongMaterial({color:0x0ea5e9,transparent:true,opacity:0.6}),new THREE.MeshPhongMaterial({color:0xfbbf24,transparent:true,opacity:0.5}),new THREE.MeshPhongMaterial({color:0x0284c7,transparent:true,opacity:0.4})];
      [[-5,1,-2],[-3.5,3,-1],[-6,-1,-3],[5,2,-4],[4,-1,-2],[6,3,-5],[-2,4,-5],[3,4,-6],[0,-2,-4]].forEach(([x,y,z],i)=>{
        const s=0.2+Math.random()*0.4; const c=new THREE.Mesh(new THREE.BoxGeometry(s,s,s),mats[i%3]);
        c.position.set(x,y,z); c.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI); cubes.push(c); scene.add(c);
      });
      const pa=new Float32Array(120*3); for(let i=0;i<120;i++){pa[i*3]=(Math.random()-0.5)*20;pa[i*3+1]=(Math.random()-0.5)*12;pa[i*3+2]=(Math.random()-0.5)*10-2;}
      const pg=new THREE.BufferGeometry(); pg.setAttribute("position",new THREE.BufferAttribute(pa,3));
      const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:0x7dd3fc,size:0.06,transparent:true,opacity:0.7})); scene.add(pts);
      const grid=new THREE.GridHelper(30,30,0x0ea5e9,0x0ea5e9);
      
      grid.material.opacity=0.07; grid.material.transparent=true; grid.position.y=-2.5; scene.add(grid);
      const onResize=()=>{if(!canvas||!renderer)return;camera.aspect=canvas.clientWidth/canvas.clientHeight;camera.updateProjectionMatrix();renderer.setSize(canvas.clientWidth,canvas.clientHeight);};
      window.addEventListener("resize",onResize);
      let mx=0,my=0;
      window.addEventListener("mousemove",e=>{mx=(e.clientX/window.innerWidth-0.5)*2;my=(e.clientY/window.innerHeight-0.5)*2;});
      let t=0;
      const animate=()=>{animId=requestAnimationFrame(animate);t+=0.008;hg.rotation.y=-0.3+Math.sin(t*0.5)*0.15+mx*0.1;hg.position.y=-1+Math.sin(t)*0.15;cubes.forEach((c,i)=>{c.rotation.x+=0.005+i*0.001;c.rotation.y+=0.007+i*0.001;c.position.y+=Math.sin(t+i)*0.003;});pts.rotation.y=t*0.03;camera.position.x=mx*0.5;camera.position.y=2-my*0.3;renderer.render(scene,camera);};
      animate();
    };
    document.head.appendChild(script);
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} id="hero-canvas" />;
}

const STATS = [
  { n: "500+", label: "Properties Listed" },
  { n: "5K+", label: "Happy Guests" },
  { n: "10", label: "Cities in Ghana" },
  { n: "4.9★", label: "Average Rating" },
];
const FEATURES = [
  { icon: <Shield size={22} />, title: "Verified Hosts", desc: "Every host is identity-verified. Your safety is our top priority." },
  { icon: <Zap size={22} />, title: "Instant Booking", desc: "Pay with Paystack, PayPal, or bank transfer — whatever works for you." },
  { icon: <Star size={22} />, title: "Sale & Rental", desc: "Browse rentals for your stay or properties for sale — all in one place." },
];

export default function HomePage() {
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [filtered, setFiltered] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "rental" | "sale">("all");
  const [searchLocation, setSearchLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getAllListings().then(data => { setAllListings(data); setFiltered(data); setLoading(false); });
  }, []);

  const applyFilters = (tab = activeTab) => {
    let r = [...allListings];
    if (tab !== "all") r = r.filter(l => l.listingType === tab);
    if (searchLocation) r = r.filter(l => l.location.toLowerCase().includes(searchLocation.toLowerCase()));
    if (propertyType) r = r.filter(l => l.propertyType === propertyType);
    if (minPrice) r = r.filter(l => {
      const price = l.listingType === "sale" ? (l.salePrice||0) : (l.pricePerNight||0);
      return price >= Number(minPrice);
    });
    if (maxPrice) r = r.filter(l => {
      const price = l.listingType === "sale" ? (l.salePrice||0) : (l.pricePerNight||0);
      return price <= Number(maxPrice);
    });
    setFiltered(r);
  };

  const switchTab = (tab: "all" | "rental" | "sale") => { setActiveTab(tab); applyFilters(tab); };
  const clearFilters = () => { setSearchLocation(""); setMinPrice(""); setMaxPrice(""); setPropertyType(""); setActiveTab("all"); setFiltered(allListings); };

  const rentalCount = allListings.filter(l => l.listingType === "rental").length;
  const saleCount = allListings.filter(l => l.listingType === "sale").length;

  return (
    <>
      {/* ═══ HERO ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: "var(--ink)", minHeight: "90vh" }}>
        <HeroCanvas />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(12,26,46,0.92) 0%, rgba(12,26,46,0.7) 45%, rgba(12,26,46,0.1) 100%)" }} />
        <div className="relative max-w-7xl mx-auto px-6 flex flex-col justify-center" style={{ minHeight: "90vh", paddingTop: "4rem", paddingBottom: "4rem" }}>
          <div className="max-w-2xl">
            <div className="fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6"
              style={{ background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.3)", color: "#7dd3fc" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#7dd3fc" }} />
              Buy, Rent & Discover — Ghana's #1 Property Platform
            </div>
            <h1 className="font-display font-black text-white leading-[1.05] mb-6 fade-in-up-1" style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)" }}>
              Find Your<span className="block gradient-text">Perfect Ghana</span>Home Away
            </h1>
            <p className="text-base leading-relaxed mb-10 fade-in-up-2" style={{ color: "rgba(255,255,255,0.6)", maxWidth: "480px" }}>
              Buy, rent or list properties across Accra, Kumasi, Tema and beyond. Real homes, real hosts, real deals.
            </p>
            <div className="fade-in-up-3 flex flex-col sm:flex-row gap-3 p-2 rounded-2xl max-w-xl"
              style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div className="flex items-center gap-2 flex-1 px-4">
                <MapPin size={15} style={{ color: "var(--sky)", flexShrink: 0 }} />
                <select className="w-full bg-transparent text-sm py-2 outline-none font-medium" style={{ color: "rgba(255,255,255,0.8)" }}
                  value={searchLocation} onChange={e => setSearchLocation(e.target.value)}>
                  <option value="" style={{ background: "#0c1a2e" }}>All Locations</option>
                  {GHANA_LOCATIONS.map(loc => <option key={loc} value={loc} style={{ background: "#0c1a2e" }}>{loc}</option>)}
                </select>
              </div>
              <button onClick={() => applyFilters()}
                className="flex items-center justify-center gap-2 font-bold px-7 py-3 rounded-xl transition-all duration-200 text-sm btn-pulse"
                style={{ background: "var(--yellow)", color: "var(--ink)", flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--yellow-d)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--yellow)")}>
                <Search size={15} /> Search
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-5 fade-in-up-4">
              {GHANA_LOCATIONS.slice(0,6).map(loc => (
                <button key={loc} onClick={() => setSearchLocation(loc)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all duration-200"
                  style={{ border: "1px solid rgba(14,165,233,0.3)", color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--yellow)"; e.currentTarget.style.color = "var(--yellow)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(14,165,233,0.3)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: "60px" }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f0f9ff" />
          </svg>
        </div>
      </section>

      {/* ═══ STATS ══════════════════════════════════════════════ */}
      <section className="py-10" style={{ background: "#f0f9ff" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.n} className="text-center p-5 rounded-2xl transition-all duration-300"
                style={{ background: "white", border: "1px solid rgba(14,165,233,0.1)", boxShadow: "0 2px 12px rgba(14,165,233,0.06)" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.3)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.1)")}>
                <p className="font-display font-black text-3xl" style={{ color: "var(--sky-d)" }}>{s.n}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: "var(--muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ════════════════════════════════════════════ */}
      <section className="py-16" style={{ background: "#f0f9ff" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display font-black text-3xl mb-3" style={{ color: "var(--ink)" }}>Why Choose <span className="gradient-text">Efiehub?</span></h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Built for Ghana, trusted by thousands</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-2xl transition-all duration-300"
                style={{ background: "white", border: "1px solid rgba(14,165,233,0.1)", boxShadow: "0 2px 12px rgba(14,165,233,0.06)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--sky)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(14,165,233,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(14,165,233,0.1)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(14,165,233,0.06)"; }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(14,165,233,0.1)", color: "var(--sky-d)" }}>{f.icon}</div>
                <h3 className="font-bold text-base mb-2" style={{ color: "var(--ink)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LISTINGS ════════════════════════════════════════════ */}
      <section className="py-16" style={{ background: "#f0f9ff" }}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Header + Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display font-black text-3xl" style={{ color: "var(--ink)" }}>Browse Properties</h2>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{filtered.length} {filtered.length === 1 ? "property" : "properties"} available</p>
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl transition-all duration-200"
              style={{ border: "1px solid rgba(14,165,233,0.25)", color: "var(--sky-d)", background: showFilters ? "rgba(14,165,233,0.08)" : "white" }}>
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>

          {/* Rental / Sale tabs */}
          <div className="flex gap-2 mb-6">
            {([
              { key: "all", label: "All Properties", icon: <Home size={14} />, count: allListings.length },
              { key: "rental", label: "For Rent", icon: <Zap size={14} />, count: rentalCount },
              { key: "sale", label: "For Sale", icon: <Tag size={14} />, count: saleCount },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => switchTab(tab.key)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                style={activeTab === tab.key
                  ? { background: "var(--sky-d)", color: "white", boxShadow: "0 4px 12px rgba(14,165,233,0.3)" }
                  : { background: "white", color: "var(--muted)", border: "1px solid rgba(14,165,233,0.15)" }}>
                {tab.icon} {tab.label}
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: activeTab === tab.key ? "rgba(255,255,255,0.25)" : "rgba(14,165,233,0.1)", color: activeTab === tab.key ? "white" : "var(--sky-d)" }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="rounded-2xl p-5 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4"
              style={{ background: "white", border: "1px solid rgba(14,165,233,0.15)", boxShadow: "0 4px 20px rgba(14,165,233,0.08)" }}>
              <div>
                <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{ color: "var(--muted)" }}>Min Price (GHS)</label>
                <input type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={{ border: "1px solid rgba(14,165,233,0.2)", background: "#f8faff" }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{ color: "var(--muted)" }}>Max Price (GHS)</label>
                <input type="number" placeholder="Any" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={{ border: "1px solid rgba(14,165,233,0.2)", background: "#f8faff" }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{ color: "var(--muted)" }}>Property Type</label>
                <select value={propertyType} onChange={e => setPropertyType(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={{ border: "1px solid rgba(14,165,233,0.2)", background: "#f8faff" }}>
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button onClick={() => applyFilters()} className="flex-1 text-white font-semibold px-4 py-2.5 rounded-xl text-sm" style={{ background: "var(--sky-d)" }}>Apply</button>
                <button onClick={clearFilters} className="flex-1 px-4 py-2.5 rounded-xl text-sm" style={{ border: "1px solid rgba(14,165,233,0.2)", color: "var(--muted)" }}>Clear</button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="rounded-2xl h-72 animate-pulse" style={{ background: "#e0f2fe" }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 rounded-2xl" style={{ background: "white", border: "1px solid rgba(14,165,233,0.1)" }}>
              <p className="text-5xl mb-4">🏘️</p>
              <p className="text-lg font-bold" style={{ color: "var(--ink)" }}>No properties found</p>
              <p className="text-sm mt-1 mb-4" style={{ color: "var(--muted)" }}>Try adjusting your filters</p>
              <button onClick={clearFilters} className="text-sm font-medium" style={{ color: "var(--sky)" }}>Clear all filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </div>
      </section>

      {/* ═══ HOST CTA ════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ background: "var(--ink)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full opacity-15" style={{ background: "radial-gradient(circle, var(--sky), transparent)" }} />
          <div className="absolute bottom-[-80px] left-[-80px] w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, var(--yellow), transparent)" }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6"
            style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", color: "#fde68a" }}>
            For Property Owners
          </div>
          <h2 className="font-display font-black text-white mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}>
            List for <span className="gradient-text">Rent or Sale</span>
          </h2>
          <p className="mb-10 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)", maxWidth: "400px", margin: "0 auto 2.5rem" }}>
            Whether you're renting out a room or selling a villa — Efiehub connects you to thousands of buyers and guests across Ghana.
          </p>
          <Link href="/signup"
            className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-2xl transition-all duration-300 text-sm btn-pulse"
            style={{ background: "var(--yellow)", color: "var(--ink)", boxShadow: "0 8px 30px rgba(251,191,36,0.4)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--yellow-d)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--yellow)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            List Your Property <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
