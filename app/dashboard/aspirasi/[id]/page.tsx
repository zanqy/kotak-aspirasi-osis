"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardNav from "@/components/layout/DashboardNav";
import ChatBubble from "@/components/ui/ChatBubble";
import { formatWaktu } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase";
import { IconSend, IconArrowForward } from "@tabler/icons-react";

interface Pesan { id: string; aspirasi_id: string; isi: string; pengirim: "siswa" | "humas"; user_id: string | null; created_at: string; user_name: string | null; }
interface Aspirasi { id: string; kode_tiket: string; isi: string; kategori: string | null; status: "menunggu" | "diproses" | "dibalas" | "diteruskan"; diteruskan_ke: string | null; ditangani_oleh: string | null; penangan_nama: string | null; created_at: string; }

const e = [0.22, 1, 0.36, 1] as const;

export default function AspirasiDetail() {
  const params = useParams(); const id = params.id as string;
  const [aspirasi, setAspirasi] = useState<Aspirasi | null>(null);
  const [pesan, setPesan] = useState<Pesan[]>([]);
  const [loading, setLoading] = useState(true);
  const [balasan, setBalasan] = useState("");
  const [sending, setSending] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const [forwardTo, setForwardTo] = useState("");
  const [userName, setUserName] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [pesan]);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/dashboard/aspirasi/${id}`);
      if (res.ok) { const json = await res.json(); setAspirasi(json.aspirasi); setPesan(json.pesan || []); }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    if (!aspirasi?.id) return;
    const supabase = createBrowserClient();
    const pesanChannel = supabase.channel(`dashboard-pesan-${aspirasi.id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "pesan", filter: `aspirasi_id=eq.${aspirasi.id}` }, async (payload: { new: { id: string; aspirasi_id: string; isi: string; pengirim: string; user_id: string | null; created_at: string } }) => {
      const np = payload.new; let un: string | null = null;
      if (np.pengirim === "humas" && np.user_id) { const r = await supabase.from("users").select("name").eq("id", np.user_id).limit(1); const d = r.data as unknown as { name: string }[] | null; un = d?.[0]?.name || null; }
      setPesan((prev) => prev.some((p) => p.id === np.id) ? prev : [...prev, { id: np.id, aspirasi_id: np.aspirasi_id, isi: np.isi, pengirim: np.pengirim as "siswa" | "humas", user_id: np.user_id, created_at: np.created_at, user_name: un }]);
    }).subscribe();
    const aspirasiChannel = supabase.channel(`dashboard-aspirasi-${aspirasi.id}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "aspirasi", filter: `id=eq.${aspirasi.id}` }, (payload: { new: { status: string; diteruskan_ke: string | null } }) => {
      setAspirasi((prev) => prev ? { ...prev, status: payload.new.status as "menunggu" | "diproses" | "dibalas" | "diteruskan", diteruskan_ke: payload.new.diteruskan_ke } : prev);
    }).subscribe();
    return () => { supabase.removeChannel(pesanChannel); supabase.removeChannel(aspirasiChannel); };
  }, [aspirasi?.id]);

  useEffect(() => {
    const init = async () => {
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) { const d = await sessionRes.json(); if (d.user) setUserName(d.user.name || ""); }
      fetchDetail();
    };
    init();
  }, [id]);

  const handleKirimBalasan = async () => {
    if (!balasan.trim()) return; setSending(true);
    try {
      const res = await fetch(`/api/dashboard/aspirasi/${id}/pesan`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isi: balasan.trim() }) });
      if (res.ok) { const pb = await res.json(); setPesan((prev) => [...prev, pb]); setBalasan(""); fetchDetail(); }
    } catch {} finally { setSending(false); }
  };

  const handleForward = async () => {
    if (!forwardTo.trim()) return;
    try { await fetch(`/api/dashboard/aspirasi/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ diteruskan_ke: forwardTo.trim(), status: "diteruskan" }) }); setShowForward(false); setForwardTo(""); fetchDetail(); } catch {}
  };

  if (loading) return <div className="min-h-screen bg-white"><div className="max-w-[480px] mx-auto"><DashboardNav title="..." subtitle="..." showBack /><div className="px-[18px] py-10 space-y-4 animate-pulse"><div className="h-5 bg-gray-100 rounded w-3/4" /><div className="h-20 bg-gray-100 rounded-[14px]" /><div className="h-20 bg-gray-100 rounded-[14px]" /></div></div></div>;
  if (!aspirasi) return <div className="min-h-screen bg-white"><div className="max-w-[480px] mx-auto"><DashboardNav title="Tidak ditemukan" showBack /><p className="text-[13px] text-gray-400 text-center py-10">Aspirasi tidak ditemukan</p></div></div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[480px] mx-auto pb-4">
        <DashboardNav title={aspirasi.kode_tiket} subtitle={aspirasi.kategori || ""} showBack userName={userName} />
        <div className="border-b border-gray-100">
          <div className="px-[18px] py-2.5 flex items-center justify-between border-b border-gray-100"><span className="text-xs text-gray-400">Masuk</span><span className="text-xs text-navy">{formatWaktu(aspirasi.created_at)}</span></div>
          <div className="px-[18px] py-2.5 flex items-center justify-between border-b border-gray-100"><span className="text-xs text-gray-400">Ditangani oleh</span><span className="text-xs text-navy">{aspirasi.penangan_nama || "—"}</span></div>
          <div className="px-[18px] py-2.5 flex items-center justify-between"><span className="text-xs text-gray-400">Diteruskan ke</span><span className="text-xs text-navy">{aspirasi.diteruskan_ke || "—"}</span></div>
        </div>
        <button onClick={() => setShowForward(!showForward)} className="bg-gray-50 border-[1.5px] border-[#DCE8FF] rounded-xl px-4 py-2.5 text-[13px] text-gray-400 mx-[18px] my-3 w-[calc(100%-36px)] text-left hover:bg-blue-pale hover:border-blue hover:text-blue transition-colors"><IconArrowForward size={14} className="inline mr-1.5" />Teruskan ke divisi lain</button>
        <AnimatePresence>{showForward && (
          <motion.div className="mx-[18px] mb-3 flex gap-2" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: e }}>
            <input type="text" value={forwardTo} onChange={(e) => setForwardTo(e.target.value)} placeholder="Nama divisi..." className="flex-1 bg-gray-50 border-[1.5px] border-[#DCE8FF] rounded-xl px-3.5 py-2.5 text-[13px] text-navy outline-none focus:border-blue" onKeyDown={(e) => e.key === "Enter" && handleForward()} />
            <button onClick={handleForward} className="bg-gradient-to-br from-blue to-blue-dark text-white rounded-xl px-4 py-2.5 text-[13px] font-display font-semibold">Simpan</button>
          </motion.div>
        )}</AnimatePresence>
        <div className="bg-gray-50 px-4 py-4 flex flex-col gap-3 min-h-[200px]">
          <ChatBubble isi={aspirasi.isi} pengirim="kiri" label="Anonim" waktu={formatWaktu(aspirasi.created_at)} />
          {pesan.map((p) => <ChatBubble key={p.id} isi={p.isi} pengirim={p.pengirim === "humas" ? "kanan" : "kiri"} label={p.pengirim === "humas" ? p.user_name || "Humas OSIS" : "Anonim"} waktu={formatWaktu(p.created_at)} />)}
          <div ref={chatEndRef} />
        </div>
        <div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-2">
          <input type="text" value={balasan} onChange={(e) => setBalasan(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleKirimBalasan()} placeholder="Balas sebagai Humas OSIS..." className="flex-1 bg-gray-50 border-[1.5px] border-[#DCE8FF] rounded-xl px-3.5 py-2.5 text-[13px] text-navy outline-none placeholder:text-gray-400 focus:border-blue" />
          <button onClick={handleKirimBalasan} disabled={sending || !balasan.trim()} className="bg-gradient-to-br from-blue to-blue-dark text-white rounded-xl px-4 py-2.5 text-[13px] font-display font-semibold transition-all duration-500 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"><IconSend size={14} /></button>
        </div>
      </div>
    </div>
  );
}
