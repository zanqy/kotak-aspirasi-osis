"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import Link from "next/link";
import { getClientAuth, getClientDb } from "@/lib/firebase-client";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type Item = {
  id?: string;
  kind?: string;
  color?: string;
  text?: string;
  name?: string;
  image?: string;
};

type Student = {
  nama: string;
  kelas: string;
  role: string;
};

export default function AksaraHome() {
  const [user, setUser] = useState<any>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [bits, setBits] = useState<Item[]>([]);

  useEffect(() => {
    const auth = getClientAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const db = getClientDb();
        const snap = await getDoc(doc(db, "students", u.uid));
        if (snap.exists()) setStudent(snap.data() as Student);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aksara_papan_v1");
      const items: Item[] = raw ? JSON.parse(raw) : [];
      const arr = Array.isArray(items) ? items : [];
      setCount(arr.length);
      setBits(arr.slice(0, 14));
    } catch {
      setCount(0);
    }
    setLoaded(true);
  }, []);

  function hash(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F2ECDE] flex items-center justify-center">
        <p className="font-[var(--font-caveat)] text-xl">Memuat...</p>
      </div>
    );
  }

  // Member home
  if (user) {
    const nama = student?.nama || "Teman";
    const kelas = student?.kelas || "";
    return (
      <main className="min-h-screen bg-[#F2ECDE] px-5 py-6 max-w-[520px] mx-auto">
        <p className="text-[10px] tracking-[0.24em] uppercase text-[#C03B21] font-[var(--font-ibm-plex-mono)]">
          Selamat datang
        </p>
        <h1 className="font-[var(--font-fraunces)] font-extrabold text-[clamp(2.4rem,10vw,3.2rem)] leading-[0.95] mt-1.5">
          Halo, {nama}<span className="text-[#C03B21]">.</span>
        </h1>
        {kelas && (
          <p className="font-[var(--font-spectral)] italic text-[0.95rem] text-[#221D15]/65 mt-1">
            {kelas} · AKSARA
          </p>
        )}

        <div className="grid gap-3 mt-6">
          <Link
            href="/aksara/mading/umum"
            className="flex items-center gap-3.5 bg-[#221D15] text-[#F2ECDE] rounded-[14px] px-4 py-4 no-underline shadow-[0_10px_20px_-12px_rgba(24,20,16,0.4)] active:scale-[0.98] transition-transform"
          >
            <span className="flex-1 min-w-0">
              <b className="font-[var(--font-fraunces)] font-extrabold text-[1.1rem] block">
                Mading Umum →
              </b>
              <span className="font-[var(--font-spectral)] text-[0.83rem] opacity-62">
                Papan publik, semua bisa nempel
              </span>
            </span>
            <span className="font-[var(--font-ibm-plex-mono)] text-[9.5px] tracking-[0.08em] opacity-65 text-right flex-none">
              {count} tempelan
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
              <span className="font-[var(--font-spectral)] text-[0.83rem] opacity-62">
                Kamarmu sendiri, bisa dipublish
              </span>
            </span>
            <span className="font-[var(--font-ibm-plex-mono)] text-[9.5px] tracking-[0.08em] opacity-65 text-right flex-none">
              Pribadi
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
              <span className="font-[var(--font-spectral)] text-[0.83rem] opacity-62">
                Pos kilat redaksi
              </span>
            </span>
            <span className="font-[var(--font-ibm-plex-mono)] text-[9.5px] tracking-[0.08em] opacity-65 text-right flex-none">
              Surat
            </span>
          </Link>

          <Link
            href="/aksara/profil"
            className="flex items-center gap-3.5 bg-[#FDFBF4] text-[#221D15] border border-[#221D15]/22 rounded-[14px] px-4 py-4 no-underline active:scale-[0.98] transition-transform"
          >
            <span className="flex-1 min-w-0">
              <b className="font-[var(--font-fraunces)] font-extrabold text-[1.1rem] block">
                Profilku →
              </b>
              <span className="font-[var(--font-spectral)] text-[0.83rem] opacity-62">
                Kartu + galeri karyamu
              </span>
            </span>
            <span className="font-[var(--font-ibm-plex-mono)] text-[9.5px] tracking-[0.08em] opacity-65 text-right flex-none">
              HAL. 2/3
            </span>
          </Link>
        </div>

        <div className="flex justify-between mt-6 font-[var(--font-ibm-plex-mono)] text-[10px] tracking-[0.14em] uppercase text-[#221D15]/55">
          <span>Edisi 231</span>
          <span>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
          <span>1 senyum</span>
        </div>
      </main>
    );
  }

  // Public home (with collage)
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[#F2ECDE]" />
        {bits.map((d, i) => {
          const h = hash(String(d.id || i));
          const left = 5 + (h % 62);
          const top = 8 + ((h >> 3) % 42);
          const rot = (h % 25) - 12;
          const scale = 0.95 + (h % 30) / 100;
          const isPolaroid = d.kind === "polaroid" && d.image;
          return (
            <div
              key={i}
              className={`absolute rounded-sm shadow-[0_10px_18px_-6px_rgba(24,20,16,0.5)] p-3 w-[150px] ${
                d.kind === "clip" ? "font-[var(--font-spectral)] text-[0.68rem] leading-relaxed" : "font-[var(--font-caveat)] font-semibold text-[1rem] leading-snug"
              }`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                transform: `rotate(${rot}deg) scale(${scale})`,
                background: isPolaroid ? "#FDFBF4" : d.color || "#FFF3B0",
                opacity: 1,
              }}
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[34px] h-[10px] bg-[rgba(240,226,170,0.92)] shadow-[0_1px_2px_rgba(24,20,16,0.2)] rotate-[-2deg]" />
              {isPolaroid ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.image} alt="" className="w-full rounded-sm" />
                  {d.text && <span className="block font-[var(--font-caveat)] font-semibold text-[0.8rem] p-1">{d.text}</span>}
                </>
              ) : (
                <>
                  {d.text || d.kind || "★"}
                  {d.name && <span className="block font-[var(--font-ibm-plex-mono)] text-[8px] tracking-wider mt-1 opacity-60">{d.name}</span>}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(242,236,222,0.42) 0%, rgba(242,236,222,0.38) 30%, rgba(242,236,222,0.62) 52%, rgba(242,236,222,0.9) 74%, rgba(242,236,222,0.96) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col justify-end min-h-screen px-5 py-6 max-w-[520px] mx-auto">
        <p className="text-[10px] tracking-[0.24em] uppercase text-[#C03B21] font-[var(--font-ibm-plex-mono)]">
          Mading hidup · mading umum
        </p>
        <h1 className="font-[var(--font-fraunces)] font-extrabold text-[clamp(3.6rem,20vw,5.6rem)] leading-[0.95] tracking-[-0.02em] mt-1.5">
          AKSARA<span className="text-[#C03B21]">.</span>
        </h1>
        <p className="font-[var(--font-spectral)] italic text-[0.98rem] leading-relaxed text-[#221D15]/72 max-w-[36ch] mt-1">
          Papan tulis bebas anak sekolah — ditempel tangan, dibaca semua orang.
        </p>
        <div className="grid gap-2 mt-4">
          <div className="flex gap-2.5 items-baseline text-[0.9rem] leading-relaxed">
            <b className="font-[var(--font-fraunces)] font-bold flex-none">01.</b>
            <span>Intip mading umum, tanpa daftar.</span>
          </div>
          <div className="flex gap-2.5 items-baseline text-[0.9rem] leading-relaxed">
            <b className="font-[var(--font-fraunces)] font-bold flex-none">02.</b>
            <span>Masuk untuk nempel, kirim surat, dan punya mading pribadi.</span>
          </div>
          <div className="flex gap-2.5 items-baseline text-[0.9rem] leading-relaxed">
            <b className="font-[var(--font-fraunces)] font-bold flex-none">03.</b>
            <span>Anonim boleh. Yang penting sopan.</span>
          </div>
        </div>
        <nav className="grid gap-2.5 mt-4.5">
          <Link
            href="/aksara/mading/umum"
            className="flex items-center gap-3.5 bg-[#221D15] text-[#F2ECDE] rounded-[14px] px-4 py-4 no-underline shadow-[0_10px_20px_-12px_rgba(24,20,16,0.4)] active:scale-[0.98] transition-transform"
          >
            <span className="flex-1 min-w-0">
              <b className="font-[var(--font-fraunces)] font-extrabold text-[1.1rem] block">
                Intip Mading →
              </b>
              <span className="font-[var(--font-spectral)] text-[0.83rem] opacity-62">
                Lihat-lihat dulu, gratis
              </span>
            </span>
            <span className="font-[var(--font-ibm-plex-mono)] text-[9.5px] tracking-[0.08em] opacity-65 text-right flex-none">
              {loaded ? `${count} tempelan` : "—"}
            </span>
          </Link>
          <Link
            href="/aksara/masuk"
            className="flex items-center gap-3.5 bg-[#FDFBF4]/88 text-[#221D15] border border-[#221D15]/22 rounded-[14px] px-4 py-4 no-underline backdrop-blur-[3px] active:scale-[0.98] transition-transform"
          >
            <span className="flex-1 min-w-0">
              <b className="font-[var(--font-fraunces)] font-extrabold text-[1.1rem] block">
                Masuk / Daftar →
              </b>
              <span className="font-[var(--font-spectral)] text-[0.83rem] opacity-62">
                Cuma nama + kelas
              </span>
            </span>
            <span className="font-[var(--font-ibm-plex-mono)] text-[9.5px] tracking-[0.08em] opacity-65 text-right flex-none">
              30 detik
            </span>
          </Link>
        </nav>
        <div className="flex justify-between mt-3.5 font-[var(--font-ibm-plex-mono)] text-[10px] tracking-[0.14em] uppercase text-[#221D15]/55">
          <span>Edisi 231</span>
          <span>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
          <span>1 senyum</span>
        </div>
      </div>
    </main>
  );
}