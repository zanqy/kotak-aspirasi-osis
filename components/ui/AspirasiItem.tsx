"use client";

import Badge from "./Badge";
import { formatWaktu } from "@/lib/utils";

interface AspirasiItemProps {
  kode: string;
  waktu: string;
  preview: string;
  status: "menunggu" | "diproses" | "dibalas" | "diteruskan";
  kategori: string;
  onClick?: () => void;
}

export default function AspirasiItem({
  kode,
  waktu,
  preview,
  status,
  kategori,
  onClick,
}: AspirasiItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-[18px] py-3.5 border-b border-[#f0f7fa] hover:bg-[#f4f9fc] transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-medium text-[#49769f]">{kode}</span>
        <span className="text-[11px] text-[#a8c8d4]">{formatWaktu(waktu)}</span>
      </div>
      <p className="text-[13px] text-[#1a3d47] leading-[1.5] line-clamp-2 mb-2">
        {preview}
      </p>
      <div className="flex items-center gap-2">
        <Badge status={status} />
        {kategori && (
          <span className="text-[11px] text-[#6ea2b3] bg-[#f4f9fc] rounded-full px-2.5 py-0.5">
            {kategori}
          </span>
        )}
      </div>
    </button>
  );
}