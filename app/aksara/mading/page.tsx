"use client";

import { useState, useEffect } from "react";
import Board from "@/components/aksara/Board";

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

export default function MadingPage() {
  const [items, setItems] = useState<BoardItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aksara_papan_v1");
      const data = raw ? JSON.parse(raw) : [];
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
    setLoaded(true);
  }, []);

  function handleItemTap(item: BoardItem) {
    console.log("tap", item.id);
  }

  function handleItemLongPress(item: BoardItem, el: HTMLElement) {
    console.log("longpress", item.id);
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#E9DDC4] flex items-center justify-center">
        <p className="font-[var(--font-caveat)] text-xl">Memuat papan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 flex justify-between items-center px-4 py-2.5 bg-[#F2ECDE]/94 backdrop-blur-sm border-b border-[#221D15]/25">
        <span className="font-[var(--font-fraunces)] font-extrabold text-[1.25rem]">
          AKSARA<span className="text-[#C03B21]">.</span>
        </span>
        <nav className="flex gap-1">
          <a href="/aksara" className="text-[10px] tracking-[0.12em] uppercase font-[var(--font-ibm-plex-mono)] font-medium text-[#221D15] no-underline px-3 py-1.5 rounded-full">
            Mading
          </a>
          <a href="/aksara/profil" className="text-[10px] tracking-[0.12em] uppercase font-[var(--font-ibm-plex-mono)] font-medium text-[#221D15] no-underline px-3 py-1.5 rounded-full">
            Profil
          </a>
          <a href="/aksara/kirim" className="text-[10px] tracking-[0.12em] uppercase font-[var(--font-ibm-plex-mono)] font-medium text-[#221D15] no-underline px-3 py-1.5 rounded-full">
            Kirim
          </a>
        </nav>
      </header>

      {/* Board */}
      <div className="flex-1 relative">
        <Board items={items} onItemTap={handleItemTap} onItemLongPress={handleItemLongPress} />
      </div>

      {/* Footer info */}
      <div className="sticky bottom-0 z-20 flex justify-between items-center px-4 py-2 bg-[#F2ECDE]/94 backdrop-blur-sm border-t border-[#221D15]/25 font-[var(--font-ibm-plex-mono)] text-[10px] tracking-[0.12em] uppercase text-[#221D15]/55">
        <span>{items.length} tempelan</span>
        <span>AKSARA · Papan Mading</span>
      </div>
    </div>
  );
}
