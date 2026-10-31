"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getClientAuth } from "@/lib/firebase-client";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function MasukPage() {
  const router = useRouter();
  const [nis, setNis] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = getClientAuth();
      const email = `${nis.trim()}@aksara.local`;
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/aksara");
    } catch (err: any) {
      setError(err?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex flex-col justify-center px-5 py-8 max-w-[520px] mx-auto">
      <p className="text-[10px] tracking-[0.24em] uppercase text-[#C03B21] font-[var(--font-ibm-plex-mono)]">
        Kartu anggota · masuk
      </p>
      <h1 className="font-[var(--font-caveat)] font-bold text-[clamp(2.4rem,10vw,3.2rem)] leading-[1.05] mt-2">
        Siapa nih?
      </h1>
      <p className="font-[var(--font-spectral)] italic text-[0.95rem] leading-relaxed text-[#221D15]/65 mt-1">
        Masuk pakai NIS. Belum punya akun? Daftar dulu.
      </p>

      <form onSubmit={handleLogin} className="mt-6 bg-[#FDFBF4] border border-[#221D15]/20 rounded-[14px] p-5 shadow-[0_14px_26px_-14px_rgba(24,20,16,0.4)] -rotate-[0.5deg]">
        <label className="block text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mt-3.5 first:mt-0">
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
          placeholder="Password..."
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
            {loading ? "Masuk..." : "Masuk →"}
          </button>
        </div>
      </form>

      <p className="mt-4 text-center text-[0.85rem] font-[var(--font-spectral)] italic text-[#221D15]/55">
        Belum punya akun?{" "}
        <Link href="/aksara/daftar" className="text-[#C03B21] no-underline font-semibold">
          Daftar di sini
        </Link>
      </p>
    </main>
  );
}
