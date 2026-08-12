"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: number;
  badgeText: string;
  icon: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function StatCard({
  label,
  value,
  badgeText,
  icon,
  isActive = false,
  onClick,
}: StatCardProps) {
  const displayValue = useCountUp(value, 800, true);

  return (
    <motion.div
      className={[
        "relative cursor-pointer select-none",
        "bg-card border rounded-[3px]",
        "px-5 pt-[18px] pb-4",
        "shadow-paper",
        "paper-stitch",
        "paper-fold",
        isActive
          ? "border-seal-deep shadow-[0_0_0_2px_rgba(224,165,38,0.25),var(--tw-shadow)]"
          : "border-line",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -4,
        boxShadow:
          "0 1px 0 rgba(43,38,32,0.06), 0 28px 60px -24px rgba(43,38,32,0.45)",
        transition: {
          duration: 0.3,
          ease: [0.34, 1.56, 0.64, 1],
        },
      }}
    >
      {/* Label + icon */}
      <div className="relative z-[1] flex items-center gap-[6px] mb-1">
        <i className={`${icon} text-seal-deep text-[13px]`} />
        <span className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-ink-faint">
          {label}
        </span>
      </div>

      {/* Angka besar */}
      <div className="relative z-[1] font-mono font-bold text-[30px] leading-[1.1] text-ink">
        {displayValue}
      </div>

      {/* Badge stempel */}
      <span className="absolute bottom-3 right-[14px] font-serif font-bold text-[9px] uppercase tracking-[0.5px] text-ink-faint -rotate-[6deg] opacity-55 border border-line rounded-[2px] px-2 py-px bg-paper-deep pointer-events-none">
        {badgeText}
      </span>
    </motion.div>
  );
}
