"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { motion } from "framer-motion";

interface StatCardProps {
  number: number;
  label: string;
  color?: "default" | "yellow" | "green" | "purple";
  animate?: boolean;
}

const colorMap = {
  default: { bg: "bg-blue-pale", text: "text-blue", border: "border-blue/10" },
  yellow: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  green: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
};

export default function StatCard({ number, label, color = "default", animate = false }: StatCardProps) {
  const c = colorMap[color];
  const displayNumber = useCountUp(number, 800, animate);

  return (
    <motion.div
      className={`rounded-[14px] border p-4 flex flex-col ${c.bg} ${c.border}`}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <span className={`text-[26px] font-display font-semibold leading-tight ${c.text}`}>
        {displayNumber}
      </span>
      <span className="text-[12px] text-gray-400 mt-1">{label}</span>
    </motion.div>
  );
}
