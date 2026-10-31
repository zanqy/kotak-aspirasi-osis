"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";

type CtxProps = {
  open: boolean;
  rot: number;
  scale: number;
  canFlip: boolean;
  moreOpen: boolean;
  peeked: boolean;
  onRot: (v: number) => void;
  onRotCommit: () => void;
  onBig: () => void;
  onSmall: () => void;
  onFlip: () => void;
  onPeek: () => void;
  onMore: () => void;
  onEdit: () => void;
  onMove: () => void;
  onFront: () => void;
  onBack: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
  onShowMenu: () => void;
};

/**
 * Menu kontekstual — struktur & kelas sama dengan referensi (aksara/index.html):
 * slider sudut, ±15°, luruskan, besar/kecil/balik, Intip/Lainnya, ubah, pindah,
 * depan/belakang/duplikat, hapus. Tanpa emoji.
 */
export default function ContextMenu(p: CtxProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; bottom: boolean } | null>(null);

  useEffect(() => {
    if (!p.open || p.peeked) return;
    function place() {
      const el = menuRef.current;
      const anchor = (window as any).__aksaraCtxAnchor as DOMRect | null;
      if (!el || !anchor) return;
      el.style.left = "-9999px";
      el.style.top = "-9999px";
      const mw = el.offsetWidth, mh = el.offsetHeight;
      const vw = window.innerWidth, vh = window.innerHeight;
      const gap = 22, pad = 8;
      const cx = anchor.left + anchor.width / 2, cy = anchor.top + anchor.height / 2;
      const rad = Math.sqrt(anchor.width ** 2 + anchor.height ** 2) / 2 + 8;
      const zone = { left: cx - rad, top: cy - rad, right: cx + rad, bottom: cy + rad };
      const hits = (a: any, b: any, m: number) =>
        !(a.right + m < b.left || a.left - m > b.right || a.bottom + m < b.top || a.top - m > b.bottom);
      const spots: [number, number][] = [
        [cx - mw / 2, anchor.top - mh - gap],
        [cx - mw / 2, anchor.bottom + gap],
        [anchor.right + gap, cy - mh / 2],
        [anchor.left - mw - gap, cy - mh / 2],
        [anchor.right + gap, anchor.top],
        [anchor.left - mw - gap, anchor.top],
        [anchor.right + gap, anchor.bottom - mh],
        [anchor.left - mw - gap, anchor.bottom - mh],
      ];
      for (const [sx, sy] of spots) {
        const L = Math.max(pad, Math.min(vw - mw - pad, sx));
        const T = Math.max(pad, Math.min(vh - mh - pad, sy));
        el.style.left = `${Math.round(L)}px`;
        el.style.top = `${Math.round(T)}px`;
        if (!hits(el.getBoundingClientRect(), zone, 12)) {
          setPos({ left: L, top: T, bottom: false });
          return;
        }
      }
      setPos({ left: 0, top: 0, bottom: true });
    }
    const t = setTimeout(place, 30);
    return () => clearTimeout(t);
  }, [p.open, p.peeked, p.moreOpen, p.rot]);

  useEffect(() => {
    if (!p.open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") p.onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [p.open, p.onClose]);

  if (!p.open) return null;

  return (
    <div className="aksara-v1">
      <div className="ctx open" onClick={p.onClose} />
      <div
        ref={menuRef}
        className={`ctxMenu open${pos?.bottom ? " bottom" : ""}${p.peeked ? " peeked" : ""}`}
        style={pos && !pos.bottom ? { left: pos.left, top: pos.top } : undefined}
      >
        <p className="cmTitle">Atur tempelan</p>

        <div className="cmRot">
          <label>
            Sudut <span>{Math.round(p.rot)}°</span>
          </label>
          <input
            type="range" min={-180} max={180} step={1} value={Math.round(p.rot)}
            onChange={(e) => p.onRot(Number(e.target.value))}
            onPointerUp={p.onRotCommit} onTouchEnd={p.onRotCommit}
          />
          <div className="cmRow">
            <button type="button" onClick={() => { p.onRot(Math.max(-180, Math.round(p.rot) - 15)); p.onRotCommit(); }}>↺ 15°</button>
            <button type="button" onClick={() => { p.onRot(Math.min(180, Math.round(p.rot) + 15)); p.onRotCommit(); }}>↻ 15°</button>
            <button type="button" onClick={() => { p.onRot(0); p.onRotCommit(); }}>Luruskan</button>
          </div>
          <div className="cmRow">
            <button type="button" onClick={p.onBig}>＋ Besar</button>
            <button type="button" onClick={p.onSmall}>− Kecil</button>
            {p.canFlip && <button type="button" onClick={p.onFlip}>⇋ Balik</button>}
          </div>
        </div>

        <hr />
        <div className="cmRow">
          <button type="button" onClick={p.onPeek}>◉ Intip</button>
          <button type="button" onClick={p.onMore}>{p.moreOpen ? "⋯ Tutup" : "⋯ Lainnya"}</button>
        </div>
        <button type="button" onClick={p.onEdit}>✎ Ubah isi & gaya</button>
        <button type="button" onClick={p.onMove}>✥ Pindah posisi</button>
        {p.moreOpen && (
          <div id="cmMore">
            <button type="button" onClick={p.onFront}>↑ Kirim ke depan</button>
            <button type="button" onClick={p.onBack}>↓ Kirim ke belakang</button>
            <button type="button" onClick={p.onDuplicate}>⧉ Duplikat</button>
          </div>
        )}
        <hr />
        <button type="button" className="danger" onClick={p.onDelete}>× Hapus</button>
      </div>
      {p.peeked && (
        <button id="menuShow" onClick={p.onShowMenu}>☰ Tampilkan menu</button>
      )}
    </div>
  );
}
