"use client";

import { motion } from "framer-motion";
import {
  IconMailOpened,
  IconTicket,
  IconTag,
  IconEyeOff,
  IconRosette,
} from "@tabler/icons-react";
import StatusRail from "./StatusRail";
import MessageThread, { type Message, type SystemNote } from "./MessageThread";
import ReplyComposer from "./ReplyComposer";

interface AspirasiDetailPanelProps {
  aspirasi: {
    id: number;
    code: string;
    category: string;
    text: string;
    status: "baru" | "diteruskan" | "diproses" | "selesai";
    date: string;
  } | null;
  onStatusChange: (newStatus: string) => void;
  messages: Message[];
  systemNotes: SystemNote[];
  onSendReply: (text: string) => void;
}

const statusOptions: { value: string; label: string }[] = [
  { value: "baru", label: "Surat Masuk" },
  { value: "diteruskan", label: "Diteruskan" },
  { value: "diproses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
];

export default function AspirasiDetailPanel({
  aspirasi,
  onStatusChange,
  messages,
  systemNotes,
  onSendReply,
}: AspirasiDetailPanelProps) {
  // ================================================================
  // STATE KOSONG — belum ada aspirasi yang dipilih
  // ================================================================
  if (!aspirasi) {
    return (
      <motion.div
        className="bg-[var(--card,#FBF7EE)] border-[1.5px] border-dashed border-[var(--line,#D8CBA9)] rounded-[6px] py-[60px] px-[26px] text-center text-[var(--ink-faint,#A69A80)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <IconMailOpened
          size={30}
          stroke={1.5}
          className="mx-auto mb-3 block"
        />
        <p className="text-[12.5px] leading-[1.6] max-w-[220px] mx-auto">
          Klik salah satu amplop di map sebelah kiri untuk membukanya di sini.
        </p>
      </motion.div>
    );
  }

  // ================================================================
  // STATE TERISI — surat dibuka
  // ================================================================
  const handleSave = () => {
    const select = document.getElementById(
      "statusSelect"
    ) as HTMLSelectElement | null;
    if (select) {
      onStatusChange(select.value);
    }
  };

  return (
    <div className="opened-envelope" style={{ perspective: 1000 }}>
      <motion.div
        className="letter-sheet bg-[var(--card,#FBF7EE)] border-[1.5px] border-solid border-[var(--line,#D8CBA9)] rounded-[6px] relative p-6 pb-[22px]"
        style={{
          boxShadow:
            "0 1px 0 rgba(43,38,32,0.06), 0 28px 60px -24px rgba(43,38,32,0.45)",
        }}
        initial={{ opacity: 0, transform: "perspective(900px) rotateX(-8deg) translateY(24px) scale(0.98)" }}
        animate={{ opacity: 1, transform: "perspective(900px) rotateX(0deg) translateY(0) scale(1)" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Sudut kertas terlipat — pakai class .paper-fold dari globals.css */}
        <div className="paper-fold" />

        {/* Pin kertas dekoratif */}
        <motion.div
          className="desk-pin absolute -top-2 left-[26px] w-4 h-4 rounded-full z-10"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #d94b3a, #8c2f1d)",
            boxShadow: "0 3px 5px rgba(43,38,32,0.3)",
          }}
          initial={{ opacity: 0, transform: "translateY(-14px) rotate(0deg) scale(0.6)" }}
          animate={{ opacity: 1, transform: "translateY(0) rotate(-8deg) scale(1)" }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
        />

        {/* Stempel pojok */}
        <motion.div
          className="letter-stamp-corner absolute -top-[10px] right-[22px] w-[46px] h-[46px] rounded-full flex items-center justify-center text-center z-10"
          style={{
            background:
              "radial-gradient(circle at 34% 30%, var(--seal,#E0A526), var(--seal-deep,#B5810E))",
            boxShadow: "0 4px 0 rgba(0,0,0,0.15)",
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: 9,
            color: "var(--ink,#2B2620)",
            lineHeight: 1.15,
          }}
          initial={{ opacity: 0, scale: 2, rotate: -14 }}
          animate={{ opacity: 1, scale: 1, rotate: -6 }}
          transition={{
            duration: 0.55,
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.15,
          }}
        >
          SUARA<br />OSIS
        </motion.div>

        {/* Kode tiket */}
        <div
          className="letter-code font-mono text-[11.5px] text-[var(--seal-deep,#B5810E)] inline-flex items-center gap-1.5 px-3 py-[6px] rounded-[3px] mb-[14px]"
          style={{
            background: "rgba(224,165,38,0.08)",
            border: "1px solid rgba(224,165,38,0.25)",
          }}
        >
          <IconTicket size={14} stroke={1.5} />
          {aspirasi.code}
        </div>

        {/* Kategori + tanggal */}
        <div className="letter-cat-date flex items-center gap-2 mb-[14px] text-[11px] text-[var(--ink-faint,#A69A80)] flex-wrap">
          <IconTag size={13} stroke={1.5} />
          {aspirasi.category}
          <span>·</span>
          {aspirasi.date}
        </div>

        {/* Isi surat */}
        <div
          className="letter-body-text font-serif italic text-[14.5px] leading-[1.75] text-[var(--ink,#2B2620)] py-[15px] px-[17px] rounded-[3px] border-l-[3px] border-l-[var(--seal,#E0A526)] mb-5 relative"
          style={{ background: "var(--paper-deep,#E7DCC4)" }}
        >
          {/* Garis-garis kertas halus */}
          <div
            className="absolute inset-0 rounded-[3px] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0, transparent 26px, rgba(43,38,32,0.05) 27px)",
              opacity: 0.5,
            }}
          />
          <span className="relative z-[1]">{aspirasi.text}</span>
        </div>

        {/* Section: Rel Tindak Lanjut */}
        <div className="section-tag text-[10px] font-bold uppercase tracking-[1px] text-[var(--ink-faint,#A69A80)] mb-[10px] flex items-center gap-[6px]">
          Rel Tindak Lanjut
          <span className="h-px bg-[var(--line,#D8CBA9)] flex-1" />
        </div>

        {/* StatusRail */}
        <StatusRail currentStatus={aspirasi.status} />

        {/* Section: Ubah Status */}
        <div className="section-tag text-[10px] font-bold uppercase tracking-[1px] text-[var(--ink-faint,#A69A80)] mb-[10px] flex items-center gap-[6px]">
          Ubah Status
          <span className="h-px bg-[var(--line,#D8CBA9)] flex-1" />
        </div>

        {/* Dropdown status */}
        <select
          id="statusSelect"
          defaultValue={aspirasi.status}
          className="desk-select w-full font-sans text-[13px] text-[var(--ink,#2B2620)] bg-[var(--paper,#F1E9D8)] border-[1.5px] border-[var(--line,#D8CBA9)] rounded-[3px] py-[10px] px-3 mb-3 outline-none cursor-pointer transition-colors duration-300 focus:border-[var(--seal-deep,#B5810E)]"
          style={{
            boxShadow: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow =
              "0 0 0 3px rgba(224,165,38,0.18)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Section: Utas Percakapan */}
        <div className="section-tag text-[10px] font-bold uppercase tracking-[1px] text-[var(--ink-faint,#A69A80)] mb-[10px] flex items-center gap-[6px]">
          Utas Percakapan
          <span className="h-px bg-[var(--line,#D8CBA9)] flex-1" />
        </div>

        <MessageThread
          messages={messages}
          systemNotes={systemNotes}
        />

        <ReplyComposer
          role="humas"
          onSubmit={onSendReply}
        />

        {/* Tombol Segel */}
        <motion.button
          className="btn-seal-desk w-full bg-[var(--ink,#2B2620)] text-[var(--paper,#F1E9D8)] border-none rounded-[3px] py-3 font-serif font-semibold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-colors duration-300 mt-3"
          onClick={handleSave}
          whileHover={{ y: -2, backgroundColor: "#3a332a" }}
          whileTap={{ scale: 0.98 }}
        >
          <IconRosette size={18} stroke={1.5} />
          Segel & simpan perubahan
        </motion.button>

        {/* Footer */}
        <div className="desk-footnote flex justify-between text-[10.5px] text-[var(--ink-faint,#A69A80)] mt-4 pt-[14px] border-t border-dashed border-[var(--line,#D8CBA9)]">
          <span>Arsip internal #{aspirasi.id}</span>
          <span className="flex items-center gap-1">
            <IconEyeOff size={13} stroke={1.5} />
            Pengirim anonim
          </span>
        </div>
      </motion.div>
    </div>
  );
}
