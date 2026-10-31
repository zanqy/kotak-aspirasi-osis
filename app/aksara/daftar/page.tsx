"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getClientAuth, getClientDb } from "@/lib/firebase-client";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function DaftarPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [nis, setNis] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = getClientAuth();
      const db = getClientDb();
      const email = `${nis.trim()}@aksara.local`;
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "students", cred.user.uid), {
        nama: nama.trim(),
        kelas: kelas.trim(),
        nis: nis.trim(),
        role: "siswa",
        bio: "",
        fotoUrl: "",
        createdAt: new Date(),
      });
      router.push("/aksara");
    } catch (err: any) {
      setError(err?.message || "Daftar gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex flex-col justify-center px-5 py-8 max-w-[520px] mx-auto">
      <p className="text-[10px] tracking-[0.24em] uppercase text-[#C03B21] font-[var(--font-ibm-plex-mono)]">
        Kartu anggota · daftar
      </p>
      <h1 className="font-[var(--font-caveat)] font-bold text-[clamp(2.4rem,10vw,3.2rem)] leading-[1.05] mt-2">
        Siapa nih?
      </h1>
      <p className="font-[var(--font-spectral)] italic text-[0.95rem] leading-relaxed text-[#221D15]/65 mt-1">
        Cuma nama + kelas + NIS + password. 30 detik.
      </p>

      <form onSubmit={handleRegister} className="mt-6 bg-[#FDFBF4] border border-[#221D15]/20 rounded-[14px] p-5 shadow-[0_14px_26px_-14px_rgba(24,20,16,0.4)] -rotate-[0.5deg]">
        <label className="block text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mt-3.5 first:mt-0">
          Nama
        </label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Namamu..."
          autoComplete="off"
          className="w-full font-[var(--font-caveat)] font-semibold text-[1.2rem] text-[#2b241c] bg-transparent border-0 border-b-[1.5px] border-[#221D15]/30 outline-none py-1 focus:border-[#C03B21]"
        />

        <label className="block text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mt-3.5">
          Kelas
        </label>
        <input
          type="text"
          value={kelas}
          onChange={(e) => setKelas(e.target.value)}
          placeholder="mis. XI-1..."
          autoComplete="off"
          className="w-full font-[var(--font-caveat)] font-semibold text-[1.2rem] text-[#2b241c] bg-transparent border-0 border-b-[1.5px] border-[#221D15]/30 outline-none py-1 focus:border-[#C03B21]"
        />

        <label className="block text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mt-3.5">
          NIS
        </label>
        <input
          type="text"
          value={nis}
          onChange={(e) => setNis(e.target.value)}
          placeholder="Nomor Induk Siswa..."
          autoComplete="off"
          className="w-full font-[var(--font-caveat)] font-semibold text-[1.2rem] text-[#2b241c] bg-transparent border-0 border-b-[1.5px] border-[#221D15]/30 outline-none py-1 focus:border-[#C03B21]"
        />

        <label className="block text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mt-3.5">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimal 6 karakter..."
          className="w-full font-[var(--font-caveat)] font-semibold text-[1.2rem] text-[#2b241c] bg-transparent border-0 border-b-[1.5px] border-[#221D15]/30 outline-none py-1 focus:border-[#C03B21]"
        />

        {error && (
          <p className="mt-3 text-[0.85rem] text-[#C03B21] font-[var(--font-spectral)] italic">
            {error}
          </p>
        )}

        <div className="flex gap-2.5 mt-5">
          <Link
            href="/aksara"
            className="flex-none bg-transparent text-[#221D15] border-[1.5px] border-[#221D15]/30 rounded-[10px] px-4 py-3.5 font-[var(--font-spectral)] font-medium text-[0.95rem] no-underline text-center"
          >
            Nanti
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#221D15] text-[#F2ECDE] border-0 rounded-[10px] px-4 py-3.5 font-[var(--font-fraunces)] font-bold text-[1rem] cursor-pointer disabled:opacity-60"
          >
            {loading ? "Mendaftar..." : "Daftar →"}
          </button>
        </div>
      </form>

      <p className="mt-4 text-center text-[0.85rem] font-[var(--font-spectral)] italic text-[#221D15]/55">
        Sudah punya akun?{" "}
        <Link href="/aksara/masuk" className="text-[#C03B21] no-underline font-semibold">
          Masuk di sini
        </Link>
      </p>
    </main>
  );
}
