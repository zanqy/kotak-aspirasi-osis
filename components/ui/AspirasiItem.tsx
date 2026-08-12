"use client";

import { motion, Variants } from "framer-motion";
import { IconMail, IconMailOpened } from "@tabler/icons-react";

interface AspirasiItemProps {
  id: number;
  code: string;            // kode tiket, e.g. "OSIS-7F3K9QZ2A"
  category: string;        // label kategori
  excerpt: string;         // potongan isi surat (max 2 baris)
  status: 'baru' | 'diproses' | 'diteruskan' | 'selesai';
  date: string;            // "2 jam lalu", "1 hari lalu"
  isUnread: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const waxChipStyles: Record<AspirasiItemProps['status'], string> = {
  baru: 'bg-[rgba(224,165,38,0.18)] text-seal-deep',
  diteruskan: 'bg-[rgba(107,95,76,0.15)] text-ink-soft',
  diproses: 'bg-[rgba(181,84,30,0.13)] text-warn',
  selesai: 'bg-[rgba(79,121,66,0.15)] text-ok',
};

const waxChipLabels: Record<AspirasiItemProps['status'], string> = {
  baru: 'Baru',
  diproses: 'Diproses',
  diteruskan: 'Diteruskan',
  selesai: 'Selesai',
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function AspirasiItem({
  id,
  code,
  category,
  excerpt,
  status,
  date,
  isUnread,
  isSelected,
  onClick,
}: AspirasiItemProps) {
  return (
    <motion.button
      onClick={onClick}
      variants={itemVariants}
      className={[
        // Base envelope-item
        "flex items-start gap-[14px] mx-[18px] mb-[14px] px-4 py-[14px]",
        "bg-paper border-[1.5px] border-line rounded-[4px]",
        "cursor-pointer relative text-left w-[calc(100%-36px)]",
        "transition-transform duration-[250ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "transition-[border-color,box-shadow] duration-[250ms] ease",
        // Hover
        "hover:translate-x-[3px] hover:border-ink-faint",
        // Selected
        isSelected && "!border-seal-deep !bg-card shadow-[0_0_0_2px_rgba(224,165,38,0.16)]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Lipatan flap amplop mini — pseudo ::before via div absolute */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 w-0 h-0"
        style={{
          borderStyle: "solid",
          borderWidth: "14px 14px 0 0",
          borderColor: "var(--line) transparent transparent transparent",
          borderRadius: "4px 0 0 0",
        }}
      />

      {/* Indikator unread dot — pseudo ::after via div absolute */}
      {isUnread && (
        <div
          aria-hidden="true"
          className="absolute top-[14px] right-[14px] w-2 h-2 rounded-full bg-seal"
          style={{ boxShadow: "0 0 0 3px rgba(224,165,38,0.25)" }}
        />
      )}

      {/* Lingkaran seal di kiri */}
      <div
        className={[
          "w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[15px]",
          "transition-[background,color] duration-[250ms] ease",
          isUnread
            ? "bg-seal text-ink"
            : "bg-paper-deep text-ink-soft",
        ].join(" ")}
      >
        {isUnread ? <IconMail size={16} /> : <IconMailOpened size={16} />}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Top row: kode + chip */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-mono text-[10.5px] text-ink-faint tracking-[0.4px]">
            {code}
          </span>
          <span
            className={[
              "text-[9.5px] font-bold uppercase tracking-[0.3px]",
              "px-[9px] py-[3px] rounded-full flex-shrink-0 whitespace-nowrap",
              "inline-flex items-center gap-1",
              waxChipStyles[status],
            ].join(" ")}
          >
            {waxChipLabels[status]}
          </span>
        </div>

        {/* Cuplikan isi */}
        <p
          className={[
            "text-[13px] leading-[1.45] line-clamp-2",
            isUnread ? "text-ink font-medium" : "text-ink-soft",
          ].join(" ")}
        >
          {excerpt}
        </p>

        {/* Footer: kategori + tanggal */}
        <div className="flex items-center gap-[10px] mt-[7px] text-[10.5px] text-ink-faint">
          <span>{category}</span>
          <span>{date}</span>
        </div>
      </div>
    </motion.button>
  );
}
