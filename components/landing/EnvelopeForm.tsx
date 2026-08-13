"use client";

import { useState, useRef, useEffect } from "react";
import { IconSend, IconShieldLock, IconAlertCircle, IconCheck, IconLoader2 } from "@tabler/icons-react";
import styles from "./EnvelopeForm.module.css";

const KATEGORI_OPTIONS = [
  { value: "", label: "Pilih topik pembicaraan" },
  { value: "akademik", label: "Akademik & Belajar" },
  { value: "fasilitas", label: "Fasilitas Sekolah" },
  { value: "kegiatan", label: "Kegiatan & Acara" },
  { value: "lainnya", label: "Lainnya / Cerita Bebas" },
];

interface Props {
  onOpenStatus: () => void;
  onSubmitSuccess: (kode: string) => void;
}

export default function EnvelopeForm({ onOpenStatus, onSubmitSuccess }: Props) {
  const [kategori, setKategori] = useState("");
  const [email, setEmail] = useState("");
  const [isi, setIsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ aspirasi?: string; email?: string }>({});
  const [charCount, setCharCount] = useState(0);
  const [staggerReady, setStaggerReady] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const flapRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Staggered entrance setelah wrapper ready
  useEffect(() => {
    const t = setTimeout(() => setStaggerReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  const validate = (): boolean => {
    const errs: { aspirasi?: string; email?: string } = {};
    if (!isi.trim()) errs.aspirasi = "Harap isi suratmu terlebih dahulu.";
    if (email.trim() && !email.includes("@")) errs.email = "Format email belum benar. Contoh: nama@email.com";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    // Animasi flap + seal
    flapRef.current?.classList.add("closed");
    sealRef.current?.classList.add("pressed");

    try {
      const res = await fetch("/api/aspirasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isi: isi.trim(), kategori: kategori || null, email_siswa: email.trim() || null }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSubmitSuccess(data.kode_tiket);
          // Reset form
          setSuccess(false);
          setIsi("");
          setKategori("");
          setEmail("");
          setCharCount(0);
          setStaggerReady(false);
          flapRef.current?.classList.remove("closed");
          sealRef.current?.classList.remove("pressed");
          setTimeout(() => setStaggerReady(true), 100);
        }, 3000);
      } else {
        setErrors({ aspirasi: data.error || "Gagal mengirim aspirasi" });
        flapRef.current?.classList.remove("closed");
        sealRef.current?.classList.remove("pressed");
      }
    } catch {
      setErrors({ aspirasi: "Gagal terhubung ke server" });
      flapRef.current?.classList.remove("closed");
      sealRef.current?.classList.remove("pressed");
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: "aspirasi" | "email") => {
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  // (stagger removed - unused)

  return (
    <>
      <div className={styles.envelope}>
        <div className={`${styles.flapContainer}`} ref={flapRef}>
          <div className={styles.flap} />
          <div className={styles.flapLine} />
          <div className={styles.envelopeSeal} ref={sealRef}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#f4ebd8" strokeWidth="1.3" width="22" height="22">
              <path d="M12 3l2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.6 5-.7z"/>
            </svg>
          </div>
        </div>

        <div className={styles.envelopeBody}>
          <div className={`${styles.introMini}${staggerReady ? ` ${styles.show}` : ""}`}>Tulis di sini</div>
          <h3 className={`${styles.heading}${staggerReady ? ` ${styles.show}` : ""}`}>Suratmu, <em>didengar sungguhan.</em></h3>

          <form ref={formRef} onSubmit={handleSubmit} noValidate>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "4px" }}>
              <div className={`${styles.field}${staggerReady ? ` ${styles.staggerShow}` : ""}${errors.email ? ` ${styles.hasError}` : ""}`}>
                <label htmlFor="kategori">Kategori Topik <span className={styles.opt}> (opsional)</span></label>
                <div className={`${styles.fieldUnderline}${focused === "kategori" ? ` ${styles.focused}` : ""}`}>
                  <select
                    id="kategori"
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    onFocus={() => setFocused("kategori")}
                    onBlur={() => setFocused(null)}
                  >
                    {KATEGORI_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`${styles.field}${staggerReady ? ` ${styles.staggerShow}` : ""}${errors.email ? ` ${styles.hasError}` : ""}`}>
                <label htmlFor="email">Kontak Email <span className={styles.opt}> (opsional)</span></label>
                <div className={`${styles.fieldUnderline}${focused === "email" ? ` ${styles.focused}` : ""}`}>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    placeholder="Hanya untuk mengirim kode tiket"
                  />
                </div>
                <div className={`${styles.fieldError}${errors.email ? ` ${styles.show}` : ""}`} role="alert">
                  <IconAlertCircle size={13} aria-hidden="true" />
                  <span>{errors.email}</span>
                </div>
              </div>
            </div>

            <div className={`${styles.field}${staggerReady ? ` ${styles.staggerShow}` : ""}${errors.aspirasi ? ` ${styles.hasError}` : ""}`} style={{ marginBottom: "10px" }}>
              <label htmlFor="aspirasi">Isi Suratmu</label>
              <div className={`${styles.fieldUnderline}${focused === "aspirasi" ? ` ${styles.focused}` : ""}`} style={{ position: "relative" }}>
                <textarea
                  id="aspirasi"
                  value={isi}
                  onChange={(e) => { setIsi(e.target.value); setCharCount(e.target.value.length); clearError("aspirasi"); }}
                  onFocus={() => setFocused("aspirasi")}
                  onBlur={() => setFocused(null)}
                  placeholder="Boleh soal sekolah, boleh cuma ingin cerita. Mulai dari mana saja — kami akan baca sampai selesai."
                  required
                  maxLength={1200}
                />
                <div className={`${styles.charCount}${charCount > 0 ? ` ${styles.show}` : ""}`}>{charCount} / 1200</div>
              </div>
              <div className={`${styles.fieldError}${errors.aspirasi ? ` ${styles.show}` : ""}`} role="alert">
                <IconAlertCircle size={13} aria-hidden="true" />
                <span>{errors.aspirasi}</span>
              </div>
            </div>

            <div className={`${styles.fieldActions}${staggerReady ? ` ${styles.staggerShow}` : ""}`}>
              <button type="submit" className={`${styles.btnSeal}${success ? ` ${styles.success}` : ""}`} disabled={loading}>
                {loading ? (
                  <IconLoader2 size={16} className={styles.animateSpin} aria-hidden="true" />
                ) : success ? (
                  <IconCheck size={16} aria-hidden="true" />
                ) : (
                  <IconSend size={16} aria-hidden="true" />
                )}
                <span>{loading ? "Menyegel…" : success ? "Tersegel" : "Segel & Kirim"}</span>
              </button>
              <button type="button" className={styles.btnTrack} onClick={onOpenStatus}>
                Lacak Status Surat
              </button>
            </div>
          </form>

          <div className={`${styles.sideNote}${staggerReady ? ` ${styles.staggerShow}` : ""}`}>
            <IconShieldLock size={14} aria-hidden="true" /> Identitasmu 100% rahasia. Kami tidak pernah meminta nama.
          </div>
        </div>
      </div>
    </>
  );
}
