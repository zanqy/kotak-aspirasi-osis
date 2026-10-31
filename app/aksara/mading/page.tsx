"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getClientAuth } from "@/lib/firebase-client";
import { onAuthStateChanged } from "firebase/auth";
import Board from "@/components/aksara/Board";
import ItemSheet from "@/components/aksara/ItemSheet";
import ContextMenu from "@/components/aksara/ContextMenu";
import {
  subscribeItems,
  addItem,
  updateItem,
  deleteItem,
  type BoardItem,
} from "@/lib/aksara/board";

const BOARD_ID = "umum";

export default function MadingPage() {
  const [items, setItems] = useState<BoardItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BoardItem | null>(null);
  const [ctxOpen, setCtxOpen] = useState(false);
  const [ctxItem, setCtxItem] = useState<BoardItem | null>(null);
  const [ctxAnchor, setCtxAnchor] = useState<{ x: number; y: number } | null>(null);
  const [undoItem, setUndoItem] = useState<BoardItem | null>(null);

  const router = useRouter();

  // Auth check
  useEffect(() => {
    const auth = getClientAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/aksara/masuk");
        return;
      }
      setUser(u);
    });
    return () => unsub();
  }, [router]);

  // Firestore real-time subscription
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeItems(BOARD_ID, (data) => {
      setItems(data);
      setLoaded(true);
    });
    return () => unsub();
  }, [user]);

  const saveItems = useCallback(async (newItems: BoardItem[]) => {
    setItems(newItems);
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

  async function handleCtxDelete() {
    if (!ctxItem?.id) return;
    setUndoItem(ctxItem);
    await deleteItem(BOARD_ID, ctxItem.id);
    setCtxOpen(false);
    setCtxItem(null);
    setTimeout(() => setUndoItem(null), 6000);
  }

  async function handleCtxDuplicate() {
    if (!ctxItem || !user) return;
    const dup = { ...ctxItem, x: ctxItem.x + 30, y: ctxItem.y + 30 };
    delete (dup as any).id;
    await addItem(BOARD_ID, dup, user.uid);
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

  async function handleUndo() {
    if (undoItem && user) {
      const item = { ...undoItem };
      delete (item as any).id;
      await addItem(BOARD_ID, item, user.uid);
      setUndoItem(null);
    }
  }

  function handleAddItem() {
    setEditingItem(null);
    setSheetOpen(true);
  }

  async function handleSaveItem(item: BoardItem) {
    if (!user) return;
    if (editingItem && editingItem.id) {
      await updateItem(BOARD_ID, editingItem.id, item);
    } else {
      await addItem(BOARD_ID, item, user.uid);
    }
    setSheetOpen(false);
    setEditingItem(null);
  }

  function handleCancelSheet() {
    setSheetOpen(false);
    setEditingItem(null);
  }

  if (authLoading || !loaded) {
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
