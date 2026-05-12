"use client";
// app/page.jsx — Login page
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const error = params.get("error");

  const handleLogin = async () => {
    setLoading(true);
    const { url } = await fetch("/api/auth/url").then(r => r.json());
    window.location.href = url;
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0b0f", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", color: "#e8eaf6",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');`}</style>
      <div style={{ textAlign: "center", maxWidth: 400, padding: "0 24px" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: "linear-gradient(135deg,#5865f2,#eb459e)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, margin: "0 auto 20px",
        }}>🎫</div>

        <h1 style={{ fontFamily: "Syne", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          TicketForge
        </h1>
        <p style={{ color: "#6b7280", marginBottom: 32, lineHeight: 1.6 }}>
          Kelola sistem ticket Discord servermu langsung dari dashboard.
        </p>

        {error && (
          <div style={{ padding: "10px 16px", background: "rgba(237,66,69,.1)", border: "1px solid rgba(237,66,69,.3)", borderRadius: 8, marginBottom: 20, fontSize: 13, color: "#ed4245" }}>
            ❌ Login gagal. Coba lagi.
          </div>
        )}

        <button onClick={handleLogin} disabled={loading} style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "12px 28px", borderRadius: 8, border: "none",
          background: "#5865f2", color: "#fff", fontFamily: "inherit",
          fontSize: 15, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 4px 15px rgba(88,101,242,.4)",
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Mengarahkan..." : (
            <>
              <svg width="20" height="20" viewBox="0 0 71 55" fill="white">
                <path d="M60.1 4.9A58.5 58.5 0 0 0 45.6.7a40.6 40.6 0 0 0-1.8 3.7 54.1 54.1 0 0 0-16.3 0A38.5 38.5 0 0 0 25.7.7 58.4 58.4 0 0 0 11.1 5C1.6 19.3-1 33.3.3 47.1a59 59 0 0 0 18 9.1 44.7 44.7 0 0 0 3.9-6.3 38.4 38.4 0 0 1-6.1-2.9l1.5-1.1a42 42 0 0 0 35.8 0l1.5 1.1a38.5 38.5 0 0 1-6.1 3 44.4 44.4 0 0 0 3.8 6.3 58.8 58.8 0 0 0 18.1-9.1c1.5-15.6-2.6-29.5-10.7-42.2ZM23.7 38.6c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.5 0 6.5 3.3 6.4 7.2 0 4-2.9 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z"/>
              </svg>
              Login dengan Discord
            </>
          )}
        </button>

        <p style={{ color: "#374151", fontSize: 12, marginTop: 20 }}>
          Hanya server yang kamu kelola yang akan muncul
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0a0b0f" }} />}>
      <LoginContent />
    </Suspense>
  );
}
