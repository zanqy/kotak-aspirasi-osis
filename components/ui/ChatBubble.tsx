"use client";

import { motion } from "framer-motion";

interface ChatBubbleProps {
  isi: string;
  pengirim: "kiri" | "kanan";
  label: string;
  waktu: string;
}

export default function ChatBubble({ isi, pengirim, label, waktu }: ChatBubbleProps) {
  const isKanan = pengirim === "kanan";
  return (
    <motion.div
      className={`flex flex-col ${isKanan ? "items-end" : "items-start"} gap-1`}
      initial={{ opacity: 0, x: isKanan ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={`max-w-[80%] px-3.5 py-2.5 text-[13px] leading-[1.6] ${
          isKanan
            ? "bg-blue text-white rounded-[18px_18px_4px_18px]"
            : "bg-white text-navy border border-[#DCE8FF] rounded-[18px_18px_18px_4px]"
        }`}
      >
        {isi}
      </div>
      <div className={`flex items-center gap-1.5 px-1 text-[11px] ${isKanan ? "flex-row-reverse" : "flex-row"}`}>
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-400/50">·</span>
        <span className="text-gray-400/70">{waktu}</span>
      </div>
    </motion.div>
  );
}
