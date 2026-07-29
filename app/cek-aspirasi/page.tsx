"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { IconArrowLeft, IconSearch, IconSend } from "@tabler/icons-react";
import ChatBubble from "@/components/ui/ChatBubble";
import Badge from "@/components/ui/Badge";
import { formatWaktu } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase";

interface Pesan { id: string; isi: string; pengirim: "siswa" | "humas"; created_at: string; }
interface AspirasiData { id: string; kode_tiket: string; isi: string; kategori: string | null; status: "menunggu" | "diproses" | "dibalas" | "diteruskan"; created_at: string; }

const e = [0.22, 1, 0.36, 1] as const;

function CekAspirasiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [kodeInput, setKodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<AspirasiData | null>(null);
  const [pesan, setPesan] = useState<Pesan[]>([]);
  const [balasan, setBalasan] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const aspirationIdRef = useRef<string | null>(null);
  const queryKode = searchParams.get("kode");

  const fetchData = useCallback(async (kode: string) => {
    setLoading(true); setError(""); setData(null); setPesan([]); aspirationIdRef.current = null;
    try {
      const res = await fetch(`/api/aspirasi/${encodeURIComponent(kode)}`);
      if (res.ok) { const json = await res.json(); setData(json.aspirasi); setPesan(json.pesan || []); aspirationIdRef.current = json.aspirasi.id; }
      else setError("Kode tiket tidak ditemukan. Pastikan kode yang kamu masukkan benar.");
    } catch { setError("Gagal terhubung ke server"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (queryKode) { setKodeInput(queryKode.toUpperCase()); fetchData(queryKode.toUpperCase()); } }, [queryKode, fetchData]);

  useEffect(() => {
    if (!aspirationIdRef.current) return;
    const supabase = createBrowserClient(); const aspirasiId = aspirationIdRef.current;
    const pesanChannel = supabase.channel(`cek-pesan-${aspirasiId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "pesan", filter: `aspirasi_id=eq.${aspirasiId}` }, (payload) => { const np = payload.new as Pesan; setPesan((prev) => prev.some((p) => p.id === np.id) ? prev : [...prev, np]); }).subscribe();
    const aspirasiChannel = supabase.channel(`cek-aspirasi-${aspirasiId}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "aspirasi", filter: `id=eq.${aspirasiId}` }, (payload) => { const u = payload.new as AspirasiData; setData((prev) => prev ? { ...prev, status: u.status } : prev); }).subscribe();
    return () => { supabase.removeChannel(pesanChannel); supabase.removeChannel(aspirasiChannel); };
  }, [data?.id]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [pesan]);

  const handleCek = () => { if (!kodeInput.trim()) return; fetchData(kodeInput.trim().toUpperCase()); };
  const handleKirimBalasan = async () => {
    if (!balasan.trim() || !data) return; setSending(true);
    try { const res = await fetch(`/api/aspirasi/${data.kode_tiket}/pesan`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isi: balasan.trim() }) }); if (res.ok) { const pb = await res.json(); setPesan((prev) => [...prev, pb]); setBalasan(""); } } catch {} finally { setSending(false); }
  };

  const adaBalasan = data && data.status === "dibalas";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[480px] mx-auto">
        <motion.div className="bg-navy px-[18px] pt-9 pb-4 flex items-center gap-3" initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: e }}>
          <button onClick={() => router.push("/")} className="text-white/60 hover:text-white transition-colors flex-shrink-0"><IconArrowLeft size={20} /></button>
          <div><h1 className="font-display text-[15px] font-semibold text-white">Cek Aspirasi</h1><p className="text-[11px] text-white/50">Humas OSIS</p></div>
        </motion.div>

        {!loading && !error && !data && (
          <motion.div className="px-[18px] py-6 flex flex-col gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: e, delay: 0.5 }}>
            <p className="text-[13px] text-gray-400 leading-relaxed">Masukkan kode tiket yang kamu dapat setelah mengirim aspirasi. Contoh: <span className="font-display font-semibold text-blue">ASP-2847</span></p>
            <input type="text" value={kodeInput} onChange={(e) => setKodeInput(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && handleCek()} placeholder="ASP-XXXX" className="w-full bg-white border-[1.5px] border-[#DCE8FF] rounded-[14px] px-4 py-3.5 text-base font-display font-semibold text-blue tracking-[0.08em] text-center outline-none uppercase placeholder:text-gray-400 focus:border-blue focus:shadow-[0_0_0_4px_rgba(29,111,255,0.06)]" />
            <motion.button onClick={handleCek} className="bg-gradient-to-br from-blue to-blue-dark text-white rounded-[9px] py-3.5 w-full font-display font-semibold text-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(29,111,255,0.3)] active:scale-95" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: e, delay: 0.7 }}><IconSearch size={16} className="inline mr-1.5" />Cek Status</motion.button>
            <p className="text-[12px] text-gray-400 text-center">Kode tiket dikirim ke emailmu setelah submit</p>
          </motion.div>
        )}

        {loading && <div className="px-[18px] py-10 space-y-4">{ [1,2,3].map((i) => <div key={i} className="h-12 shimmer rounded-[14px]" />) }</div>}

        {!loading && error && (
          <motion.div className="px-[18px] py-6 flex flex-col gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <input type="text" value={kodeInput} onChange={(e) => setKodeInput(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && handleCek()} placeholder="ASP-XXXX" className="w-full bg-red-50 border-[1.5px] border-red-300 rounded-[14px] px-4 py-3.5 text-base font-display font-semibold text-red-600 tracking-[0.08em] text-center outline-none uppercase" />
            <motion.p className="text-[13px] text-red-500 text-center leading-relaxed" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.p>
            <button onClick={() => { setError(""); setKodeInput(""); }} className="bg-gradient-to-br from-blue to-blue-dark text-white rounded-[9px] py-3.5 w-full font-display font-semibold text-sm transition-all duration-500 hover:-translate-y-0.5 active:scale-95">Coba Lagi</button>
          </motion.div>
        )}

        {!loading && !error && data && (
          <>
            <motion.div className="border-b border-gray-100 bg-white" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: e }}>
              <div className="px-[18px] py-2.5 flex items-center justify-between border-b border-gray-100"><span className="text-xs text-gray-400">Status</span><Badge status={data.status} /></div>
              <div className="px-[18px] py-2.5 flex items-center justify-between border-b border-gray-100"><span className="text-xs text-gray-400">Dikirim</span><span className="text-xs text-navy">{formatWaktu(data.created_at)}</span></div>
              <div className="px-[18px] py-2.5 flex items-center justify-between"><span className="text-xs text-gray-400">Kategori</span><span className="text-xs text-navy">{data.kategori || "—"}</span></div>
            </motion.div>
            <div className="bg-gray-50 px-4 py-4 flex flex-col gap-3 min-h-[200px]">
              <ChatBubble isi={data.isi} pengirim="kanan" label="Kamu" waktu={formatWaktu(data.created_at)} />
              {pesan.filter((p) => p.pengirim === "humas").length > 0 ? pesan.filter((p) => p.pengirim !== "siswa").map((p) => <ChatBubble key={p.id} isi={p.isi} pengirim="kiri" label="Humas OSIS" waktu={formatWaktu(p.created_at)} />) : (
                <motion.div className="flex flex-col items-center justify-center py-6 gap-2 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}><span className="text-[32px]">💬</span><p className="text-[13px] text-gray-400 text-center leading-relaxed max-w-[260px]">Humas OSIS belum membalas. Kami akan segera menghubungimu.</p></motion.div>
              )}
              {pesan.filter((p) => p.pengirim === "siswa").slice(1).map((p) => <ChatBubble key={p.id} isi={p.isi} pengirim="kanan" label="Kamu" waktu={formatWaktu(p.created_at)} />)}
              <div ref={chatEndRef} />
            </div>
            {adaBalasan ? (
              <motion.div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
                <input type="text" value={balasan} onChange={(e) => setBalasan(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleKirimBalasan()} placeholder="Balas..." className="flex-1 bg-gray-50 border-[1.5px] border-[#DCE8FF] rounded-xl px-3.5 py-2.5 text-[13px] text-navy outline-none placeholder:text-gray-400 focus:border-blue" />
                <button onClick={handleKirimBalasan} disabled={sending || !balasan.trim()} className="bg-gradient-to-br from-blue to-blue-dark text-white rounded-xl px-4 py-2.5 text-[13px] font-display font-semibold transition-all duration-500 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"><IconSend size={14} /></button>
              </motion.div>
            ) : (
              <motion.div className="bg-white border-t border-gray-100 px-4 py-3 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}><span className="text-xs text-gray-400">Balasan akan muncul di sini</span></motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function CekAspirasi() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50"><div className="max-w-[480px] mx-auto px-[18px] py-10 space-y-4"><div className="h-5 shimmer rounded w-24" /><div className="h-12 shimmer rounded-[14px]" /></div></div>}>
      <CekAspirasiContent />
    </Suspense>
  );
}
