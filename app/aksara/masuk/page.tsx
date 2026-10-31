"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/aksara/auth";

function MasukInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/aksara";
  const { user, status, hasName, signInGoogle } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // sudah login → langsung ke tujuan
  useEffect(() => {
    if (status === "ready" && user) {
      router.replace(hasName ? next : `/aksara/kenalan?next=${encodeURIComponent(next)}`);
    }
  }, [status, user, hasName, next, router]);

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      await signInGoogle();
    } catch (err: any) {
      const code = String(err?.code || "");
      if (code.includes("popup-closed-by-user") || code.includes("cancelled-popup-request")) {
        setError("");
      } else if (code.includes("network-request-failed")) {
        setError("Koneksi ke Google terblokir — matikan VPN / adblock lalu coba lagi.");
      } else if (code.includes("operation-not-allowed")) {
        setError("Login Google belum diaktifkan di Firebase. Hubungi admin.");
      } else if (code.includes("unauthorized-domain")) {
        setError("Domain ini belum didaftarkan di Firebase Auth. Hubungi admin.");
      } else if (code.includes("internal-error")) {
        setError("Google menolak permintaan. Coba lagi, atau buka di tab baru.");
      } else {
        setError("Gagal masuk dengan Google. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-3.2rem)] flex flex-col justify-center px-5 py-10 max-w-[460px] mx-auto">
      <p className="text-[10px] tracking-[0.24em] uppercase text-[#C03B21] font-[var(--font-ibm-plex-mono)]">
        Kartu anggota · masuk
      </p>
      <h1 className="font-[var(--font-caveat)] font-bold text-[clamp(2.4rem,10vw,3.2rem)] leading-[1.05] mt-2">
        Siapa nih?
      </h1>
      <p className="font-[var(--font-spectral)] italic text-[0.95rem] leading-relaxed text-[#221D15]/65 mt-1">
        Cukup akun Google. Setelah masuk, kami tanya namamu sekali.
      </p>

      <div className="mt-6 bg-[#FDFBF4] border border-[#221D15]/20 rounded-[14px] p-5 shadow-[0_14px_26px_-14px_rgba(24,20,16,0.4)] -rotate-[0.5deg]">
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-[#221D15] text-[#F2ECDE] rounded-[10px] px-4 py-4 font-[var(--font-fraunces)] font-bold text-[1rem] cursor-pointer disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C36.9 40 44 35 44 24c0-1.3-.1-2.6-.4-3.9z" />
          </svg>
          {loading ? "Membuka Google…" : "Masuk dengan Google"}
        </button>

        {error && (
          <p className="mt-3 text-[0.85rem] text-[#C03B21] font-[var(--font-spectral)] italic leading-snug">
            {error}
          </p>
        )}

        <p className="mt-4 text-[0.8rem] font-[var(--font-spectral)] text-[#221D15]/55 leading-relaxed">
          Akun Google cuma dipakai untuk mengenali kamu — bukan buat posting apa pun
          tanpa kamu. NISN belum diminta.
        </p>
      </div>

      <p className="mt-4 text-center text-[0.85rem] font-[var(--font-spectral)] italic text-[#221D15]/55">
        Cuma mau lihat-lihat?{" "}
        <a href="/aksara/mading/umum" className="text-[#C03B21] no-underline font-semibold">
          Intip mading umum
        </a>
      </p>
    </main>
  );
}

export default function MasukPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F2ECDE]">
          <p className="font-[var(--font-caveat)] text-xl">Memuat…</p>
        </div>
      }
    >
      <MasukInner />
    </Suspense>
  );
}
