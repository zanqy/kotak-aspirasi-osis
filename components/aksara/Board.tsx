"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useEffect, useCallback, useState } from "react";
import { buildItem } from "@/lib/aksara/v1-render";

const BOARD_W = 1800;
const BOARD_H = 1200;
const MAX_SCALE = 4;
const MIN_SCALE = 0.25;

type BoardItem = {
  id?: string;
  kind: string;
  x: number;
  y: number;
  rot?: number;
  scale?: number;
  [k: string]: any;
};

type BoardProps = {
  items: BoardItem[];
  onItemTap?: (item: BoardItem) => void;
  onItemLongPress?: (item: BoardItem, el: HTMLElement) => void;
  onBoardTap?: (x: number, y: number) => void;
  onClear?: () => void;
  canEdit?: boolean;
  folioLabel?: string;
};

export default function Board({ items, onItemTap, onItemLongPress, onBoardTap, onClear, canEdit, folioLabel }: BoardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const view = useRef({ x: 0, y: 0, s: 0.5 });
  const lastBgScale = useRef(0);
  const [count, setCount] = useState(items.length);
  const [ready, setReady] = useState(false);

  // ---------- gesture state ----------
  const drag = useRef({ active: false, x: 0, y: 0 });
  const pinch = useRef<{ id: number; x: number; y: number }[]>([]);
  const longTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moved = useRef(false);

  // ---------- view maths ----------
  const measure = useCallback(() => {
    const el = stageRef.current;
    if (!el) return { w: 0, h: 0 };
    return { w: el.clientWidth, h: el.clientHeight };
  }, []);

  const applyView = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const v = view.current;
    canvas.style.transform = `translate(${v.x}px,${v.y}px) scale(${v.s})`;
    if (v.s !== lastBgScale.current) {
      canvas.style.setProperty("--gs", `${128 / v.s}px`);
      lastBgScale.current = v.s;
    }
  }, []);

  const clampView = useCallback(() => {
    const { w, h } = measure();
    if (!w || !h) return;
    const v = view.current;
    const bw = BOARD_W * v.s;
    const bh = BOARD_H * v.s;
    v.x = bw <= w ? (w - bw) / 2 : Math.min(0, Math.max(w - bw, v.x));
    v.y = bh <= h ? (h - bh) / 2 : Math.min(0, Math.max(h - bh, v.y));
  }, [measure]);

  /** tampilan awal: papan mengisi bingkai penuh (bisa digeser) */
  const fit = useCallback(() => {
    const { w, h } = measure();
    if (!w || !h) return;
    const s = Math.max(w / BOARD_W, h / BOARD_H);
    const v = view.current;
    v.s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
    v.x = (w - BOARD_W * v.s) / 2;
    v.y = (h - BOARD_H * v.s) / 2;
    applyView();
    setReady(true);
  }, [measure, applyView]);

  const showAll = useCallback(() => {
    const { w, h } = measure();
    if (!w || !h) return;
    const s = Math.min(w / BOARD_W, h / BOARD_H) * 0.94;
    const v = view.current;
    v.s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
    v.x = (w - BOARD_W * v.s) / 2;
    v.y = (h - BOARD_H * v.s) / 2;
    applyView();
  }, [measure, applyView]);

  const zoomAt = useCallback(
    (cx: number, cy: number, factor: number) => {
      const v = view.current;
      const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.s * factor));
      const ratio = ns / v.s;
      v.x = cx - (cx - v.x) * ratio;
      v.y = cy - (cy - v.y) * ratio;
      v.s = ns;
      clampView();
      applyView();
    },
    [clampView, applyView]
  );

  // ---------- grain (tekstur kertas, digambar sekali) ----------
  useEffect(() => {
    try {
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      const n = Math.round(128 * dpr);
      const c = document.createElement("canvas");
      c.width = c.height = n;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const img = ctx.createImageData(n, n);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const val = 105 + Math.random() * 60;
        d[i] = d[i + 1] = d[i + 2] = val;
        d[i + 3] = 4 + Math.random() * 14;
      }
      ctx.putImageData(img, 0, 0);
      rootRef.current?.style.setProperty("--grain", `url("${c.toDataURL("image/png")}")`);
    } catch {
      /* tanpa tekstur pun tetap jalan */
    }
  }, []);

  const ordered = [...items].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));

  // ---------- render tempelan (DOM asli dari renderer v1) ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.innerHTML = "";
    setCount(items.length);

    ordered.forEach((it) => {
      let el: HTMLElement;
      try {
        el = buildItem(it as any);
      } catch (err) {
        console.error("buildItem gagal", (it as any).kind, err);
        return;
      }
      el.addEventListener("pointerdown", (e: PointerEvent) => {
        e.stopPropagation();
        moved.current = false;
        const startX = e.clientX;
        const startY = e.clientY;

        if (longTimer.current) clearTimeout(longTimer.current);
        longTimer.current = setTimeout(() => {
          if (!moved.current) onItemLongPress?.(it, el);
        }, 450);

        const onMove = (ev: PointerEvent) => {
          if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > 6) {
            moved.current = true;
            if (longTimer.current) {
              clearTimeout(longTimer.current);
              longTimer.current = null;
            }
          }
        };
        const onUp = () => {
          if (longTimer.current) {
            clearTimeout(longTimer.current);
            longTimer.current = null;
          }
          if (!moved.current) onItemTap?.(it);
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      });
      canvas.appendChild(el);
    });
  }, [items, onItemTap, onItemLongPress]);

  // ---------- fit saat ukuran berubah ----------
  useEffect(() => {
    const t1 = setTimeout(fit, 30);
    const t2 = setTimeout(fit, 300);
    const el = stageRef.current;
    const ro = el ? new ResizeObserver(() => fit()) : null;
    if (el && ro) ro.observe(el);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro?.disconnect();
    };
  }, [fit]);

  // ---------- pan + ketuk papan kosong ----------
  const downAt = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest(".item")) return;
    drag.current = { active: true, x: e.clientX, y: e.clientY };
    downAt.current = { x: e.clientX, y: e.clientY };
    stageRef.current?.classList.add("grabbing");
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      drag.current.x = e.clientX;
      drag.current.y = e.clientY;
      view.current.x += dx;
      view.current.y += dy;
      clampView();
      applyView();
    },
    [clampView, applyView]
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const wasDrag = drag.current.active;
    drag.current.active = false;
    stageRef.current?.classList.remove("grabbing");
    const d = downAt.current;
    downAt.current = null;
    if (!wasDrag || !d || !onBoardTap) return;
    const moved = Math.hypot(e.clientX - d.x, e.clientY - d.y);
    const t = e.target as HTMLElement;
    if (moved > 6 || (t.closest && t.closest(".item"))) return;
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    const v = view.current;
    const bx = Math.round((e.clientX - r.left - v.x) / v.s);
    const by = Math.round((e.clientY - r.top - v.y) / v.s);
    onBoardTap(bx, by);
  }, [onBoardTap]);

  // ---------- zoom roda ----------
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
      const r = stage.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.12 : 1 / 1.12);
    },
    [zoomAt]
  );

  // ---------- pinch ----------
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinch.current = [
        { id: e.touches[0].identifier, x: e.touches[0].clientX, y: e.touches[0].clientY },
        { id: e.touches[1].identifier, x: e.touches[1].clientX, y: e.touches[1].clientY },
      ];
    }
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 2 || pinch.current.length !== 2) return;
      const stage = stageRef.current;
      if (!stage) return;
      const r = stage.getBoundingClientRect();
      const prev = pinch.current;
      const curDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const prevDist = Math.hypot(prev[0].x - prev[1].x, prev[0].y - prev[1].y);
      if (prevDist > 0) {
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
        zoomAt(cx, cy, curDist / prevDist);
      }
      pinch.current = [
        { id: e.touches[0].identifier, x: e.touches[0].clientX, y: e.touches[0].clientY },
        { id: e.touches[1].identifier, x: e.touches[1].clientX, y: e.touches[1].clientY },
      ];
    },
    [zoomAt]
  );

  const onTouchEnd = useCallback(() => {
    pinch.current = [];
  }, []);

  return (
    <div ref={rootRef} className="boardOuter" style={{ opacity: ready ? 1 : 0 }}>
      <article className="paper">
        <div className="boardWrap">
          <div
            ref={stageRef}
            className="stage"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div ref={canvasRef} className="canvas" />
          </div>

          {count === 0 && (
            <div className="boardHint" id="boardHint">
              <p className="bhLabel">Papan</p>
              <p className="bhText">
                Tekan + Tempel sesuatu di bawah untuk menempel karyamu.
              </p>
            </div>
          )}
        </div>

        <div className="folio">
          <span>
            <b>AKSARA</b> · HAL. 1/1
          </span>
          <span>{count} tempelan</span>
          <span>ketuk tempelan untuk memutar</span>
          <span>{folioLabel || "EDISI 231"}</span>
          <div className="tools">
            <button
              type="button"
              className="tool"
              aria-label="Perbesar"
              onClick={() => {
                const { w, h } = measure();
                zoomAt(w / 2, h / 2, 1.25);
              }}
            >
              ＋
            </button>
            <button
              type="button"
              className="tool"
              aria-label="Perkecil"
              onClick={() => {
                const { w, h } = measure();
                zoomAt(w / 2, h / 2, 1 / 1.25);
              }}
            >
              −
            </button>
            <button type="button" className="tool small" aria-label="Paskan" onClick={showAll}>
              fit
            </button>
            {canEdit && onClear && (
              <button type="button" className="tool" aria-label="Kosongkan papan" onClick={onClear}>
                ×
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
