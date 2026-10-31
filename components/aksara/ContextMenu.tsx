"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef } from "react";

type ContextMenuProps = {
  open: boolean;
  anchor: { x: number; y: number } | null;
  onEdit: () => void;
  onMove: () => void;
  onRotate: () => void;
  onFront: () => void;
  onBack: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
  onPeek: () => void;
};

export default function ContextMenu({
  open,
  anchor,
  onEdit,
  onMove,
  onRotate,
  onFront,
  onBack,
  onDuplicate,
  onDelete,
  onClose,
  onPeek,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open || !anchor) return null;

  // Position menu to avoid covering the item
  const menuW = 240;
  const menuH = 320;
  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  let left = anchor.x + 20;
  let top = anchor.y - menuH / 2;
  if (left + menuW > vw - 10) left = anchor.x - menuW - 20;
  if (top < 10) top = 10;
  if (top + menuH > vh - 10) top = vh - menuH - 10;

  const btnStyle =
    "w-full text-left px-3 py-2 text-[0.85rem] font-[var(--font-spectral)] text-[#221D15] hover:bg-[#221D15]/5 rounded-[6px] flex items-center gap-2";

  return (
    <div
      ref={menuRef}
      className="fixed z-[120] bg-[#FDFBF4] border border-[#221D15]/20 rounded-[12px] shadow-[0_12px_24px_-8px_rgba(24,20,16,0.4)] p-2 min-w-[220px]"
      style={{ left, top }}
    >
      <p className="px-3 py-1 text-[10px] tracking-[0.16em] uppercase text-[#221D15]/50 font-[var(--font-ibm-plex-mono)]">
        Atur tempelan
      </p>

      <button className={btnStyle} onClick={onEdit}>
        ✏️ Ubah isi & gaya
      </button>
      <button className={btnStyle} onClick={onMove}>
        ✋ Pindah posisi
      </button>
      <button className={btnStyle} onClick={onRotate}>
        ↻ Putar
      </button>

      <div className="border-t border-[#221D15]/10 my-1" />

      <button className={btnStyle} onClick={onFront}>
        ⬆️ Ke depan
      </button>
      <button className={btnStyle} onClick={onBack}>
        ⬇️ Ke belakang
      </button>
      <button className={btnStyle} onClick={onDuplicate}>
        📋 Duplikat
      </button>

      <div className="border-t border-[#221D15]/10 my-1" />

      <button className={`${btnStyle} text-[#C03B21]`} onClick={onDelete}>
        🗑️ Hapus
      </button>

      <div className="border-t border-[#221D15]/10 my-1" />

      <button className={btnStyle} onClick={onPeek}>
        👁 Intip
      </button>
      <button className={btnStyle} onClick={onClose}>
        ✕ Tutup
      </button>
    </div>
  );
}
