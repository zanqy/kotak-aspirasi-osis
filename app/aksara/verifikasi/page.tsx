"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase-client";
import { useAuth } from "@/lib/aksara/auth";

const KELAS_RE = /^(VII|VIII|IX|X|XI|XII)[\s-]?\d{1,2}$/i;
const NISN_RE = /^\d{10}$/;

export default function VerifikasiPage() {
  const router = useRouter();
  const { user, student, status, verified, saveStudent, refreshStudent } = useAuth();
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [nisn, setNisn] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "loading" && !user) {
      router.replace("/aksara/masuk?next=/aksara/verifikasi");
    }
  }, [status, user, router]);

  useEffect(() => {
    if (student) {
      setNama((v) => v || student.nama || "");
      setKelas((v) => v || student.kelas || "");
      setNisn((v) => v || student.nisn || "");
    }
  }, [student]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const n = nisn.trim();
    const k = kelas.trim().toUpperCase().replace(/\s+/g, "-");
    const nm = nama.trim();

    if (!nm) return setError("Nama belum diisi.");
    if (!NISN_RE.test(n)) return setError("NISN harus 10 angka.");
    if (!KELAS_RE.test(k)) return setError("Kelas contoh: XI-1, XII-3, X-2.");

    setLoading(true);
    try {
      // NISN tidak boleh dipakai akun lain
      const db = getClientDb();
      const q = query(collection(db, "students"), where("nisn", "==", n));
      const snap = await getDocs(q);
      const taken = snap.docs.some((d) => d.id !== user?.uid);
      if (taken) {
        setError("NISN ini sudah dipakai akun lain. Kalau ini keliru, hubungi OSIS.");
        return;
      }

      await saveStudent({
        nama: nm,
        kelas: k,
        nisn: n,
        verified: true,
      });
      await refreshStudent();
      router.replace("/aksara");
    } catch (err: any) {
      const code = String(err?.code || "");
      if (code.includes("permission-denied")) {
        setError("Ditolak oleh aturan database. Hubungi admin.");
      } else if (code.includes("unavailable") || code.includes("network")) {
        setError("Koneksi bermasalah. Coba lagi.");
      } else {
        setError("Gagal menyimpan verifikasi. Coba lagi.");
      }
    } finally {
      setLoading(false);
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

  if (verified) {
    return (
      <main className="min-h-[calc(100vh-3.2rem)] flex flex-col justify-center items-center px-5 py-10 max-w-[460px] mx-auto text-center">
        <p className="font-[var(--font-caveat)] text-3xl">Sudah terverifikasi ✓</p>
        <p className="font-[var(--font-spectral)] italic text-[#221D15]/65 mt-2">
          NISN {student?.nisn} · {student?.kelas}
        </p>
        <button
          onClick={() => router.replace("/aksara")}
          className="mt-5 bg-[#221D15] text-[#F2ECDE] rounded-full px-6 py-2.5 font-[var(--font-fraunces)] font-bold"
        >
          Ke beranda
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-3.2rem)] flex flex-col justify-center px-5 py-10 max-w-[460px] mx-auto">
      <p className="text-[10px] tracking-[0.24em] uppercase text-[#C03B21] font-[var(--font-ibm-plex-mono)]">
        Verifikasi siswa · sekali saja
      </p>
      <h1 className="font-[var(--font-caveat)] font-bold text-[clamp(2.2rem,9vw,2.9rem)] leading-[1.05] mt-2">
        Kenalan dulu, yuk.
      </h1>
      <p className="font-[var(--font-spectral)] italic text-[0.95rem] leading-relaxed text-[#221D15]/65 mt-1">
        NISN dipakai buat memastikan kamu benar siswa di sekolah ini.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 bg-[#FDFBF4] border border-[#221D15]/20 rounded-[14px] p-5 shadow-[0_14px_26px_-14px_rgba(24,20,16,0.4)] -rotate-[0.5deg]"
      >
        <label className="block text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)]">
          Nama lengkap
        </label>
        <input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Namamu…"
          className="w-full font-[var(--font-caveat)] font-semibold text-[1.2rem] text-[#2b241c] bg-transparent border-0 border-b-[1.5px] border-[#221D15]/30 outline-none py-1 focus:border-[#C03B21]"
        />

        <label className="block text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mt-4">
          NISN
        </label>
        <input
          value={nisn}
          onChange={(e) => setNisn(e.target.value.replace(/\D/g, "").slice(0, 10))}
          inputMode="numeric"
          placeholder="10 angka"
          className="w-full font-[var(--font-ibm-plex-mono)] font-semibold text-[1.1rem] text-[#2b241c] bg-transparent border-0 border-b-[1.5px] border-[#221D15]/30 outline-none py-1 focus:border-[#C03B21]"
        />

        <label className="block text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mt-4">
          Kelas
        </label>
        <input
          value={kelas}
          onChange={(e) => setKelas(e.target.value)}
          placeholder="mis. XI-1"
          className="w-full font-[var(--font-caveat)] font-semibold text-[1.2rem] text-[#2b241c] bg-transparent border-0 border-b-[1.5px] border-[#221D15]/30 outline-none py-1 focus:border-[#C03B21]"
        />

        {error && (
          <p className="mt-3 text-[0.85rem] text-[#C03B21] font-[var(--font-spectral)] italic leading-snug">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full bg-[#221D15] text-[#F2ECDE] rounded-[10px] px-4 py-3.5 font-[var(--font-fraunces)] font-bold text-[1rem] cursor-pointer disabled:opacity-60"
        >
          {loading ? "Menyimpan…" : "Verifikasi"}
        </button>

        <p className="mt-3 text-[0.75rem] font-[var(--font-spectral)] text-[#221D15]/50 leading-relaxed">
          Satu NISN cuma boleh dipakai satu akun. Kalau NISN-mu sudah dipakai orang lain,
          lapor ke OSIS.
        </p>
      </form>
    </main>
  );
}
