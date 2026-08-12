"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconArrowLeft,
  IconSearch,
  IconTicket,
  IconAlertCircle,
} from "@tabler/icons-react";
import MessageThread, {
  type Message,
  type SystemNote,
} from "@/components/ui/MessageThread";
import ReplyComposer from "@/components/ui/ReplyComposer";
import { formatWaktu } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase";

interface Pesan {
  id: string;
  isi: string;
  pengirim: "siswa" | "humas";
  created_at: string;
}

interface AspirasiData {
  id: string;
  kode_tiket: string;
  isi: string;
  kategori: string | null;
  status: "menunggu" | "diproses" | "dibalas" | "diteruskan";
  created_at: string;
}

const e = [0.22, 1, 0.36, 1] as const;

/** Map status ke warna badge */
function statusBadgeStyle(
  status: AspirasiData["status"],
): { bg: string; color: string; label: string } {
  switch (status) {
    case "dibalas":
      return {
        bg: "rgba(79,121,66,0.15)",
        color: "var(--ok,#4F7942)",
        label: "Dibalas",
      };
    case "diproses":
      return {
        bg: "rgba(181,84,30,0.13)",
        color: "var(--warn,#B5541E)",
        label: "Diproses",
      };
    case "diteruskan":
      return {
        bg: "rgba(79,121,66,0.15)",
        color: "var(--ok,#4F7942)",
        label: "Diteruskan",
      };
    case "menunggu":
    default:
      return {
        bg: "rgba(224,165,38,0.18)",
        color: "var(--seal-deep,#B5810E)",
        label: "Menunggu",
      };
  }
}

/** Konversi data API ke interface MessageThread */
function pesanToMessages(pesan: Pesan[]): Message[] {
  return pesan.map((p, i) => ({
    id: i + 1,
    role: p.pengirim as "siswa" | "humas",
    senderLabel: p.pengirim === "siswa" ? "Kamu" : "Humas OSIS",
    time: formatWaktu(p.created_at),
    text: p.isi,
  }));
}

/** Bangun systemNotes dari data aspirasi (status awal) + pesan */
function buildSystemNotes(
  aspirasi: AspirasiData,
  pesan: Pesan[],
): SystemNote[] {
  const notes: SystemNote[] = [];
  let idCounter = 1000;

  // System note untuk status awal (surat masuk)
  notes.push({
    id: idCounter++,
    time: formatWaktu(aspirasi.created_at),
    text: "Surat masuk",
  });

  // Deteksi perubahan status dari urutan pesan humas
  // Untuk sederhana: jika ada pesan humas, berarti status berubah ke diproses/dibalas
  const humasMessages = pesan.filter((p) => p.pengirim === "humas");
  if (humasMessages.length > 0) {
    notes.push({
      id: idCounter++,
      time: formatWaktu(humasMessages[0].created_at),
      text: `Status diubah ke ${aspirasi.status === "dibalas" ? "Dibalas" : "Diproses"}`,
    });
  }

  return notes;
}

function CekAspirasiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [kodeInput, setKodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<AspirasiData | null>(null);
  const [pesan, setPesan] = useState<Pesan[]>([]);
  const [sending, setSending] = useState(false);
  const aspirationIdRef = useRef<string | null>(null);
  const queryKode = searchParams.get("kode");

  const fetchData = useCallback(async (kode: string) => {
    setLoading(true);
    setError("");
    setData(null);
    setPesan([]);
    aspirationIdRef.current = null;
    try {
      const res = await fetch(`/api/aspirasi/${encodeURIComponent(kode)}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.aspirasi);
        setPesan(json.pesan || []);
        aspirationIdRef.current = json.aspirasi.id;
      } else {
        setError(
          "Kode tiket tidak ditemukan. Pastikan kode yang kamu masukkan benar.",
        );
      }
    } catch {
      setError("Gagal terhubung ke server. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (queryKode) {
      setKodeInput(queryKode.toUpperCase());
      fetchData(queryKode.toUpperCase());
    }
  }, [queryKode, fetchData]);

  // Realtime subscription
  useEffect(() => {
    if (!aspirationIdRef.current) return;
    const supabase = createBrowserClient();
    const aspirasiId = aspirationIdRef.current;

    const pesanChannel = supabase
      .channel(`cek-pesan-${aspirasiId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pesan",
          filter: `aspirasi_id=eq.${aspirasiId}`,
        },
        (payload) => {
          const np = payload.new as Pesan;
          setPesan((prev) =>
            prev.some((p) => p.id === np.id) ? prev : [...prev, np],
          );
        },
      )
      .subscribe();

    const aspirasiChannel = supabase
      .channel(`cek-aspirasi-${aspirasiId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "aspirasi",
          filter: `id=eq.${aspirasiId}`,
        },
        (payload) => {
          const u = payload.new as AspirasiData;
          setData((prev) => (prev ? { ...prev, status: u.status } : prev));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pesanChannel);
      supabase.removeChannel(aspirasiChannel);
    };
  }, [data?.id]);

  const handleCek = () => {
    if (!kodeInput.trim()) return;
    fetchData(kodeInput.trim().toUpperCase());
  };

  const handleKirimBalasan = async (text: string) => {
    if (!data) return;
    setSending(true);
    try {
      const res = await fetch(`/api/aspirasi/${data.kode_tiket}/pesan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isi: text }),
      });
      if (res.ok) {
        const pb = await res.json();
        setPesan((prev) => [...prev, pb]);
      }
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  const statusStyle = data ? statusBadgeStyle(data.status) : null;
  const messages: Message[] = data ? pesanToMessages(pesan) : [];
  const systemNotes: SystemNote[] = data
    ? buildSystemNotes(data, pesan)
    : [];

  return (
    <div className="min-h-screen bg-[var(--paper,#F1E9D8)]">
      <div className="max-w-[520px] mx-auto px-4 py-6">
        {/* ================================================================
             HEADER
             ================================================================ */}
        <motion.div
          className="flex items-center gap-3 mb-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: e }}
        >
          <button
            onClick={() => router.push("/")}
            className="text-[var(--ink-soft,#6B5F4C)] hover:text-[var(--ink,#2B2620)] transition-colors flex-shrink-0"
          >
            <IconArrowLeft size={20} />
          </button>
          <div>
            <h1
              className="text-[15px] font-semibold text-[var(--ink,#2B2620)]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Cek Aspirasi
            </h1>
            <p className="text-[11px] text-[var(--ink-faint,#A69A80)]">
              Lacak status suratmu
            </p>
          </div>
        </motion.div>

        {/* ================================================================
             STATE: SEBELUM MENCARI (kosong)
             ================================================================ */}
        <AnimatePresence mode="wait">
          {!loading && !error && !data && (
            <motion.div
              key="empty"
              className="flex flex-col items-center gap-5 py-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: e }}
            >
              <div className="text-center">
                <IconTicket
                  size={40}
                  stroke={1}
                  className="mx-auto mb-3 text-[var(--ink-faint,#A69A80)]"
                />
                <p className="text-[13px] text-[var(--ink-soft,#6B5F4C)] leading-relaxed max-w-[300px]">
                  Masukkan kode tiket untuk melihat status suratmu
                </p>
                <p className="text-[11px] text-[var(--ink-faint,#A69A80)] mt-1.5">
                  Contoh:{" "}
                  <span
                    className="font-semibold text-[var(--seal-deep,#B5810E)]"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    ASP-2847
                  </span>
                </p>
              </div>

              <div className="w-full flex gap-2">
                <input
                  type="text"
                  value={kodeInput}
                  onChange={(e) => setKodeInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleCek()}
                  placeholder="ASP-XXXX"
                  className="flex-1 bg-[var(--card,#FBF7EE)] border-[1.5px] border-[var(--line,#D8CBA9)] rounded-[3px] px-4 py-3 text-sm text-[var(--ink,#2B2620)] outline-none uppercase placeholder:text-[var(--ink-faint,#A69A80)] transition-all duration-300 focus:border-[var(--seal-deep,#B5810E)] focus:shadow-[0_0_0_3px_rgba(224,165,38,0.18)]"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                />
                <motion.button
                  onClick={handleCek}
                  className="bg-[var(--ink,#2B2620)] text-[var(--paper,#F1E9D8)] border-none rounded-[3px] px-5 py-3 flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                  whileHover={{ backgroundColor: "#3a332a", y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <IconSearch size={16} stroke={1.5} />
                  Lacak
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ================================================================
               STATE: LOADING
               ================================================================ */}
          {loading && (
            <motion.div
              key="loading"
              className="flex flex-col items-center justify-center py-16 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-8 h-8 border-[2.5px] border-[var(--line,#D8CBA9)] border-t-[var(--seal-deep,#B5810E)] rounded-full animate-spin" />
              <p className="text-[12px] text-[var(--ink-faint,#A69A80)]">
                Mencari tiket...
              </p>
            </motion.div>
          )}

          {/* ================================================================
               STATE: ERROR / TIDAK DITEMUKAN
               ================================================================ */}
          {!loading && error && (
            <motion.div
              key="error"
              className="flex flex-col items-center gap-4 py-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full flex gap-2">
                <input
                  type="text"
                  value={kodeInput}
                  onChange={(e) => setKodeInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleCek()}
                  placeholder="ASP-XXXX"
                  className="flex-1 bg-red-50 border-[1.5px] border-red-300 rounded-[3px] px-4 py-3 text-sm text-red-600 outline-none uppercase"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                />
                <motion.button
                  onClick={handleCek}
                  className="bg-[var(--ink,#2B2620)] text-[var(--paper,#F1E9D8)] border-none rounded-[3px] px-5 py-3 flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                  whileHover={{ backgroundColor: "#3a332a", y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <IconSearch size={16} stroke={1.5} />
                  Lacak
                </motion.button>
              </div>

              <div className="flex items-center gap-2 text-[var(--warn,#B5541E)]">
                <IconAlertCircle size={16} stroke={1.5} />
                <p className="text-[13px] leading-relaxed">{error}</p>
              </div>

              <button
                onClick={() => {
                  setError("");
                  setKodeInput("");
                }}
                className="text-[12px] text-[var(--ink-soft,#6B5F4C)] underline hover:text-[var(--ink,#2B2620)] transition-colors"
              >
                Coba kode lain
              </button>
            </motion.div>
          )}

          {/* ================================================================
               STATE: DATA DITEMUKAN — panel kertas
               ================================================================ */}
          {!loading && !error && data && (
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: e }}
            >
              {/* Panel kertas */}
              <div className="mock-panel paper-stitch paper-fold relative overflow-hidden bg-[var(--card,#FBF7EE)] border border-[var(--line,#D8CBA9)] rounded-[6px] shadow-[var(--shadow-paper,0_1px_0_rgba(43,38,32,0.05),0_18px_40px_-20px_rgba(43,38,32,0.35))]">
                <div className="relative z-[1] px-[18px] pt-[18px] pb-0">
                  {/* ============================================================
                       HEADER TIKET
                       ============================================================ */}
                  <div className="thread-head flex items-center justify-between gap-2.5 pb-3.5 border-b-[1.5px] border-[var(--line,#D8CBA9)] mb-4 flex-wrap">
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] text-[var(--seal-deep,#B5810E)] bg-[rgba(224,165,38,0.08)] border border-[rgba(224,165,38,0.25)] rounded-[3px] px-[11px] py-[5px]"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      <IconTicket size={13} stroke={1.5} />
                      {data.kode_tiket}
                    </span>
                    {statusStyle && (
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.4px] rounded-full px-[10px] py-[3px]"
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                        }}
                      >
                        {statusStyle.label}
                      </span>
                    )}
                  </div>

                  {/* ============================================================
                       UTAS PERCAKAPAN — MessageThread
                       ============================================================ */}
                  <MessageThread
                    messages={messages}
                    systemNotes={systemNotes}
                    emptyMessage="Belum ada percakapan untuk surat ini"
                  />

                  {/* ============================================================
                       REPLY COMPOSER — kondisional
                       ============================================================ */}
                  <ReplyComposer
                    role="siswa"
                    disabled={data.status !== "dibalas"}
                    lockedMessage="Menunggu balasan dari OSIS — kamu bisa membalas begitu humas merespons suratmu."
                    placeholder="Tulis balasan kamu di sini..."
                    onSubmit={handleKirimBalasan}
                  />
                </div>
              </div>

              {/* Info tambahan */}
              <p className="text-[11px] text-[var(--ink-faint,#A69A80)] text-center mt-4">
                Kode tiket dikirim ke emailmu setelah submit aspirasi
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CekAspirasi() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--paper,#F1E9D8)]">
          <div className="max-w-[520px] mx-auto px-4 py-10 space-y-4">
            <div className="h-5 shimmer rounded w-24" />
            <div className="h-12 shimmer rounded-[3px]" />
          </div>
        </div>
      }
    >
      <CekAspirasiContent />
    </Suspense>
  );
}
