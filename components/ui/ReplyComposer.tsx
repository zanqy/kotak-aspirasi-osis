"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { IconSend, IconClockHour4 } from "@tabler/icons-react";

interface ReplyComposerProps {
  role: "humas" | "siswa";
  disabled?: boolean; // untuk sisi siswa, terkunci kalau status ≠ 'dibalas'
  lockedMessage?: string; // "Menunggu balasan dari OSIS — kamu bisa membalas begitu humas merespons suratmu."
  placeholder?: string;
  onSubmit: (text: string) => void;
}

export default function ReplyComposer({
  role,
  disabled = false,
  lockedMessage = "Menunggu balasan dari OSIS — kamu bisa membalas begitu humas merespons suratmu.",
  placeholder,
  onSubmit,
}: ReplyComposerProps) {
  const [text, setText] = useState("");

  const defaultPlaceholder =
    role === "humas"
      ? "Tulis balasan untuk siswa ini..."
      : "Tulis balasan kamu di sini...";

  const hintText =
    role === "humas"
      ? "Terkirim & tercatat di log aktivitas"
      : "Balasanmu tetap anonim untuk humas";

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ================================================================
  // STATE TERKUNCI — disabled = true
  // ================================================================
  if (disabled) {
    return (
      <motion.div
        className="reply-locked flex items-center gap-2.5 py-3 border-t-[1.5px] border-solid border-[var(--line,#D8CBA9)] text-[12px] text-[var(--ink-faint,#A69A80)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <IconClockHour4 size={18} stroke={1.5} />
        <span>{lockedMessage}</span>
      </motion.div>
    );
  }

  // ================================================================
  // STATE NORMAL — textarea + tombol kirim
  // ================================================================
  return (
    <motion.div
      className="reply-form py-3 border-t-[1.5px] border-solid border-[var(--line,#D8CBA9)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <textarea
        className="w-full font-sans text-[13px] text-[var(--ink,#2B2620)] bg-[var(--paper,#F1E9D8)] border-[1.5px] border-[var(--line,#D8CBA9)] rounded-[3px] py-2.5 px-3 min-h-[64px] resize-y outline-none mb-2.5 transition-all duration-300"
        style={{ boxShadow: "none" }}
        placeholder={placeholder || defaultPlaceholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--seal-deep,#B5810E)";
          e.currentTarget.style.boxShadow =
            "0 0 0 3px rgba(224,165,38,0.18)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--line,#D8CBA9)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />

      <div className="reply-form-foot flex items-center justify-between gap-2.5">
        <span className="reply-hint text-[11px] text-[var(--ink-faint,#A69A80)]">
          {hintText}
        </span>
        <motion.button
          className="btn-send bg-[var(--ink,#2B2620)] text-[var(--paper,#F1E9D8)] border-none rounded-[3px] py-[9px] px-[18px] flex items-center gap-1.5 cursor-pointer"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
            fontSize: "12.5px",
          }}
          onClick={handleSubmit}
          whileHover={{ backgroundColor: "#3a332a", y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <IconSend size={15} stroke={1.5} />
          {role === "humas" ? "Kirim balasan" : "Kirim"}
        </motion.button>
      </div>
    </motion.div>
  );
}
