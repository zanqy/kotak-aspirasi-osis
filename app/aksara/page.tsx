"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase-client";
import { useAuth } from "@/lib/aksara/auth";

type Item = {
  id?: string;
  kind?: string;
  color?: string;
  text?: string;
  name?: string;
  image?: string;
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default function AksaraHome() {
  const { user, student, status, hasName } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [count, setCount] = useState<number | null>(null);

  // pratinjau mading umum (publik, boleh dibaca tanpa login)
  useEffect(() => {
    let cancelled = false;
    const q = query(
      collection(getClientDb(), "boards", "umum", "items"),
      orderBy("at", "desc"),
      limit(14)
    );
    getDocs(q)
      .then((snap) => {
        if (cancelled) return;
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Item[];
        setItems(list);
        setCount(list.length);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2ECDE]">
        <p className="font-[var(--font-caveat)] text-xl">Memuat…</p>
      </div>
    );
  }

  // ---------- HOME MEMBER ----------
  if (user) {
    const nama = student?.nama || user.displayName || "Teman";
    return (
      <main className="px-5 py-6 max-w-[520px] mx-auto">
        <p className="text-[10px] tracking-[0.24em] uppercase text-[#C03B21] font-[var(--font-ibm-plex-mono)]">
          Selamat datang
        </p>
        <h1 className="font-[var(--font-fraunces)] font-extrabold text-[clamp(2.2rem,9vw,3rem)] leading-[1] mt-1.5">
          Halo, {nama}<span className="text-[#C03B21]">.</span>
        </h1>
        <p className="font-[var(--font-spectral)] italic text-[0.95rem] text-[#221D15]/65 mt-1">
          {hasName
            ? student?.kelas
              ? `${student.kelas} · anggota AKSARA`
              : "Anggota AKSARA"
            : "Nama panggilanmu belum diisi"}
        </p>

        {!hasName && (
          <div className="mt-4 rounded-[12px] border border-[#C03B21]/35 bg-[#C03B21]/5 px-4 py-3">
            <p className="font-[var(--font-fraunces)] font-bold text-[0.95rem]">
              Satu langkah lagi
            </p>
            <p className="font-[var(--font-spectral)] text-[0.85rem] leading-relaxed text-[#221D15]/70 mt-1">
              Isi nama panggilanmu supaya bisa nempel dan kirim surat.
            </p>
            <Link
              href="/aksara/kenalan"
              className="inline-block mt-2.5 bg-[#C03B21] text-[#F2ECDE] rounded-full px-4 py-1.5 font-[var(--font-fraunces)] font-bold text-[0.85rem] no-underline"
            >
              Isi nama →
            </Link>
          </div>
        )}

        <div className="grid gap-3 mt-5">
          <Link
            href="/aksara/mading/umum"
            className="flex items-center gap-3.5 bg-[#221D15] text-[#F2ECDE] rounded-[14px] px-4 py-4 no-underline active:scale-[0.98] transition-transform"
          >
            <span className="flex-1 min-w-0">
              <b className="font-[var(--font-fraunces)] font-extrabold text-[1.1rem] block">
                Mading Umum →
              </b>
              <span className="font-[var(--font-spectral)] text-[0.83rem] opacity-60">
                Papan publik, siapa pun boleh nempel
              </span>
            </span>
          </Link>

          <Link
            href="/aksara/mading/pribadi"
            className="flex items-center gap-3.5 bg-[#FDFBF4] text-[#221D15] border border-[#221D15]/22 rounded-[14px] px-4 py-4 no-underline active:scale-[0.98] transition-transform"
          >
            <span className="flex-1 min-w-0">
              <b className="font-[var(--font-fraunces)] font-extrabold text-[1.1rem] block">
                Mading Pribadiku →
              </b>
              <span className="font-[var(--font-spectral)] text-[0.83rem] opacity-60">
                Kamarmu sendiri
              </span>
            </span>
          </Link>

          <Link
            href="/aksara/kirim"
            className="flex items-center gap-3.5 bg-[#FDFBF4] text-[#221D15] border border-[#221D15]/22 rounded-[14px] px-4 py-4 no-underline active:scale-[0.98] transition-transform"
          >
            <span className="flex-1 min-w-0">
              <b className="font-[var(--font-fraunces)] font-extrabold text-[1.1rem] block">
                Kirim Surat →
              </b>
              <span className="font-[var(--font-spectral)] text-[0.83rem] opacity-60">
                Pos kilat redaksi
              </span>
            </span>
          </Link>

          <Link
            href="/aksara/profil"
            className="flex items-center gap-3.5 bg-[#FDFBF4] text-[#221D15] border border-[#221D15]/22 rounded-[14px] px-4 py-4 no-underline active:scale-[0.98] transition-transform"
          >
            <span className="flex-1 min-w-0">
              <b className="font-[var(--font-fraunces)] font-extrabold text-[1.1rem] block">
                Kartu Pelajarku →
              </b>
              <span className="font-[var(--font-spectral)] text-[0.83rem] opacity-60">
                Identitas + galeri karya
              </span>
            </span>
          </Link>
        </div>

        <div className="flex justify-between mt-6 font-[var(--font-ibm-plex-mono)] text-[10px] tracking-[0.14em] uppercase text-[#221D15]/50">
          <span>Edisi 231</span>
          <span>
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span>1 senyum</span>
        </div>
      </main>
    );
  }

  // ---------- HOME PUBLIK ----------
  return (
    <main className="relative overflow-hidden min-h-[calc(100vh-3.2rem)]">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[#F2ECDE]" />
        {items.map((d, i) => {
          const h = hash(String(d.id || i));
          const left = 5 + (h % 62);
          const top = 4 + ((h >> 3) % 40);
          const rot = (h % 25) - 12;
          const scale = 0.85 + (h % 30) / 100;
          const isPolaroid = d.kind === "polaroid" && d.image;
          return (
            <div
              key={d.id || i}
              className={`absolute rounded-sm shadow-[0_10px_18px_-6px_rgba(24,20,16,0.45)] p-3 w-[140px] ${
                d.kind === "clip"
                  ? "font-[var(--font-spectral)] text-[0.66rem] leading-relaxed"
                  : "font-[var(--font-caveat)] font-semibold text-[0.95rem] leading-snug"
              }`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                transform: `rotate(${rot}deg) scale(${scale})`,
                background: isPolaroid ? "#FDFBF4" : d.color || "#FFF3B0",
              }}
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[32px] h-[9px] bg-[rgba(240,226,170,0.92)] shadow-[0_1px_2px_rgba(24,20,16,0.2)] rotate-[-2deg]" />
              {isPolaroid ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.image} alt="" className="w-full rounded-sm" />
                  {d.text && (
                    <span className="block font-[var(--font-caveat)] font-semibold text-[0.78rem] p-1">
                      {d.text}
                    </span>
                  )}
                </>
              ) : (
                <>
                  {String(d.text || d.kind || "★").slice(0, 60)}
                  {d.name && (
                    <span className="block font-[var(--font-ibm-plex-mono)] text-[8px] tracking-wider mt-1 opacity-55">
                      {d.name}
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(242,236,222,0.55) 0%, rgba(242,236,222,0.45) 28%, rgba(242,236,222,0.72) 55%, rgba(242,236,222,0.94) 78%, #F2ECDE 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col justify-end min-h-[calc(100vh-3.2rem)] px-5 py-6 max-w-[520px] mx-auto">
        <p className="text-[10px] tracking-[0.24em] uppercase text-[#C03B21] font-[var(--font-ibm-plex-mono)]">
          Mading hidup · mading umum
        </p>
        <h1 className="font-[var(--font-fraunces)] font-extrabold text-[clamp(3.4rem,18vw,5.2rem)] leading-[0.95] tracking-[-0.02em] mt-1.5">
          AKSARA<span className="text-[#C03B21]">.</span>
        </h1>
        <p className="font-[var(--font-spectral)] italic text-[0.98rem] leading-relaxed text-[#221D15]/70 max-w-[36ch] mt-1">
          Papan tulis bebas anak sekolah — ditempel tangan, dibaca semua orang.
        </p>

        <div className="grid gap-2 mt-4">
          {[
            "Intip mading umum, tanpa akun.",
            "Masuk pakai Google, kami tanya nama sekali.",
            "Anonim boleh. Yang penting sopan.",
          ].map((t, i) => (
            <div key={i} className="flex gap-2.5 items-baseline text-[0.9rem] leading-relaxed">
              <b className="font-[var(--font-fraunces)] font-bold flex-none">0{i + 1}.</b>
              <span>{t}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-2.5 mt-5">
          <Link
            href="/aksara/mading/umum"
            className="flex items-center gap-3.5 bg-[#221D15] text-[#F2ECDE] rounded-[14px] px-4 py-4 no-underline active:scale-[0.98] transition-transform"
          >
            <span className="flex-1 min-w-0">
              <b className="font-[var(--font-fraunces)] font-extrabold text-[1.1rem] block">
                Intip Mading →
              </b>
              <span className="font-[var(--font-spectral)] text-[0.83rem] opacity-60">
                Lihat-lihat dulu, gratis
              </span>
            </span>
            <span className="font-[var(--font-ibm-plex-mono)] text-[9.5px] tracking-[0.08em] opacity-65 text-right flex-none">
              {count === null ? "…" : `${count} tempelan`}
            </span>
          </Link>

          <Link
            href="/aksara/masuk"
            className="flex items-center gap-3.5 bg-[#FDFBF4]/90 text-[#221D15] border border-[#221D15]/22 rounded-[14px] px-4 py-4 no-underline backdrop-blur-[3px] active:scale-[0.98] transition-transform"
          >
            <span className="flex-1 min-w-0">
              <b className="font-[var(--font-fraunces)] font-extrabold text-[1.1rem] block">
                Masuk dengan Google →
              </b>
              <span className="font-[var(--font-spectral)] text-[0.83rem] opacity-60">
                30 detik, cukup akun Google
              </span>
            </span>
          </Link>
        </div>

        <div className="flex justify-between mt-4 font-[var(--font-ibm-plex-mono)] text-[10px] tracking-[0.14em] uppercase text-[#221D15]/50">
          <span>Edisi 231</span>
          <span>
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span>1 senyum</span>
        </div>
      </div>
    </main>
  );
}
