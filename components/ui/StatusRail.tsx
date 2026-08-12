"use client";

import { motion } from "framer-motion";
import { IconCheck } from "@tabler/icons-react";

interface StatusRailProps {
  currentStatus: "baru" | "diteruskan" | "diproses" | "selesai";
}

const stages = ["baru", "diteruskan", "diproses", "selesai"] as const;
const labels: Record<(typeof stages)[number], string> = {
  baru: "Surat Masuk",
  diteruskan: "Diteruskan",
  diproses: "Diproses",
  selesai: "Selesai",
};

export default function StatusRail({ currentStatus }: StatusRailProps) {
  const currentIdx = stages.indexOf(currentStatus);

  return (
    <div className="relative flex justify-between mb-[22px] px-1">
      {/* Garis putus-putus horizontal di belakang */}
      <div
        className="absolute top-[14px] left-[5%] right-[5%] h-[1.5px] z-0"
        style={{
          background:
            "repeating-linear-gradient(90deg, var(--line, #D8CBA9) 0 8px, transparent 8px 14px)",
        }}
      />

      {stages.map((stage, i) => {
        const isDone = i < currentIdx;
        const isNow = i === currentIdx;

        return (
          <motion.div
            key={stage}
            className="relative z-[1] flex flex-col items-center text-center flex-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.1 * i,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Dot */}
            <motion.div
              className={`w-[28px] h-[28px] rounded-full border-[1.5px] flex items-center justify-center font-mono font-bold text-[11px] mb-2 transition-colors duration-300 ${
                isDone
                  ? "bg-[var(--seal,#E0A526)] border-[var(--seal,#E0A526)] text-[var(--ink,#2B2620)]"
                  : isNow
                    ? "bg-[var(--ink,#2B2620)] border-[var(--ink,#2B2620)] text-[var(--paper,#F1E9D8)]"
                    : "bg-[var(--card,#FBF7EE)] border-[var(--ink,#2B2620)] text-[var(--ink-faint,#A69A80)]"
              }`}
              animate={
                isNow
                  ? { scale: [1, 1.1, 1.1] }
                  : { scale: 1 }
              }
              transition={
                isNow
                  ? { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
                  : undefined
              }
            >
              {isDone || isNow ? (
                <IconCheck size={14} stroke={2.5} />
              ) : (
                i + 1
              )}
            </motion.div>

            {/* Label */}
            <span
              className={`text-[9px] uppercase tracking-[0.4px] leading-[1.3] max-w-[70px] ${
                isDone || isNow
                  ? "text-[var(--ink,#2B2620)] font-bold"
                  : "text-[var(--ink-faint,#A69A80)]"
              }`}
            >
              {labels[stage]}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
