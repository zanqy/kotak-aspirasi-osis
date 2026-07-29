"use client";

import { motion } from "framer-motion";
import { IconPencil, IconTicket, IconEye, IconSend, IconChevronRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const e = [0.22, 1, 0.36, 1] as const;
const kategoriOptions = ["Fasilitas & Sarana", "Kebersihan", "Keamanan", "Akademik", "Ekstrakulikuler", "Kepengurusan OSIS", "Lainnya"];
const steps = [
  { icon: IconPencil, title: "Tulis aspirasi", desc: "Ceritakan apa yang ingin kamu sampaikan ke OSIS" },
  { icon: IconTicket, title: "Kirim & simpan kode", desc: "Kamu dapat kode unik untuk melacak status aspirasi" },
  { icon: IconEye, title: "Pantau & tunggu balasan", desc: "Humas OSIS akan merespons dan meneruskan aspirasimu" },
];

interface Props {
  kategori: string; setKategori: (v: string) => void;
  isi: string; setIsi: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  error: string; loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  mobileTab: string; setMobileTab: (v: "aspirasi" | "status" | "about") => void;
  mobileSidebarOpen: boolean; setMobileSidebarOpen: (v: boolean) => void;
}

export default function MobileLanding({ kategori, setKategori, isi, setIsi, email, setEmail, error, loading, onSubmit, mobileTab, setMobileTab, mobileSidebarOpen, setMobileSidebarOpen }: Props) {
  const router = useRouter();
  return (
    <div className="md:hidden relative z-10 max-w-[420px] mx-auto bg-[#f0f6ff] min-h-screen overflow-hidden pb-5">
      <motion.div className="bg-[#1565c0] px-4 py-3.5 flex items-center gap-3" initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: e, delay: 0.2 }}>
        <motion.button className="flex flex-col gap-1 p-1 -m-1" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} whileTap={{ scale: 0.88 }}><span className="block w-5 h-[2.5px] bg-white rounded" /><span className="block w-5 h-[2.5px] bg-white rounded" /><span className="block w-5 h-[2.5px] bg-white rounded" /></motion.button>
        <motion.h1 className="text-[15px] font-semibold text-white tracking-[0.2px]" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: e, delay: 0.35 }}>OSIS Humas</motion.h1>
        <motion.span className="ml-auto bg-[#42a5f5] text-white text-[9px] font-bold px-2 py-0.5 rounded-[20px] tracking-[0.5px]" initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: e, delay: 0.5 }}>2024/25</motion.span>
      </motion.div>
      <motion.div className="bg-gradient-to-br from-[#1565c0] via-[#0d47a1] to-[#1a237e] px-4 pt-5 pb-7 relative overflow-hidden" initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: e, delay: 0.4 }}>
        <div className="absolute right-[-30px] top-[-30px] w-[120px] h-[120px] bg-white/5 rounded-full" />
        <motion.div className="inline-flex items-center gap-1.5 bg-white/15 text-[#90caf9] text-[10px] font-semibold px-2.5 py-[3px] rounded-[20px] mb-2.5 tracking-[0.8px] uppercase" initial={{ opacity: 0, x: -80 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: e, delay: 0.7 }}><span className="w-[5px] h-[5px] bg-[#42a5f5] rounded-full animate-pulse-glow" /> Anonim & Aman</motion.div>
        <motion.h2 className="text-[20px] font-bold text-white leading-[1.3] mb-2" initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: e, delay: 0.8 }}>Suaramu penting, <span className="text-[#64b5f6]">kami siap dengar.</span></motion.h2>
        <motion.p className="text-xs text-white/70 leading-relaxed" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: e, delay: 1.4 }}>Sampaikan aspirasi, kritik, atau masukanmu untuk OSIS secara anonim.</motion.p>
      </motion.div>
      <motion.div className="flex gap-1.5 px-3 pt-3 pb-1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: e, delay: 1.8 }}>
        {(["aspirasi", "status", "about"] as const).map((t) => (
          <button key={t} onClick={() => setMobileTab(t)} className={`flex-1 text-center py-1.5 px-1 rounded-lg text-[9px] font-semibold transition-all duration-400 ${mobileTab === t ? "bg-[#1565c0] text-white shadow-[0_2px_16px_rgba(21,101,192,0.25)]" : "bg-white text-[#5c7fa3] border border-[#dbeafe]"}`}>{t === "aspirasi" ? "Kirim Aspirasi" : t === "status" ? "Cek Status" : "Tentang Kami"}</button>
        ))}
      </motion.div>
      <div className="px-3 pt-3.5 pb-2">
        <motion.p className="text-[10px] font-bold text-[#1565c0] tracking-[1px] uppercase mb-2.5" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: e, delay: 2.0 }}>Cara kerjanya</motion.p>
        <div className="flex gap-2">{steps.map((step, i) => (
          <motion.div key={i} className="flex-1 bg-white rounded-[14px] p-2.5 border-[1.5px] border-[#e3f2fd] relative overflow-hidden" initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: e, delay: 2.2 + i * 0.2 }} whileTap={{ scale: 0.96 }}>
            <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-[14px] ${i === 0 ? "bg-[#1565c0]" : i === 1 ? "bg-[#1976d2]" : "bg-[#42a5f5]"}`} />
            <motion.div className={`w-[22px] h-[22px] rounded-lg flex items-center justify-center text-[11px] font-bold text-white mb-1.5 ${i === 0 ? "bg-[#1565c0]" : i === 1 ? "bg-[#1976d2]" : "bg-[#42a5f5]"}`} initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: e, delay: 2.3 + i * 0.2 }}>{i + 1}</motion.div>
            <motion.h4 className="text-[10px] font-bold text-[#1a237e] mb-[3px] leading-[1.3]" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: e, delay: 2.35 + i * 0.2 }}>{step.title}</motion.h4>
            <motion.p className="text-[9px] text-[#5c7fa3] leading-[1.4]" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: e, delay: 2.4 + i * 0.2 }}>{step.desc}</motion.p>
          </motion.div>
        ))}</div>
      </div>
      <motion.div className="mx-3 mt-2 mb-3 bg-white rounded-[18px] p-4 border-[1.5px] border-[#e3f2fd]" initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: e, delay: 2.8 }}>
        <motion.div className="flex items-center justify-between mb-3.5" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: e, delay: 2.9 }}><span className="text-sm font-bold text-[#1a237e]">Tulis Aspirasi</span><span className="bg-[#e3f2fd] text-[#1565c0] text-[9px] font-bold px-2.5 py-[3px] rounded-[20px] tracking-[0.3px]">✦ Anonim</span></motion.div>
        <form onSubmit={onSubmit}>
          <div className="flex gap-2 mb-[11px]">
            <div className="flex-1"><motion.p className="text-[10px] font-bold text-[#5c7fa3] tracking-[0.5px] uppercase mb-[5px]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: e, delay: 3.0 }}>Kategori</motion.p><select value={kategori} onChange={(e) => setKategori(e.target.value)} className="w-full bg-[#f5f9ff] border-[1.5px] border-[#dbeafe] rounded-[10px] px-2.5 py-2 text-[11px] text-navy outline-none">{[""].concat(kategoriOptions).map((opt) => <option key={opt} value={opt}>{opt || "Pilih"}</option>)}</select></div>
            <div className="flex-1"><motion.p className="text-[10px] font-bold text-[#5c7fa3] tracking-[0.5px] uppercase mb-[5px]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: e, delay: 3.1 }}>Email</motion.p><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@..." className="w-full bg-[#f5f9ff] border-[1.5px] border-[#dbeafe] rounded-[10px] px-2.5 py-2 text-[11px] text-navy outline-none placeholder:text-gray-400" /></div>
          </div>
          <motion.p className="text-[10px] font-bold text-[#5c7fa3] tracking-[0.5px] uppercase mb-[5px]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: e, delay: 3.2 }}>Aspirasi</motion.p>
          <motion.textarea value={isi} onChange={(e) => { setIsi(e.target.value); }} placeholder="Ceritakan aspirasimu di sini..." className={`w-full bg-[#f5f9ff] border-[1.5px] rounded-[10px] p-2.5 min-h-[72px] text-[11px] text-navy outline-none resize-none mb-3 placeholder:text-gray-400 ${error ? "border-red-400" : "border-[#dbeafe]"}`} initial={{ opacity: 0, scaleX: 0.2, scaleY: 0.6 }} animate={{ opacity: 1, scaleX: 1, scaleY: 1 }} transition={{ duration: 0.8, ease: e, delay: 3.4 }} />
          {error && <motion.p className="text-[10px] text-red-500 mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>}
          <motion.button type="submit" disabled={loading} className="bg-gradient-to-br from-[#1565c0] to-[#0d47a1] text-white border-none rounded-xl py-[11px] w-full text-xs font-bold flex items-center justify-center gap-1.5 tracking-[0.3px] transition-all duration-500 active:scale-95 disabled:opacity-50" initial={{ opacity: 0, scale: 0.3, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, ease: e, delay: 3.8 }} whileTap={{ scale: 0.96 }}><IconSend size={14} />{loading ? "Mengirim..." : "Kirim Aspirasi"}</motion.button>
          <motion.button type="button" onClick={() => router.push("/cek-aspirasi")} className="bg-white text-[#1565c0] border-[1.5px] border-[#1565c0] rounded-xl py-[9px] w-full text-[11px] font-semibold flex items-center justify-center gap-1.5 mt-2 transition-all duration-500 active:scale-95 active:bg-[#e3f2fd]" initial={{ opacity: 0, scale: 0.3, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, ease: e, delay: 4.0 }} whileTap={{ scale: 0.96 }}>Cek status tiket <IconChevronRight size={14} /></motion.button>
        </form>
      </motion.div>
    </div>
  );
}
