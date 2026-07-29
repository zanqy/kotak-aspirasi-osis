"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconShieldCheck } from "@tabler/icons-react";

const e = [0.22, 1, 0.36, 1] as const;

export function Particles() {
  const [items, setItems] = useState<{ id: number; s: number; l: string; d: number; dl: number; o: number; b: string }[]>([]);
  useEffect(() => { setItems(Array.from({ length: 50 }, (_, i) => ({ id: i, s: Math.random() * 22 + 5, l: `${Math.random() * 100}%`, d: Math.random() * 28 + 18, dl: Math.random() * 10, o: Math.random() * 0.16 + 0.06, b: Math.random() > 0.5 ? "50%" : "30% 70% 70% 30% / 30% 30% 70% 70%" }))); }, []);
  return <div className="particles hidden md:block">{items.map((p) => <div key={p.id} className="particle" style={{ width: p.s, height: p.s, left: p.l, animationDuration: `${p.d}s`, animationDelay: `${p.dl}s`, opacity: p.o, borderRadius: p.b }} />)}</div>;
}

export function SuccessState({ kodeTiket, onCopy, copied, onCek }: { kodeTiket: string; onCopy: () => void; copied: boolean; onCek: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <motion.div className="max-w-[420px] w-full bg-white rounded-[20px] border border-[#E8EFFF] p-8 text-center" initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: e }}>
        <motion.div className="w-16 h-16 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center mx-auto mb-5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}><IconShieldCheck size={32} className="text-green-600" /></motion.div>
        <motion.h1 className="font-display text-xl font-semibold text-navy mb-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>Aspirasi terkirim!</motion.h1>
        <motion.p className="font-display text-[28px] font-medium tracking-[0.1em] text-blue mt-3 mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>{kodeTiket}</motion.p>
        <motion.p className="text-[13px] text-gray-400 leading-relaxed mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>Simpan kode ini untuk memantau status aspirasimu</motion.p>
        <motion.div className="flex flex-col gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <button onClick={onCopy} className="bg-gradient-to-br from-blue to-blue-dark text-white rounded-[9px] py-3.5 w-full font-display font-semibold text-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(29,111,255,0.3)] active:scale-95">{copied ? "Tersalin ✓" : "Salin Kode"}</button>
          <button onClick={onCek} className="bg-white text-blue border border-[#DCE8FF] rounded-[9px] py-3.5 w-full font-display font-medium text-sm transition-all duration-500 hover:bg-blue-pale hover:-translate-y-0.5 active:scale-95">Cek Status Aspirasi →</button>
        </motion.div>
      </motion.div>
    </div>
  );
}
