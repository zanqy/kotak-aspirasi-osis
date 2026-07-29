"use client";

import { formatWaktu } from "@/lib/utils";
import Badge from "./Badge";
import { IconChevronRight } from "@tabler/icons-react";

interface AspirasiItemProps {
  kode: string;
  waktu: string;
  preview: string;
  status: "menunggu" | "diproses" | "dibalas" | "diteruskan";
  kategori: string;
  onClick?: () => void;
}

export default function AspirasiItem({ kode, waktu, preview, status, kategori, onClick }: AspirasiItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-[18px] py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-center gap-3"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-display font-semibold text-blue">{kode}</span>
          <span className="text-[11px] text-gray-400">{formatWaktu(waktu)}</span>
        </div>
        <p className="text-[13px] text-navy leading-[1.5] line-clamp-2 mb-1.5">{preview}</p>
        <div className="flex items-center gap-2">
          <Badge status={status} />
          {kategori && (
            <span className="text-[11px] text-gray-400 bg-gray-100 rounded-full px-2.5 py-0.5">{kategori}</span>
          )}
        </div>
      </div>
      <IconChevronRight size={16} className="text-gray-400 flex-shrink-0" />
    </button>
  );
}
