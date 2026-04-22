import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Efiehub — Premium Short-Term Rentals in Ghana",
  description: "Discover and book handpicked short-term rentals across Accra, Kumasi, Tema and beyond. The future of Ghana hospitality.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0284c7" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Efiehub" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                borderRadius: "12px",
                background: "#0c1a2e",
                color: "#ffffff",
                border: "1px solid rgba(14,165,233,0.3)",
                fontSize: "14px",
              },
            }}
          />
          <Navbar />
          <main className="min-h-screen">{children}</main>

          {/* FOOTER */}
          <footer className="relative overflow-hidden mt-24" style={{background: "var(--ink)"}}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10" style={{background: "radial-gradient(circle, #0ea5e9, transparent)"}} />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-10" style={{background: "radial-gradient(circle, #fbbf24, transparent)"}} />
            </div>
            <div className="relative max-w-7xl mx-auto px-6 py-16">
              <div className="grid md:grid-cols-4 gap-10 mb-12">
                <div className="md:col-span-2">
                  <img src="/efiehub-logo.png" alt="Efiehub" className="h-10 w-auto mb-4" style={{filter: "brightness(0) invert(1)"}} />
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                    Ghana's premier platform for short-term rentals. Discover extraordinary spaces across Accra, Kumasi, Tema and beyond.
                  </p>
                  <div className="flex gap-3 mt-6">
                    {["Accra", "Kumasi", "Tema", "East Legon", "Aburi"].map(city => (
                      <span key={city} className="text-xs px-2.5 py-1 rounded-full" style={{background: "rgba(14,165,233,0.15)", color: "#7dd3fc"}}>
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-4">Platform</p>
                  {["Explore Listings", "List Your Property", "Sign In", "Create Account"].map(l => (
                    <p key={l} className="text-slate-400 text-sm mb-2 hover:text-sky-400 cursor-pointer transition">{l}</p>
                  ))}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-4">Property Types</p>
                  {["Apartments", "Villas", "Studios", "Guesthouses", "Houses"].map(t => (
                    <p key={t} className="text-slate-400 text-sm mb-2">{t}</p>
                  ))}
                </div>
              </div>
              <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                <p className="text-slate-500 text-xs">© {new Date().getFullYear()} Efiehub. All rights reserved.</p>
                <p className="text-slate-500 text-xs">Built for Ghana 🇬🇭</p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
