"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getClientAuth, getClientDb } from "@/lib/firebase-client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type Student = {
  nama: string;
  kelas: string;
  nis: string;
  role: string;
  bio: string;
  fotoUrl: string;
};

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [editKelas, setEditKelas] = useState("");
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    const auth = getClientAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/aksara/masuk");
        return;
      }
      setUser(u);
      const db = getClientDb();
      const snap = await getDoc(doc(db, "students", u.uid));
      if (snap.exists()) {
        const data = snap.data() as Student;
        setStudent(data);
        setEditNama(data.nama || "");
        setEditKelas(data.kelas || "");
        setEditBio(data.bio || "");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  async function handleSave() {
    if (!user) return;
    const db = getClientDb();
    await (await import("firebase/firestore")).updateDoc(
      doc(db, "students", user.uid),
      { nama: editNama, kelas: editKelas, bio: editBio }
    );
    setStudent((prev) =>
      prev ? { ...prev, nama: editNama, kelas: editKelas, bio: editBio } : null
    );
    setEditing(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2ECDE] flex items-center justify-center">
        <p className="font-[var(--font-caveat)] text-xl">Memuat profil...</p>
      </div>
    );
  }

  const nama = student?.nama || "Tanpa nama";
  const kelas = student?.kelas || "—";
  const role = student?.role || "siswa";
  const bio = student?.bio || "Belum ada bio.";
  const initial = nama.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F2ECDE]">
      <header className="sticky top-0 z-20 flex justify-between items-center px-4 py-2.5 bg-[#F2ECDE]/94 backdrop-blur-sm border-b border-[#221D15]/25">
        <span className="font-[var(--font-fraunces)] font-extrabold text-[1.25rem]">
          AKSARA<span className="text-[#C03B21]">.</span>
        </span>
        <nav className="flex gap-1">
          <a href="/aksara" className="text-[10px] tracking-[0.12em] uppercase font-[var(--font-ibm-plex-mono)] font-medium text-[#221D15] no-underline px-3 py-1.5 rounded-full">
            Mading
          </a>
          <a href="/aksara/profil" className="text-[10px] tracking-[0.12em] uppercase font-[var(--font-ibm-plex-mono)] font-medium text-[#221D15] no-underline px-3 py-1.5 rounded-full bg-[#221D15] text-[#F2ECDE]">
            Profil
          </a>
          <a href="/aksara/kirim" className="text-[10px] tracking-[0.12em] uppercase font-[var(--font-ibm-plex-mono)] font-medium text-[#221D15] no-underline px-3 py-1.5 rounded-full">
            Kirim
          </a>
        </nav>
      </header>

      <main className="max-w-[520px] mx-auto px-4 py-6">
        {/* Kartu Pelajar */}
        <div className="bg-[#F7F1E1] rounded-[8px] shadow-[0_14px_24px_-12px_rgba(24,20,16,0.5)] p-5 flex gap-4 items-center rotate-[1deg] border border-[#221D15]/10">
          <div className="w-[72px] h-[86px] flex-none bg-gradient-to-br from-[#D7E4EF] to-[#B9CFE2] border-[3px] border-[#FDFBF4] shadow-[0_2px_5px_rgba(24,20,16,0.3)] flex items-center justify-center font-[var(--font-caveat)] font-bold text-[1.8rem] -rotate-2">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-[var(--font-fraunces)] font-extrabold text-[1.15rem] leading-tight truncate">
              {nama}
            </h2>
            <p className="font-[var(--font-ibm-plex-mono)] text-[9px] tracking-[0.14em] text-[#221D15]/55 mt-0.5">
              {kelas} · AKSARA
            </p>
            <span className="inline-block mt-2 font-[var(--font-ibm-plex-mono)] text-[8.5px] font-bold bg-[#221D15] text-[#F2ECDE] rounded-full px-2.5 py-1 tracking-[0.1em]">
              {role.toUpperCase()}
            </span>
            <p className="font-[var(--font-spectral)] italic text-[0.85rem] text-[#221D15]/65 mt-2 leading-snug">
              {bio}
            </p>
          </div>
        </div>

        {/* Edit button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setEditing(!editing)}
            className="text-[10px] tracking-[0.12em] uppercase font-[var(--font-ibm-plex-mono)] font-medium text-[#221D15] border border-[#221D15]/30 rounded-full px-4 py-1.5 bg-transparent cursor-pointer"
          >
            {editing ? "Batal" : "Ubah profil"}
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="mt-3 bg-[#FDFBF4] border border-[#221D15]/20 rounded-[12px] p-4">
            <label className="block text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mt-2 first:mt-0">
              Nama
            </label>
            <input
              value={editNama}
              onChange={(e) => setEditNama(e.target.value)}
              className="w-full font-[var(--font-caveat)] text-[1.1rem] text-[#2b241c] bg-transparent border-0 border-b-[1.5px] border-[#221D15]/30 outline-none py-1 focus:border-[#C03B21]"
            />
            <label className="block text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mt-3">
              Kelas
            </label>
            <input
              value={editKelas}
              onChange={(e) => setEditKelas(e.target.value)}
              className="w-full font-[var(--font-caveat)] text-[1.1rem] text-[#2b241c] bg-transparent border-0 border-b-[1.5px] border-[#221D15]/30 outline-none py-1 focus:border-[#C03B21]"
            />
            <label className="block text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mt-3">
              Bio
            </label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={2}
              className="w-full font-[var(--font-caveat)] text-[1.1rem] text-[#2b241c] bg-transparent border border-[#221D15]/20 rounded-[8px] p-2 outline-none focus:border-[#C03B21] resize-none"
            />
            <button
              onClick={handleSave}
              className="mt-3 bg-[#221D15] text-[#F2ECDE] border-0 rounded-[10px] px-5 py-2.5 font-[var(--font-fraunces)] font-bold text-[0.9rem] cursor-pointer"
            >
              Simpan
            </button>
          </div>
        )}

        {/* Galeri Karya — placeholder */}
        <div className="mt-8">
          <h3 className="font-[var(--font-fraunces)] font-bold text-[1.1rem] mb-3">
            Galeri Karyaku
          </h3>
          <p className="font-[var(--font-spectral)] italic text-[0.9rem] text-[#221D15]/55">
            Galeri karya akan muncul di sini setelah terhubung ke Firestore.
          </p>
        </div>

        {/* Logout */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => signOut(getClientAuth())}
            className="text-[10px] tracking-[0.12em] uppercase font-[var(--font-ibm-plex-mono)] font-medium text-[#C03B21] border border-[#C03B21]/30 rounded-full px-4 py-1.5 bg-transparent cursor-pointer"
          >
            Keluar
          </button>
        </div>
      </main>
    </div>
  );
}
