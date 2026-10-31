"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/aksara/auth";
import AuthGate from "@/components/aksara/AuthGate";

function ProfilInner() {
  const { user, student, saveStudent } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [editKelas, setEditKelas] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!student) return;
    setEditNama(student.nama || "");
    setEditKelas(student.kelas || "");
    setEditBio(student.bio || "");
  }, [student]);

  async function handleSave() {
    setSaving(true);
    try {
      await saveStudent({ nama: editNama, kelas: editKelas, bio: editBio });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const nama = student?.nama || user?.displayName || "Tanpa nama";
  const kelas = student?.kelas || "—";
  const role = student?.role || "siswa";
  const bio = student?.bio || "Belum ada bio.";
  const nisn = student?.nisn;
  const verified = Boolean(student?.verified && nisn);
  const initial = nama.charAt(0).toUpperCase();

  return (
    <main className="max-w-[520px] mx-auto px-4 py-6">
      {/* Kartu Pelajar */}
      <div className="bg-[#F7F1E1] rounded-[8px] shadow-[0_14px_24px_-12px_rgba(24,20,16,0.5)] p-5 flex gap-4 items-center rotate-[1deg] border border-[#221D15]/10">
        <div className="w-[72px] h-[86px] flex-none bg-gradient-to-br from-[#D7E4EF] to-[#B9CFE2] border-[3px] border-[#FDFBF4] shadow-[0_2px_5px_rgba(24,20,16,0.3)] flex items-center justify-center font-[var(--font-caveat)] font-bold text-[1.8rem] -rotate-2 overflow-hidden">
          {student?.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={student.fotoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-[var(--font-fraunces)] font-extrabold text-[1.15rem] leading-tight truncate">
            {nama}
          </h2>
          <p className="font-[var(--font-ibm-plex-mono)] text-[9px] tracking-[0.14em] text-[#221D15]/55 mt-0.5">
            {kelas} · AKSARA
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="font-[var(--font-ibm-plex-mono)] text-[8.5px] font-bold bg-[#221D15] text-[#F2ECDE] rounded-full px-2.5 py-1 tracking-[0.1em]">
              {role.toUpperCase()}
            </span>
            {verified ? (
              <span className="font-[var(--font-ibm-plex-mono)] text-[8.5px] font-bold bg-[#3C6B33] text-[#F2ECDE] rounded-full px-2.5 py-1 tracking-[0.1em]">
                NISN {nisn}
              </span>
            ) : (
              <Link
                href="/aksara/verifikasi"
                className="font-[var(--font-ibm-plex-mono)] text-[8.5px] font-bold bg-[#C03B21] text-[#F2ECDE] rounded-full px-2.5 py-1 tracking-[0.1em] no-underline"
              >
                BELUM VERIFIKASI
              </Link>
            )}
          </div>
          <p className="font-[var(--font-spectral)] italic text-[0.85rem] text-[#221D15]/65 mt-2 leading-snug">
            {bio}
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setEditing(!editing)}
          className="text-[10px] tracking-[0.12em] uppercase font-[var(--font-ibm-plex-mono)] font-medium text-[#221D15] border border-[#221D15]/30 rounded-full px-4 py-1.5 bg-transparent cursor-pointer"
        >
          {editing ? "Batal" : "Ubah profil"}
        </button>
      </div>

      {editing && (
        <div className="mt-3 bg-[#FDFBF4] border border-[#221D15]/20 rounded-[12px] p-4">
          <label className="block text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)]">
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
          <p className="mt-2 text-[0.75rem] font-[var(--font-spectral)] text-[#221D15]/50">
            NISN dikunci setelah verifikasi. Kalau salah, hubungi OSIS.
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-3 bg-[#221D15] text-[#F2ECDE] border-0 rounded-[10px] px-5 py-2.5 font-[var(--font-fraunces)] font-bold text-[0.9rem] cursor-pointer disabled:opacity-60"
          >
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      )}

      <div className="mt-8">
        <h3 className="font-[var(--font-fraunces)] font-bold text-[1.1rem] mb-2">
          Galeri Karyaku
        </h3>
        <p className="font-[var(--font-spectral)] italic text-[0.9rem] text-[#221D15]/55">
          Tempelan yang kamu pasang di mading akan terkumpul di sini.
        </p>
        <div className="mt-3 flex gap-2 flex-wrap">
          <Link
            href="/aksara/mading/umum"
            className="bg-[#221D15] text-[#F2ECDE] rounded-full px-4 py-1.5 font-[var(--font-fraunces)] font-bold text-[0.8rem] no-underline"
          >
            Buka Mading Umum
          </Link>
          <Link
            href="/aksara/mading/pribadi"
            className="border border-[#221D15]/25 text-[#221D15] rounded-full px-4 py-1.5 font-[var(--font-fraunces)] font-bold text-[0.8rem] no-underline"
          >
            Mading Pribadi
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ProfilPage() {
  return (
    <AuthGate requireVerified={false}>
      <ProfilInner />
    </AuthGate>
  );
}
