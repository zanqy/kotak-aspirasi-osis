"use client";

import { motion } from "framer-motion";
import { IconArrowRight } from "@tabler/icons-react";

export interface Message {
  id: number;
  role: "siswa" | "humas";
  senderLabel: string; // "Kamu (Humas)" atau "Siswa (anonim)"
  time: string;
  text: string;
}

export interface SystemNote {
  id: number;
  time: string;
  text: string; // "Status diubah ke Diproses"
}

interface MessageThreadProps {
  messages: Message[];
  systemNotes: SystemNote[];
  emptyMessage?: string; // "Belum ada percakapan untuk surat ini"
}

/** Gabung messages + systemNotes jadi satu list kronologis berdasarkan id */
interface TimelineEntry {
  kind: "message" | "system";
  id: number;
  data: Message | SystemNote;
}

function buildTimeline(
  messages: Message[],
  systemNotes: SystemNote[],
): TimelineEntry[] {
  const items: TimelineEntry[] = [
    ...messages.map((m) => ({ kind: "message" as const, id: m.id, data: m })),
    ...systemNotes.map((s) => ({ kind: "system" as const, id: s.id, data: s })),
  ];
  items.sort((a, b) => a.id - b.id);
  return items;
}

export default function MessageThread({
  messages,
  systemNotes,
  emptyMessage = "Belum ada percakapan untuk surat ini",
}: MessageThreadProps) {
  const timeline = buildTimeline(messages, systemNotes);

  // ================================================================
  // STATE KOSONG
  // ================================================================
  if (timeline.length === 0) {
    return (
      <div
        className="thread-body border-[1.5px] border-solid border-[var(--line,#D8CBA9)] rounded-[4px] bg-[var(--paper,#F1E9D8)] flex items-center justify-center"
        style={{ maxHeight: 280, overflowY: "auto", padding: "4px 14px" }}
      >
        <div className="thread-system-note flex items-center gap-2 py-1.5 w-full">
          <span className="h-px bg-[var(--line,#D8CBA9)] flex-1" />
          <span
            className="text-[9.5px] uppercase tracking-[0.4px] text-[var(--ink-faint,#A69A80)] whitespace-nowrap flex items-center gap-1"
          >
            <IconArrowRight size={11} stroke={1.5} />
            {emptyMessage}
          </span>
          <span className="h-px bg-[var(--line,#D8CBA9)] flex-1" />
        </div>
      </div>
    );
  }

  // ================================================================
  // STATE TERISI
  // ================================================================
  return (
    <div
      className="thread-body border-[1.5px] border-solid border-[var(--line,#D8CBA9)] rounded-[4px] bg-[var(--paper,#F1E9D8)]"
      style={{ maxHeight: 280, overflowY: "auto", padding: "4px 14px" }}
    >
      {timeline.map((entry, i) => {
        if (entry.kind === "system") {
          const sn = entry.data as SystemNote;
          return (
            <motion.div
              key={`sys-${sn.id}`}
              className="thread-system-note flex items-center gap-2 py-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <span className="h-px bg-[var(--line,#D8CBA9)] flex-1" />
              <span
                className="text-[9.5px] uppercase tracking-[0.4px] text-[var(--ink-faint,#A69A80)] whitespace-nowrap flex items-center gap-1"
              >
                <IconArrowRight size={11} stroke={1.5} />
                {sn.text}
              </span>
              <span className="h-px bg-[var(--line,#D8CBA9)] flex-1" />
            </motion.div>
          );
        }

        const msg = entry.data as Message;
        const isHumas = msg.role === "humas";

        return (
          <motion.div
            key={`msg-${msg.id}`}
            className={`letter-entry py-3 border-b border-dashed border-[var(--line,#D8CBA9)] last:border-b-0 ${
              isHumas ? "role-humas" : "role-siswa"
            }`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            {/* Meta: pengirim + waktu */}
            <div className="entry-meta flex items-center justify-between mb-1.5 gap-2">
              <div
                className={`entry-who flex items-center gap-1.5 font-[Fraunces,serif] font-semibold text-[12px] ${
                  isHumas
                    ? "text-[var(--seal-deep,#B5810E)]"
                    : "text-[var(--ink,#2B2620)]"
                }`}
              >
                <span
                  className="who-dot w-[6px] h-[6px] rounded-full flex-shrink-0"
                  style={{
                    background: isHumas
                      ? "var(--seal,#E0A526)"
                      : "var(--ink-faint,#A69A80)",
                  }}
                />
                {msg.senderLabel}
              </div>
              <div
                className="entry-time text-[10px] text-[var(--ink-faint,#A69A80)]"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {msg.time}
              </div>
            </div>

            {/* Isi pesan */}
            <div
              className="entry-text text-[13px] leading-[1.6] text-[var(--ink,#2B2620)]"
              style={
                isHumas
                  ? {
                      background: "var(--paper-deep,#E7DCC4)",
                      padding: "10px 12px",
                      borderRadius: 3,
                      borderLeft: "3px solid var(--seal,#E0A526)",
                      marginLeft: 12,
                    }
                  : {
                      paddingLeft: 12,
                      borderLeft: "3px solid var(--line,#D8CBA9)",
                    }
              }
            >
              {msg.text}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
