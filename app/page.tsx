"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconSend, IconSearch, IconChevronRight, IconPencil, IconTicket, IconEye, IconHome, IconMessage, IconInfoCircle } from "@tabler/icons-react";
import { Particles, SuccessState } from "@/components/landing/LandingShared";
import MobileLanding from "@/components/landing/MobileLanding";

const e = [0.22, 1, 0.36, 1] as const;
const kategoriOptions = ["Fasilitas & Sarana", "Kebersihan", "Keamanan", "Akademik", "Ekstrakulikuler", "Kepengurusan OSIS", "Lainnya"];
const steps = [
  { icon: IconPencil, title: "Tulis aspirasi", desc: "Ceritakan apa yang ingin kamu sampaikan ke OSIS" },
  { icon: IconTicket, title: "Kirim & simpan kode", desc: "Kamu dapat kode unik untuk melacak status aspirasi" },
  { icon: IconEye, title: "Pantau & tunggu balasan", desc: "Humas OSIS akan merespons dan meneruskan aspirasimu" },
];
const heroStats = [{ num: "100%", label: "Anonim" }, { num: "3–5", label: "Hari respons" }, { num: "24/7", label: "Selalu terbuka" }];

export default function Home() {
  const router = useRouter();
  const [kategori, setKategori] = useState("");
  const [isi, setIsi] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [kodeTiket, setKodeTiket] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"aspirasi" | "status" | "about">("aspirasi");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isi.trim()) { setError("Isi aspirasi tidak boleh kosong"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/aspirasi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isi: isi.trim(), kategori: kategori || null, email_siswa: email.trim() || null }) });
      const data = await res.json();
      if (res.ok) { setKodeTiket(data.kode_tiket); setSubmitted(true); } else setError(data.error || "Gagal mengirim aspirasi");
    } catch { setError("Gagal terhubung ke server"); } finally { setLoading(false); }
  };

  if (submitted) return <><Particles /><SuccessState kodeTiket={kodeTiket} copied={copied} onCopy={() => { navigator.clipboard.writeText(kodeTiket); setCopied(true); setTimeout(() => setCopied(false), 2000); }} onCek={() => router.push(`/cek-aspirasi?kode=${kodeTiket}`)} /></>;

  return (
    <>
      <Particles />
      {/* DESKTOP */}
      <div className="hidden md:flex min-h-screen relative z-10">
        <motion.aside className="w-[220px] flex-shrink-0 bg-navy flex-col rounded-l-[14px] overflow-hidden flex"
          initial={{ opacity: 0, x: -80, scale: 0.94, rotate: -1 }} animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }} transition={{ duration: 1.1, ease: e, delay: 0.1 }}>
          <div className="px-5 pt-6 pb-5 border-b border-white/10">
            <motion.div className="flex items-center gap-2.5 mb-1" initial={{ opacity: 0, x: -80 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: e, delay: 0.4 }}>
              <motion.div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-blue to-blue-light flex items-center justify-center font-display font-bold text-sm text-white flex-shrink-0" initial={{ opacity: 0, scale: 0.3, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.7, ease: e, delay: 0.55 }}>O</motion.div>
              <motion.span className="font-display font-semibold text-sm text-white leading-tight" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: e, delay: 0.7 }}>OSIS Humas</motion.span>
            </motion.div>
            <motion.p className="text-[11px] text-white/40 tracking-[0.3px]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: e, delay: 0.85 }}>Kepengurusan 2024/2025</motion.p>
          </div>
          <nav className="px-3 py-4 flex-1">
            <motion.p className="text-[10px] text-white/30 tracking-[1px] uppercase px-2 mb-2" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: e, delay: 1.0 }}>Menu</motion.p>
            {[{ id: "home", icon: IconHome, label: "Beranda" }, { id: "aspirasi", icon: IconMessage, label: "Kirim Aspirasi" }, { id: "status", icon: IconSearch, label: "Cek Status" }, { id: "about", icon: IconInfoCircle, label: "Tentang OSIS" }].map((item, i) => (
              <motion.button key={item.id} className="w-full flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg text-[13px] transition-colors mb-0.5 text-white bg-blue font-medium shadow-[0_4px_16px_rgba(29,111,255,0.25)]"
                initial={{ opacity: 0, x: -80 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: e, delay: 1.15 + i * 0.2 }} whileHover={{ x: 4 }} whileTap={{ scale: 0.96 }}>
                <item.icon size={16} /><span>{item.label}</span>
              </motion.button>
            ))}
          </nav>
          <motion.div className="px-3 py-4 border-t border-white/10 flex items-center gap-2.5 rounded-bl-[14px]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: e, delay: 2.0 }}>
            <motion.div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue to-blue-light flex items-center justify-center text-xs font-semibold text-white flex-shrink-0" initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: e, delay: 2.1 }}>S</motion.div>
            <div><motion.p className="text-xs text-white font-medium" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: e, delay: 2.2 }}>Siswa / Anonim</motion.p><motion.p className="text-[10px] text-white/40" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: e, delay: 2.3 }}>OSIS · Humas</motion.p></div>
          </motion.div>
        </motion.aside>
        <motion.main className="flex-1 overflow-hidden flex flex-col bg-white rounded-r-[14px]" initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: e, delay: 0.2 }}>
          <motion.div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white" initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: e, delay: 0.4 }}>
            <motion.h1 className="font-display text-base font-semibold text-navy" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: e, delay: 0.55 }}>Suara Pelajar</motion.h1>
            <motion.span className="bg-blue-pale text-blue text-[11px] font-semibold px-2.5 py-1 rounded-[20px] tracking-[0.3px]" initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: e, delay: 0.7 }}>Aspirasi Terbuka</motion.span>
          </motion.div>
          <div className="px-6 py-5 overflow-y-auto flex-1">
            <motion.div className="rounded-[14px] p-7 mb-5 relative overflow-hidden bg-gradient-to-br from-blue to-blue-dark" initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: e, delay: 0.6 }} whileHover={{ y: -2 }}>
              <div className="absolute right-[-30px] top-[-40px] w-[180px] h-[180px] rounded-full bg-white/5 pointer-events-none" /><div className="absolute right-10 bottom-[-50px] w-[120px] h-[120px] rounded-full bg-white/4 pointer-events-none" />
              <motion.div className="inline-flex items-center gap-1.5 bg-white/15 rounded-[20px] px-3 py-1 text-[11px] text-white/90 mb-3.5 font-medium" initial={{ opacity: 0, x: -80 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: e, delay: 0.9 }}><span className="w-1.5 h-1.5 rounded-full bg-blue-light animate-pulse-glow" /> Humas OSIS aktif menerima aspirasi</motion.div>
              <motion.h2 className="font-display text-[26px] font-bold text-white leading-[1.25] mb-2.5" initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: e, delay: 1.0 }}>Suaramu penting, <span className="text-blue-light">kami siap mendengar.</span></motion.h2>
              <motion.p className="text-[13px] text-white/80 leading-relaxed max-w-[460px]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: e, delay: 1.6 }}>Sampaikan aspirasi, kritik, atau masukanmu untuk OSIS secara anonim. Aman, mudah, dan langsung sampai.</motion.p>
              <div className="flex gap-5 mt-5">{heroStats.map((s, i) => (
                <motion.div key={s.label} className="text-left px-2 py-1 rounded-lg" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: e, delay: 2.3 + i * 0.2 }} whileHover={{ y: -3 }}>
                  <motion.span className="font-display text-xl font-bold text-white block" initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: e, delay: 2.4 + i * 0.2 }}>{s.num}</motion.span>
                  <span className="text-[11px] text-white/55 block mt-0.5">{s.label}</span>
                </motion.div>
              ))}</div>
            </motion.div>
            <motion.p className="font-display text-[13px] font-semibold text-gray-400 tracking-[1px] uppercase mb-3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: e, delay: 2.6 }}>Cara kerja</motion.p>
            <div className="grid grid-cols-3 gap-3 mb-5">{steps.map((step, i) => (
              <motion.div key={i} className="rounded-xl p-[18px_16px] relative overflow-hidden bg-blue-pale border-[1.5px] border-transparent cursor-default" initial={{ opacity: 0, y: 80, scale: 0.88 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease: e, delay: 2.8 + i * 0.2 }} whileHover={{ y: -5, backgroundColor: "#fff", borderColor: "#1D6FFF" }} whileTap={{ scale: 0.98 }}>
                <span className="absolute right-[-6px] bottom-[-10px] font-display text-[72px] font-bold text-blue/8 leading-none pointer-events-none select-none">{i + 1}</span>
                <motion.div className="w-[34px] h-[34px] rounded-[9px] bg-blue flex items-center justify-center mb-3" initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: e, delay: 2.85 + i * 0.2 }} whileHover={{ scale: 1.06, rotate: -3 }}><step.icon size={17} className="text-white" /></motion.div>
                <motion.h4 className="font-display text-[13px] font-semibold text-navy mb-1" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: e, delay: 2.9 + i * 0.2 }}>{step.title}</motion.h4>
                <motion.p className="text-[11.5px] text-gray-700 leading-relaxed" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: e, delay: 2.95 + i * 0.2 }}>{step.desc}</motion.p>
              </motion.div>
            ))}</div>
            <motion.div className="bg-gray-50 rounded-[14px] p-5 border-[1.5px] border-[#E8EFFF]" initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: e, delay: 3.4 }} whileHover={{ borderColor: "#1D6FFF" }}>
              <motion.div className="font-display text-sm font-semibold text-navy flex items-center gap-2 mb-4" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: e, delay: 3.5 }}>
                <motion.span initial={{ opacity: 0, rotate: -15 }} animate={{ opacity: 1, rotate: 0 }} transition={{ duration: 0.6, ease: e, delay: 3.6 }}><IconPencil size={18} className="text-blue" /></motion.span>
                <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: e, delay: 3.7 }}>Tulis Aspirasi</motion.span>
              </motion.div>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3 mb-3.5">
                  <motion.div className="flex flex-col gap-[5px]" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: e, delay: 3.8 }}>
                    <label className="text-xs font-medium text-gray-700">Kategori <span className="text-[10px] text-gray-400 font-normal">(opsional)</span></label>
                    <select value={kategori} onChange={(e) => setKategori(e.target.value)} className="w-full border-[1.5px] border-[#DCE8FF] rounded-lg px-3 py-[9px] text-[13px] text-navy bg-white outline-none transition-all duration-400 focus:border-blue focus:shadow-[0_0_0_4px_rgba(29,111,255,0.06)] hover:border-blue-light">{[""].concat(kategoriOptions).map((opt) => <option key={opt} value={opt}>{opt || "Pilih kategori"}</option>)}</select>
                  </motion.div>
                  <motion.div className="flex flex-col gap-[5px]" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: e, delay: 4.0 }}>
                    <label className="text-xs font-medium text-gray-700">Email <span className="text-[10px] text-gray-400 font-normal">(opsional)</span></label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="w-full border-[1.5px] border-[#DCE8FF] rounded-lg px-3 py-[9px] text-[13px] text-navy bg-white outline-none transition-all duration-400 focus:border-blue focus:shadow-[0_0_0_4px_rgba(29,111,255,0.06)] hover:border-blue-light placeholder:text-gray-400" />
                  </motion.div>
                </div>
                <motion.div className="flex flex-col gap-[5px] mb-3.5" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: e, delay: 4.2 }}>
                  <label className="text-xs font-medium text-gray-700">Aspirasi</label>
                  <motion.textarea value={isi} onChange={(e) => { setIsi(e.target.value); if (error) setError(""); }} placeholder="Ceritakan aspirasimu di sini..." className={`w-full border-[1.5px] rounded-lg px-3 py-[9px] text-[13px] text-navy bg-white outline-none min-h-[100px] resize-y transition-all duration-400 focus:border-blue focus:shadow-[0_0_0_4px_rgba(29,111,255,0.06)] hover:border-blue-light placeholder:text-gray-400 ${error ? "border-red-400" : "border-[#DCE8FF]"}`} initial={{ opacity: 0, scaleX: 0.2, scaleY: 0.6 }} animate={{ opacity: 1, scaleX: 1, scaleY: 1 }} transition={{ duration: 0.8, ease: e, delay: 4.5 }} />
                  {error && <motion.p className="text-[11px] text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>}
                </motion.div>
                <p className="text-[11px] text-gray-400 mb-4">Email tidak disimpan — hanya untuk kirim kode tiket sekali</p>
                <div className="flex gap-2.5">
                  <motion.button type="submit" disabled={loading} className="flex-1 py-[11px] border-none rounded-[9px] bg-gradient-to-br from-blue to-blue-dark text-white text-[13px] font-display font-semibold flex items-center justify-center gap-1.5 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(29,111,255,0.3)] active:scale-95 disabled:opacity-50" initial={{ opacity: 0, scale: 0.3, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, ease: e, delay: 4.8 }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.96 }}><IconSend size={16} /><span>{loading ? "Mengirim..." : "Kirim Aspirasi"}</span></motion.button>
                  <motion.button type="button" onClick={() => router.push("/cek-aspirasi")} className="py-[11px] px-[18px] rounded-[9px] border-[1.5px] border-[#DCE8FF] bg-white text-blue text-[13px] font-display font-medium whitespace-nowrap transition-all duration-500 hover:bg-blue-pale hover:-translate-y-0.5 hover:border-blue active:scale-95" initial={{ opacity: 0, scale: 0.3, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, ease: e, delay: 5.2 }} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>Cek status <IconChevronRight size={14} className="inline ml-1" /></motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.main>
      </div>
      {/* MOBILE */}
      <MobileLanding
        kategori={kategori} setKategori={setKategori}
        isi={isi} setIsi={setIsi}
        email={email} setEmail={setEmail}
        error={error} loading={loading}
        onSubmit={handleSubmit}
        mobileTab={mobileTab} setMobileTab={setMobileTab}
        mobileSidebarOpen={mobileSidebarOpen} setMobileSidebarOpen={setMobileSidebarOpen}
      />
    </>
  );
}
