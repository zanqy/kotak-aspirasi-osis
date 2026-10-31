"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { IconSend, IconClockHour4 } from "@tabler/icons-react";

interface ReplyComposerProps {
  role: "humas" | "siswa";
  disabled?: boolean;
  lockedMessage?: string;
  placeholder?: string;
  onSubmit: (text: string) => Promise<void> | void;
}

const MAX_CHARS = 2000;

const QUICK_TEMPLATES: Record<string, string[]> = {
  humas: [
    "Terima kasih atas aspirasinya. Kami akan menindaklanjuti dan memberikan balasan terdekat.",
    "Kami telah menerima suratmu. Tim Humas OSIS akan memeriksa isinya dan akan memberikan informasi lebih lanjut.",
    "Terima kasih. Kami akan membahas aspirasi ini.",
  ],
  siswa: [
    "Mohon informasi lebih lanjut mengenai status aspirasi ini.",
    "Terima kasih atas tanggapannya.",
  ],
};

export default function ReplyComposer({
  role,
  disabled = false,
  lockedMessage = "Menunggu balasan dari OSIS — kamu bisa membalas begitu humas merespons suratmu.",
  placeholder,
  onSubmit,
}: ReplyComposerProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Draft auto-save ke localStorage
  const DRAFT_KEY = `katakan_draft_${role}`;
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setText(saved);
    } catch {}
  }, [role, DRAFT_KEY]);

  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, text); } catch {}
  }, [text, DRAFT_KEY]);

  const defaultPlaceholder =
    role === "humas"
      ? "Tulis balasan untuk siswa ini..."
      : "Tulis balasan kamu di sini...";

  const hintText =
    role === "humas"
      ? "Terkirim & tercatat di log aktivitas"
      : "Balasanmu tetap anonim untuk humas";

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await onSubmit(trimmed);
      setText("");
      setShowTemplates(false);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const insertTemplate = (tpl: string) => {
    setText((prev) => (prev ? prev + "\n\n" + tpl : tpl));
    setShowTemplates(false);
    textareaRef.current?.focus();
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
      {/* Quick templates (humas only) */}
      {role === "humas" && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: showTemplates ? "auto" : 0, opacity: showTemplates ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden mb-2"
        >
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-[10px] font-bold uppercase tracking-[0.5px] text-seal-deep hover:text-seal flex items-center gap-1"
            >
              {showTemplates ? "Sembunyikan" : "Templat cepat"}
              <span className="w-2 h-2 border-b border-r border-ink-faint rotate-45" />
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {QUICK_TEMPLATES.humas.map((tpl, i) => (
              <button
                key={i}
                onClick={() => insertTemplate(tpl)}
                className="text-[10px] text-ink-soft bg-paper border border-line rounded-[3px] px-2.5 py-1.5 whitespace-nowrap hover:bg-paper-deep hover:text-ink transition-colors"
                title={tpl}
              >
                {tpl.length > 40 ? tpl.slice(0, 40) + "…" : tpl}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <textarea
        ref={textareaRef}
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

      {/* Character counter */}
      <div className="flex items-center justify-between gap-2.5">
        <span className={`reply-hint text-[11px] ${text.length > MAX_CHARS * 0.9 ? "text-warn" : "text-ink-faint"}`}>
          {text.length} / {MAX_CHARS}
        </span>
        <span className="reply-hint text-[11px] text-ink-faint">{hintText}</span>
        <motion.button
          className="btn-send bg-[var(--ink,#2B2620)] text-[var(--paper,#F1E9D8)] border-none rounded-[3px] py-[9px] px-[18px] flex items-center gap-1.5 cursor-pointer"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
            fontSize: "12.5px",
          }}
          onClick={handleSubmit}
          disabled={sending || text.length === 0 || text.length > MAX_CHARS}
          whileHover={{ backgroundColor: "#3a332a", y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <IconSend size={15} stroke={1.5} />
          {sending
            ? "Kirim..."
            : role === "humas"
              ? "Kirim balasan"
              : "Kirim"}
        </motion.button>
      </div>
    </motion.div>
  );
}
