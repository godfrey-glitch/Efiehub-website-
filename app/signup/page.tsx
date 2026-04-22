"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { UserRole } from "@/lib/types";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("guest");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await signup(email, password, name, role);
      toast.success("Welcome to Efiehub!");
      router.push(role === "host" ? "/dashboard" : "/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally { setLoading(false); }
  };

  const inputStyle = {
    border: "1.5px solid rgba(14,165,233,0.2)",
    background: "#f8faff",
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-16 mesh-bg">
      <div className="w-full max-w-md fade-in-up">
        <div className="text-center mb-8">
          <img src="/efiehub-logo.png" alt="Efiehub" className="h-14 w-auto mx-auto mb-5" />
          <h1 className="font-display font-black text-4xl mb-2" style={{ color: "var(--ink)" }}>Join Efiehub</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Create your account to get started</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "white", border: "1px solid rgba(14,165,233,0.15)", boxShadow: "0 8px 40px rgba(14,165,233,0.1)" }}>
          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-3 mb-7">
            {(["guest", "host"] as UserRole[]).map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className="py-3.5 rounded-xl text-sm font-bold transition-all duration-200"
                style={role === r
                  ? r === "guest"
                    ? { background: "rgba(251,191,36,0.12)", border: "2px solid var(--yellow)", color: "#92400e" }
                    : { background: "rgba(14,165,233,0.1)", border: "2px solid var(--sky)", color: "var(--sky-dd)" }
                  : { background: "#f8faff", border: "2px solid rgba(14,165,233,0.15)", color: "var(--muted)" }
                }>
                {r === "guest" ? "🧳 I'm a Guest" : "🏠 I'm a Host"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {[
              { label: "Full Name", type: "text", val: name, set: setName, ph: "Kwame Mensah" },
              { label: "Email", type: "email", val: email, set: setEmail, ph: "you@example.com" },
              { label: "Password", type: "password", val: password, set: setPassword, ph: "Min. 6 characters" },
            ].map(({ label, type, val, set, ph }) => (
              <div key={label}>
                <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>{label}</label>
                <input type={type} required value={val} onChange={e => set(e.target.value)} placeholder={ph}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--sky)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)")} />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full text-white font-bold py-3.5 rounded-xl transition-all duration-200 text-sm mt-2 btn-pulse"
              style={{ background: "linear-gradient(135deg, var(--sky) 0%, var(--sky-dd) 100%)", boxShadow: "0 4px 20px rgba(14,165,233,0.35)" }}>
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </form>
          <p className="text-center text-sm mt-6" style={{ color: "var(--muted)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "var(--sky-d)" }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
