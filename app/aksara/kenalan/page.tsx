"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/aksara/auth";

function KenalanInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/aksara";
  const { user, student, status, hasName, saveStudent, logout } = useAuth();
  const [nama, setNama] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "loading" && !user) {
      router.replace(`/aksara/masuk?next=${encodeURIComponent("/aksara/kenalan")}`);
    }
  }, [status, user, router]);

  useEffect(() => {
    setNama((prev) => prev || student?.nama || user?.displayName || "");
  }, [student?.nama, user?.displayName]);

  async function handleSimpan() {
    const bersih = nama.trim();
    if (bersih.length < 2) {
      setErr("Nama minimal 2 huruf.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await saveStudent({ nama: bersih });
      router.replace(next);
    } catch {
      setErr("Gagal menyimpan. Coba lagi ya.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2ECDE]">
        <p className="font-[var(--font-caveat)] text-xl">Memuat…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2ECDE]">
        <p className="font-[var(--font-caveat)] text-xl">Mengalihkan ke halaman masuk…</p>
      </div>
    );
  }

  return (
    <main className="max-w-[520px] mx-auto px-4 py-8">
      <p className="text-[10px] tracking-[0.24em] uppercase text-[#C03B21] font-[var(--font-ibm-plex-mono)]">
        Kartu anggota · sekali isi
      </p>
      <h1 className="font-[var(--font-fraunces)] font-extrabold text-[clamp(2rem,8vw,2.6rem)] leading-[1.05] mt-1.5">
        Namamu siapa<span className="text-[#C03B21]">?</span>
      </h1>
      <p className="font-[var(--font-spectral)] italic text-[0.95rem] leading-relaxed text-[#221D15]/65 mt-1.5">
        Biar tempelan dan suratmu ada nama pemiliknya. Cuma ini yang ditanya sekarang.
      </p>

      <div className="mt-6 bg-[#FDFBF4] border border-[#221D15]/20 rounded-[14px] p-5 shadow-[0_10px_20px_-14px_rgba(24,20,16,0.6)]">
        <label className="block text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)]">
          Nama panggilan di mading
        </label>
        <input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSimpan();
          }}
          placeholder="mis. Nadia"
          autoFocus
          className="w-full font-[var(--font-caveat)] font-bold text-[1.6rem] text-[#2b241c] bg-transparent border-0 border-b-2 border-[#221D15]/25 outline-none py-1.5 focus:border-[#C03B21]"
        />

        {err && (
          <p className="font-[var(--font-spectral)] text-[0.82rem] text-[#C03B21] mt-2">{err}</p>
        )}

        <button
          onClick={handleSimpan}
          disabled={saving}
          className="mt-4 w-full bg-[#221D15] text-[#F2ECDE] border-0 rounded-[10px] px-5 py-3 font-[var(--font-fraunces)] font-bold text-[0.95rem] cursor-pointer disabled:opacity-60 active:scale-[0.99] transition-transform"
        >
          {saving ? "Menyimpan…" : "Masuk ke mading →"}
        </button>

        {hasName && (
          <Link
            href={next}
            className="block text-center mt-3 text-[0.8rem] font-[var(--font-ibm-plex-mono)] tracking-[0.1em] uppercase text-[#221D15]/50 no-underline"
          >
            Lewati, pakai nama sekarang
          </Link>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2.5">
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt=""
            className="w-9 h-9 rounded-full border border-[#221D15]/20"
          />
        ) : (
          <span className="w-9 h-9 rounded-full bg-[#221D15]/10 flex items-center justify-center font-[var(--font-caveat)] font-bold">
            {nama.charAt(0).toUpperCase() || "?"}
          </span>
        )}
        <span className="flex-1 min-w-0">
          <span className="block font-[var(--font-ibm-plex-mono)] text-[10px] tracking-[0.1em] uppercase text-[#221D15]/45">
            Masuk sebagai
          </span>
          <span className="block text-[0.8rem] truncate text-[#221D15]/75">{user.email}</span>
        </span>
        <button
          onClick={() => logout()}
          className="bg-transparent border border-[#221D15]/25 rounded-full px-3 py-1 font-[var(--font-ibm-plex-mono)] text-[9px] tracking-[0.1em] uppercase text-[#221D15]/60 cursor-pointer"
        >
          Ganti
        </button>
      </div>

      <p className="mt-6 font-[var(--font-spectral)] italic text-[0.8rem] text-[#221D15]/45 leading-relaxed">
        NISN dan kelas belum diminta — nanti setelah datanya ada dari sekolah.
      </p>
    </main>
  );
}

export default function KenalanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F2ECDE]">
          <p className="font-[var(--font-caveat)] text-xl">Memuat…</p>
        </div>
      }
    >
      <KenalanInner />
    </Suspense>
  );
}
