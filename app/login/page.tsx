"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-16 mesh-bg">
      <div className="w-full max-w-md fade-in-up">
        <div className="text-center mb-8">
          <img src="/efiehub-logo.png" alt="Efiehub" className="h-14 w-auto mx-auto mb-5" />
          <h1 className="font-display font-black text-4xl mb-2" style={{ color: "var(--ink)" }}>Welcome back</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Sign in to your Efiehub account</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "white", border: "1px solid rgba(14,165,233,0.15)", boxShadow: "0 8px 40px rgba(14,165,233,0.1)" }}>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
                style={{ border: "1.5px solid rgba(14,165,233,0.2)", background: "#f8faff" }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition pr-10"
                  style={{ border: "1.5px solid rgba(14,165,233,0.2)", background: "#f8faff" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full text-white font-bold py-3.5 rounded-xl transition-all duration-200 text-sm mt-2 btn-pulse"
              style={{ background: "linear-gradient(135deg, var(--sky) 0%, var(--sky-dd) 100%)", boxShadow: "0 4px 20px rgba(14,165,233,0.35)" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = loading ? "1" : "0.9")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>
          <p className="text-center text-sm mt-6" style={{ color: "var(--muted)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold transition" style={{ color: "var(--sky-d)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--sky)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--sky-d)")}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
