"use client";

import { useState, useEffect, useCallback } from "react";
import Board from "@/components/aksara/Board";
import ItemSheet from "@/components/aksara/ItemSheet";
import ContextMenu from "@/components/aksara/ContextMenu";

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
  shape?: string;
  paper?: string;
  font?: string;
  ink?: string;
  sticker?: string;
  stamp?: string;
  shadow?: string;
  align?: string;
  ratio?: string;
  image?: string;
  pin?: string;
  pinPos?: string;
  tape?: string;
  tapePos?: string;
  filter?: string;
  frame?: string;
  highlight?: string;
};

export default function MadingPage() {
  const [items, setItems] = useState<BoardItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BoardItem | null>(null);
  const [ctxOpen, setCtxOpen] = useState(false);
  const [ctxItem, setCtxItem] = useState<BoardItem | null>(null);
  const [ctxAnchor, setCtxAnchor] = useState<{ x: number; y: number } | null>(null);
  const [undoItem, setUndoItem] = useState<BoardItem | null>(null);

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

  const saveItems = useCallback((newItems: BoardItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem("aksara_papan_v1", JSON.stringify(newItems));
    } catch (e) {
      console.error("save failed", e);
    }
  }, []);

  function handleItemTap(item: BoardItem) {
    console.log("tap", item.id);
  }

  function handleItemLongPress(item: BoardItem, el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    setCtxItem(item);
    setCtxAnchor({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setCtxOpen(true);
  }

  function handleCtxEdit() {
    if (ctxItem) {
      setEditingItem(ctxItem);
      setSheetOpen(true);
    }
    setCtxOpen(false);
    setCtxItem(null);
  }

  function handleCtxDelete() {
    if (!ctxItem) return;
    setUndoItem(ctxItem);
    saveItems(items.filter((it) => it.id !== ctxItem.id));
    setCtxOpen(false);
    setCtxItem(null);
    setTimeout(() => setUndoItem(null), 6000);
  }

  function handleCtxDuplicate() {
    if (!ctxItem) return;
    const dup = { ...ctxItem, id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, x: ctxItem.x + 30, y: ctxItem.y + 30 };
    saveItems([...items, dup]);
    setCtxOpen(false);
    setCtxItem(null);
  }

  function handleCtxFront() {
    if (!ctxItem) return;
    const rest = items.filter((it) => it.id !== ctxItem.id);
    saveItems([...rest, ctxItem]);
    setCtxOpen(false);
    setCtxItem(null);
  }

  function handleCtxBack() {
    if (!ctxItem) return;
    const rest = items.filter((it) => it.id !== ctxItem.id);
    saveItems([ctxItem, ...rest]);
    setCtxOpen(false);
    setCtxItem(null);
  }

  function handleUndo() {
    if (undoItem) {
      saveItems([...items, undoItem]);
      setUndoItem(null);
    }
  }

  function handleAddItem() {
    setEditingItem(null);
    setSheetOpen(true);
  }

  function handleSaveItem(item: BoardItem) {
    if (editingItem) {
      const newItems = items.map((it) => (it.id === item.id ? item : it));
      saveItems(newItems);
    } else {
      saveItems([...items, item]);
    }
    setSheetOpen(false);
    setEditingItem(null);
  }

  function handleCancelSheet() {
    setSheetOpen(false);
    setEditingItem(null);
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#E9DDC4] flex items-center justify-center">
        <p className="font-[var(--font-caveat)] text-xl">Memuat papan...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
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

      <div className="flex-1 relative">
        <Board items={items} onItemTap={handleItemTap} onItemLongPress={handleItemLongPress} />
      </div>

      <div className="sticky bottom-0 z-20 flex justify-between items-center px-4 py-2 bg-[#F2ECDE]/94 backdrop-blur-sm border-t border-[#221D15]/25 font-[var(--font-ibm-plex-mono)] text-[10px] tracking-[0.12em] uppercase text-[#221D15]/55">
        <span>{items.length} tempelan</span>
        <div className="flex gap-2">
          {undoItem && (
            <button
              onClick={handleUndo}
              className="bg-[#C03B21] text-[#F2ECDE] border-0 rounded-full px-4 py-1.5 font-[var(--font-fraunces)] font-bold text-[0.85rem] cursor-pointer"
            >
              ↶ Batalkan hapus
            </button>
          )}
          <button
            onClick={handleAddItem}
            className="bg-[#221D15] text-[#F2ECDE] border-0 rounded-full px-4 py-1.5 font-[var(--font-fraunces)] font-bold text-[0.85rem] cursor-pointer"
          >
            + Tempel
          </button>
        </div>
      </div>

      {sheetOpen && (
        <ItemSheet
          initial={editingItem || undefined}
          onSave={handleSaveItem}
          onCancel={handleCancelSheet}
        />
      )}

      <ContextMenu
        open={ctxOpen}
        item={ctxItem}
        anchor={ctxAnchor}
        onEdit={handleCtxEdit}
        onMove={() => { setCtxOpen(false); setCtxItem(null); }}
        onRotate={() => { setCtxOpen(false); setCtxItem(null); }}
        onFront={handleCtxFront}
        onBack={handleCtxBack}
        onDuplicate={handleCtxDuplicate}
        onDelete={handleCtxDelete}
        onClose={() => { setCtxOpen(false); setCtxItem(null); }}
        onPeek={() => { setCtxOpen(false); }}
      />
    </div>
  );
}
