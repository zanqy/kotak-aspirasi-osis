"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/aksara/auth";

/**
 * Gerbang tunggal untuk halaman yang butuh login.
 * - loading  -> tampilkan pesan loading (maks 8 dtk, tak pernah menggantung)
 * - anon     -> lempar ke /aksara/masuk?next=<halaman ini>
 * - belum verifikasi NISN -> lempar ke /aksara/verifikasi
 */
export default function AuthGate({
  children,
  requireVerified = true,
}: {
  children: React.ReactNode;
  requireVerified?: boolean;
}) {
  const router = useRouter();
  const { status, user, verified, error } = useAuth();

  useEffect(() => {
    if (status === "loading") return;
    if (!user) {
      const here = typeof window !== "undefined" ? window.location.pathname : "/aksara";
      router.replace(`/aksara/masuk?next=${encodeURIComponent(here)}`);
      return;
    }
    if (requireVerified && !verified) {
      router.replace("/aksara/verifikasi");
    }
  }, [status, user, verified, requireVerified, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 px-6 text-center bg-[#F2ECDE]">
        <p className="font-[var(--font-caveat)] text-xl">Memuat…</p>
        {error === "timeout" && (
          <p className="font-[var(--font-spectral)] italic text-[0.85rem] text-[#221D15]/60">
            Koneksi ke Google lambat / terblokir. Matikan VPN atau adblock, lalu muat ulang.
          </p>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center bg-[#F2ECDE]">
        <p className="font-[var(--font-caveat)] text-xl">Perlu masuk dulu…</p>
        <a
          href="/aksara/masuk"
          className="font-[var(--font-fraunces)] font-bold text-[#F2ECDE] bg-[#221D15] rounded-full px-5 py-2 no-underline"
        >
          Masuk
        </a>
      </div>
    );
  }

  if (requireVerified && !verified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center bg-[#F2ECDE]">
        <p className="font-[var(--font-caveat)] text-xl">Verifikasi NISN dulu…</p>
        <a
          href="/aksara/verifikasi"
          className="font-[var(--font-fraunces)] font-bold text-[#F2ECDE] bg-[#221D15] rounded-full px-5 py-2 no-underline"
        >
          Verifikasi
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
