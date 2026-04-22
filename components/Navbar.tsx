"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, PlusCircle, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out.");
    setOpen(false);
  };

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(12,26,46,0.92)"
          : "rgba(12,26,46,0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(14,165,233,0.2)" : "1px solid transparent",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.3)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/efiehub-logo.png"
            alt="Efiehub"
            className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7 text-sm">
          <Link href="/" className="font-medium transition-colors duration-200" style={{ color: "rgba(255,255,255,0.7)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#7dd3fc")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}>
            Explore
          </Link>

          {user ? (
            <>
              {user.role === "host" && (
                <>
                  <Link href="/dashboard"
                    className="flex items-center gap-1.5 font-medium transition-colors duration-200"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#7dd3fc")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}>
                    <LayoutDashboard size={14} /> Dashboard
                  </Link>
                  <Link href="/listings/create"
                    className="flex items-center gap-1.5 font-semibold px-4 py-2 rounded-xl transition-all duration-200 btn-pulse text-sm"
                    style={{ background: "var(--yellow)", color: "var(--ink)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--yellow-d)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "var(--yellow)")}>
                    <PlusCircle size={14} /> List Property
                  </Link>
                </>
              )}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, var(--sky), var(--sky-dd))" }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {user.name.split(" ")[0]}
                </span>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
                <LogOut size={13} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login"
                className="font-medium transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.7)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#7dd3fc")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}>
                Sign In
              </Link>
              <Link href="/signup"
                className="font-semibold px-5 py-2 rounded-xl transition-all duration-200 text-sm btn-pulse"
                style={{ background: "linear-gradient(135deg, var(--sky), var(--sky-dd))", color: "white" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden p-2 rounded-lg transition" style={{ color: "#7dd3fc" }} onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden px-5 py-5 flex flex-col gap-4 text-sm"
          style={{ background: "rgba(12,26,46,0.97)", borderTop: "1px solid rgba(14,165,233,0.15)" }}>
          <Link href="/" onClick={() => setOpen(false)} className="font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Explore Listings</Link>
          {user ? (
            <>
              {user.role === "host" && (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Dashboard</Link>
                  <Link href="/listings/create" onClick={() => setOpen(false)} className="font-semibold" style={{ color: "var(--yellow)" }}>+ List Property</Link>
                </>
              )}
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Signed in as {user.email}</span>
              <button onClick={handleLogout} className="text-left text-sm" style={{ color: "#f87171" }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Sign In</Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="font-semibold" style={{ color: "var(--sky)" }}>Get Started →</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
