"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import ItemCard from "@/components/aksara/ItemCard";

const BOARD_W = 1400;
const BOARD_H = 1400;

type BoardItem = {
  id: string;
  kind: string;
  x: number;
  y: number;
  rot: number;
  scale?: number;
  text?: string;
  name?: string;
  color?: string;
};

type BoardProps = {
  items: BoardItem[];
  onItemTap?: (item: BoardItem) => void;
  onItemLongPress?: (item: BoardItem, el: HTMLElement) => void;
};

export default function Board({ items, onItemTap, onItemLongPress }: BoardProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, s: 0.5 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTap = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const moved = useRef(false);

  // Fit view on mount
  useEffect(() => {
    if (!stageRef.current) return;
    const w = stageRef.current.clientWidth;
    const h = stageRef.current.clientHeight;
    const s = Math.min(w / BOARD_W, h / BOARD_H) * 0.94;
    setView({ x: (w - BOARD_W * s) / 2, y: (h - BOARD_H * s) / 2, s });
  }, []);

  const clampView = useCallback(() => {
    if (!stageRef.current) return;
    const w = stageRef.current.clientWidth;
    const h = stageRef.current.clientHeight;
    setView((v) => {
      const minX = w - BOARD_W * v.s;
      const minY = h - BOARD_H * v.s;
      return {
        ...v,
        x: Math.min(0, Math.max(minX, v.x)),
        y: Math.min(0, Math.max(minY, v.y)),
      };
    });
  }, []);

  useEffect(() => {
    clampView();
  }, [view.s, clampView]);

  // Pan handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.target !== stageRef.current && !(e.target as HTMLElement).classList?.contains("canvas")) return;
      dragging.current = true;
      moved.current = false;
      lastPos.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  }, []);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    setView((v) => {
      const newS = Math.min(6, Math.max(0.3, v.s * factor));
      const ratio = newS / v.s;
      return {
        x: cx - (cx - v.x) * ratio,
        y: cy - (cy - v.y) * ratio,
        s: newS,
      };
    });
  }, []);

  // Pinch zoom
  const touches = useRef<{ id: number; x: number; y: number }[]>([]);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touches.current = [
        { id: e.touches[0].identifier, x: e.touches[0].clientX, y: e.touches[0].clientY },
        { id: e.touches[1].identifier, x: e.touches[1].clientX, y: e.touches[1].clientY },
      ];
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && touches.current.length === 2) {
      e.preventDefault();
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const prevDist = Math.hypot(
        touches.current[0].x - touches.current[1].x,
        touches.current[0].y - touches.current[1].y
      );
      const curDist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      const factor = curDist / prevDist;
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const cx = (t0.clientX + t1.clientX) / 2 - rect.left;
      const cy = (t0.clientY + t1.clientY) / 2 - rect.top;
      setView((v) => {
        const newS = Math.min(6, Math.max(0.3, v.s * factor));
        const ratio = newS / v.s;
        return {
          x: cx - (cx - v.x) * ratio,
          y: cy - (cy - v.y) * ratio,
          s: newS,
        };
      });
      touches.current = [
        { id: t0.identifier, x: t0.clientX, y: t0.clientY },
        { id: t1.identifier, x: t1.clientX, y: t1.clientY },
      ];
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    touches.current = [];
  }, []);

  // Item tap / long-press
  const handleItemPointerDown = useCallback(
    (item: BoardItem, e: React.PointerEvent) => {
      e.stopPropagation();
      moved.current = false;
      const startX = e.clientX;
      const startY = e.clientY;
      longPressTimer.current = setTimeout(() => {
        if (!moved.current) {
          onItemLongPress?.(item, e.currentTarget as HTMLElement);
        }
      }, 450);
      const onMove = (ev: PointerEvent) => {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > 6) {
          moved.current = true;
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
        }
      };
      const onUp = () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        if (!moved.current) {
          const now = Date.now();
          if (now - lastTap.current < 300) {
            // double tap - could zoom
          }
          lastTap.current = now;
          onItemTap?.(item);
        }
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [onItemTap, onItemLongPress]
  );

  return (
    <div
      ref={stageRef}
      className="relative w-full h-full overflow-hidden bg-[#E9DDC4] cursor-grab active:cursor-grabbing touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={canvasRef}
        className="canvas absolute top-0 left-0 origin-top-left"
        style={{
          width: BOARD_W,
          height: BOARD_H,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`,
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute select-none"
            style={{
              left: item.x,
              top: item.y,
              transform: `rotate(${item.rot || 0}deg) scale(${item.scale || 1})`,
              transformOrigin: "center center",
            }}
            onPointerDown={(e) => handleItemPointerDown(item, e)}
          >
            <ItemCard item={item} />
          </div>
        ))}
      </div>
      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")',
          backgroundSize: "128px 128px",
        }}
      />
    </div>
  );
}
