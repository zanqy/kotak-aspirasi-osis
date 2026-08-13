"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardNav from "@/components/layout/DashboardNav";
import StatusRail from "@/components/ui/StatusRail";
import MessageThread from "@/components/ui/MessageThread";
import ReplyComposer from "@/components/ui/ReplyComposer";
import { formatWaktu } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase";
import { IconArrowForward, IconArrowLeft } from "@tabler/icons-react";

interface Pesan {
  id: string;
  aspirasi_id: string;
  isi: string;
  pengirim: "siswa" | "humas";
  user_id: string | null;
  created_at: string;
  user_name: string | null;
}
interface Aspirasi {
  id: string;
  kode_tiket: string;
  isi: string;
  kategori: string | null;
  status: "menunggu" | "diproses" | "dibalas" | "diteruskan";
  diteruskan_ke: string | null;
  ditangani_oleh: string | null;
  penangan_nama: string | null;
  created_at: string;
}

const e = [0.22, 1, 0.36, 1] as const;

const kategoriLabels: Record<string, string> = {
  akademik: "Akademik",
  fasilitas: "Fasilitas",
  kegiatan: "Kegiatan",
  lainnya: "Lainnya",
};

export default function AspirasiDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [aspirasi, setAspirasi] = useState<Aspirasi | null>(null);
  const [pesan, setPesan] = useState<Pesan[]>([]);
  const [loading, setLoading] = useState(true);
  const [balasan, setBalasan] = useState("");
  const [sending, setSending] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const [forwardTo, setForwardTo] = useState("");
  const [userName, setUserName] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [pesan]);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/dashboard/aspirasi/${id}`);
      if (res.ok) {
        const json = await res.json();
        setAspirasi(json.aspirasi);
        setPesan(json.pesan || []);
        setSelectedStatus(json.aspirasi?.status || "menunggu");
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    if (!aspirasi?.id) return;
    const supabase = createBrowserClient();
    const pesanChannel = supabase.channel(`dashboard-pesan-${aspirasi.id}`).on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "pesan", filter: `aspirasi_id=eq.${aspirasi.id}` },
      async (payload: { new: { id: string; aspirasi_id: string; isi: string; pengirim: string; user_id: string | null; created_at: string } }) => {
        const np = payload.new;
        let un: string | null = null;
        if (np.pengirim === "humas" && np.user_id) {
          const r = await supabase.from("users").select("name").eq("id", np.user_id).limit(1);
          const d = r.data as unknown as { name: string }[] | null;
          un = d?.[0]?.name || null;
        }
        setPesan((prev) =>
          prev.some((p) => p.id === np.id) ? prev : [...prev, { id: np.id, aspirasi_id: np.aspirasi_id, isi: np.isi, pengirim: np.pengirim as "siswa" | "humas", user_id: np.user_id, created_at: np.created_at, user_name: un }]
        );
      }
    ).subscribe();
    const aspirasiChannel = supabase.channel(`dashboard-aspirasi-${aspirasi.id}`).on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "aspirasi", filter: `id=eq.${aspirasi.id}` },
      (payload: { new: { status: string; diteruskan_ke: string | null } }) => {
        setAspirasi((prev) =>
          prev ? { ...prev, status: payload.new.status as "menunggu" | "diproses" | "dibalas" | "diteruskan", diteruskan_ke: payload.new.diteruskan_ke } : prev
        );
      }
    ).subscribe();
    return () => { supabase.removeChannel(pesanChannel); supabase.removeChannel(aspirasiChannel); };
  }, [aspirasi?.id]);

  useEffect(() => {
    const init = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const d = await sessionRes.json();
          if (d.user) setUserName(d.user.name || "");
        }
      } catch {}
      fetchDetail();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleKirimBalasan = async () => {
    if (!balasan.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/dashboard/aspirasi/${id}/pesan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isi: balasan.trim() }),
      });
      if (res.ok) {
        const pb = await res.json();
        setPesan((prev) => [...prev, pb]);
        setBalasan("");
        fetchDetail();
      }
    } catch {} finally { setSending(false); }
  };

  const handleStatusChange = async () => {
    if (!selectedStatus || !aspirasi) return;
    try {
      await fetch(`/api/dashboard/aspirasi/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });
      fetchDetail();
    } catch {}
  };

  const handleForward = async () => {
    if (!forwardTo.trim()) return;
    try {
      await fetch(`/api/dashboard/aspirasi/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diteruskan_ke: forwardTo.trim(), status: "diteruskan" }),
      });
      setShowForward(false);
      setForwardTo("");
      fetchDetail();
    } catch {}
  };

  // Map status for display
  const mapStatusForRail = (s: string): "baru" | "diteruskan" | "diproses" | "selesai" => {
    if (s === "menunggu") return "baru";
    if (s === "diteruskan") return "diteruskan";
    if (s === "dibalas") return "selesai";
    return "diproses";
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--paper)" }}>
        <DashboardNav title="..." subtitle="..." showBack userName={userName} />
        <div className="max-w-[600px] mx-auto px-5 py-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-paper-deep rounded w-3/4" />
            <div className="h-32 bg-paper-deep rounded" />
            <div className="h-32 bg-paper-deep rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!aspirasi) {
    return (
      <div className="min-h-screen" style={{ background: "var(--paper)" }}>
        <DashboardNav title="Tidak ditemukan" showBack userName={userName} />
        <div className="max-w-[600px] mx-auto px-5 py-16 text-center">
          <p className="text-[13px]" style={{ color: "var(--ink-faint)" }}>Aspirasi tidak ditemukan</p>
        </div>
      </div>
    );
  }

  // Build thread data for MessageThread
  const threadMessages = pesan.map((p) => ({
    id: parseInt(p.id, 10) || 0,
    role: p.pengirim,
    senderLabel: p.pengirim === "humas" ? (p.user_name || "Kamu (Humas)") : "Siswa (anonim)",
    time: formatWaktu(p.created_at),
    text: p.isi,
  }));

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--paper)" }}>
      <DashboardNav
        title={aspirasi.kode_tiket}
        subtitle={kategoriLabels[aspirasi.kategori || "lainnya"] || "Lainnya"}
        showBack
        userName={userName}
      />

      <div className="max-w-[600px] mx-auto px-5 pt-6">
        {/* Letter sheet - surat yang dibuka */}
        <motion.div
          className="bg-card border-[1.5px] border-line rounded-[6px] relative"
          style={{
            boxShadow: "var(--shadow-lift)",
            animation: "unfold 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
          }}
          initial={{ opacity: 0, rotateX: -8, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: e }}
        >
          {/* Sudut kertas terlipat */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-0 h-0"
            style={{
              borderStyle: "solid",
              borderWidth: "0 30px 30px 0",
              borderColor: "transparent var(--paper-deep) transparent transparent",
              filter: "drop-shadow(-2px 2px 3px rgba(43,38,32,0.12))",
              zIndex: 1,
            }}
          />

          {/* Stempel corner */}
          <motion.div
            className="absolute -top-[10px] right-[22px] w-[46px] h-[46px] rounded-full flex items-center justify-center font-serif font-bold text-[9px] text-center leading-tight text-ink"
            style={{
              background: "radial-gradient(circle at 34% 30%, var(--seal), var(--seal-deep))",
              boxShadow: "0 4px 0 rgba(0,0,0,0.15)",
            }}
            initial={{ scale: 2, rotate: -14, opacity: 0 }}
            animate={{ scale: 1, rotate: -6, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1], delay: 0.15 }}
          >
            SUARA<br />OSIS
          </motion.div>

          <div className="relative z-[2] p-6">
            {/* Kode tiket */}
            <div
              className="inline-block font-mono text-[11.5px] mb-4 px-3 py-1.5 rounded-[3px]"
              style={{
                color: "var(--seal-deep)",
                background: "rgba(224,165,38,0.08)",
                border: "1px solid rgba(224,165,38,0.25)",
              }}
            >
              <i className="ti ti-ticket mr-1" />
              {aspirasi.kode_tiket}
            </div>

            {/* Kategori + tanggal */}
            <div className="flex items-center gap-2 mb-4 text-[11px]" style={{ color: "var(--ink-faint)" }}>
              <i className="ti ti-tag" />
              <span>{kategoriLabels[aspirasi.kategori || "lainnya"] || "Lainnya"}</span>
              <span>·</span>
              <span>{formatWaktu(aspirasi.created_at)}</span>
            </div>

            {/* Isi surat */}
            <div
              className="p-4 rounded-[3px] mb-6 italic font-serif text-[14.5px] leading-[1.75]"
              style={{
                background: "var(--paper-deep)",
                borderLeft: "3px solid var(--seal)",
                color: "var(--ink)",
                lineHeight: "1.75",
              }}
            >
              {aspirasi.isi}
            </div>

            {/* Section: Rel proses */}
            <div className="mb-5">
              <div
                className="text-[10px] font-bold uppercase tracking-[1px] mb-3 flex items-center gap-2"
                style={{ color: "var(--ink-faint)" }}
              >
                <span className="flex-1 h-px" style={{ background: "var(--line)" }} />
                Rel Tindak Lanjut
              </div>
              <StatusRail currentStatus={mapStatusForRail(aspirasi.status)} />
            </div>

            {/* Section: Ubah status */}
            <div className="mb-5">
              <div
                className="text-[10px] font-bold uppercase tracking-[1px] mb-3 flex items-center gap-2"
                style={{ color: "var(--ink-faint)" }}
              >
                <span className="flex-1 h-px" style={{ background: "var(--line)" }} />
                Ubah Status
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex-1 bg-paper border-[1.5px] border-line rounded-[3px] px-3 py-2.5 text-[13px] outline-none"
                  style={{
                    color: "var(--ink)",
                    transition: "border-color 0.3s ease",
                  }}
                >
                  <option value="menunggu">Surat Masuk</option>
                  <option value="diproses">Diproses</option>
                  <option value="dibalas">Dibalas</option>
                  <option value="diteruskan">Diteruskan</option>
                </select>
                <button
                  onClick={handleStatusChange}
                  className="px-4 py-2.5 font-serif font-semibold text-[13px] text-paper rounded-[3px] transition-all"
                  style={{ background: "var(--ink)" }}
                >
                  Simpan
                </button>
              </div>
            </div>

            {/* Tombol teruskan */}
            <button
              onClick={() => setShowForward(!showForward)}
              className="w-full border-[1.5px] rounded-[3px] px-4 py-2.5 text-[12px] text-left mb-3 flex items-center gap-1.5 transition-all"
              style={{
                borderColor: "var(--line)",
                color: "var(--ink-soft)",
                background: "transparent",
              }}
            >
              <IconArrowForward size={14} />
              Teruskan ke divisi lain
            </button>

            <AnimatePresence>
              {showForward && (
                <motion.div
                  className="flex gap-2 mb-4"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: e }}
                >
                  <input
                    type="text"
                    value={forwardTo}
                    onChange={(e) => setForwardTo(e.target.value)}
                    placeholder="Nama divisi..."
                    className="flex-1 bg-paper border-[1.5px] border-line rounded-[3px] px-3.5 py-2.5 text-[13px] outline-none"
                    style={{ color: "var(--ink)" }}
                    onKeyDown={(e) => e.key === "Enter" && handleForward()}
                  />
                  <button
                    onClick={handleForward}
                    className="px-4 py-2.5 font-serif font-semibold text-[13px] text-paper rounded-[3px]"
                    style={{ background: "var(--seal-deep)" }}
                  >
                    Kirim
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info footer */}
            <div
              className="flex justify-between text-[10.5px] pt-4 border-t border-dashed"
              style={{ borderColor: "var(--line)", color: "var(--ink-faint)" }}
            >
              <span>Arsip internal #{aspirasi.id.slice(0, 8)}</span>
              <span><i className="ti ti-eye-off mr-1" />Pengirim anonim</span>
            </div>
          </div>
        </motion.div>

        {/* Section: Utas percakapan */}
        <div className="mt-6">
          <div
            className="text-[10px] font-bold uppercase tracking-[1px] mb-3 flex items-center gap-2"
            style={{ color: "var(--ink-faint)" }}
          >
            <span className="flex-1 h-px" style={{ background: "var(--line)" }} />
            Utas Percakapan
          </div>

          <MessageThread
            messages={threadMessages}
            systemNotes={[]}
            emptyMessage="Belum ada percakapan untuk surat ini"
          />

          <div className="mt-0">
            <ReplyComposer
              role="humas"
              onSubmit={handleKirimBalasan}
            />
          </div>
        </div>
      </div>

      <div ref={chatEndRef} />
    </div>
  );
}
