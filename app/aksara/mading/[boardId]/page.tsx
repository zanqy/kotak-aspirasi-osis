"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = (params?.boardId as string) || "umum";

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

  const boardName = boardId === "umum" ? "Mading Umum" : boardId === "pribadi" ? "Mading Pribadiku" : `Mading ${boardId}`;

  useEffect(() => {
    const auth = getClientAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/aksara/masuk");
        return;
      }
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeItems(boardId, (data) => {
      setItems(data);
      setLoaded(true);
    });
    return () => unsub();
  }, [user, boardId]);

  const handleItemTap = useCallback((item: BoardItem) => {
    console.log("tap", item.id);
  }, []);

  const handleItemLongPress = useCallback((item: BoardItem, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    setCtxItem(item);
    setCtxAnchor({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setCtxOpen(true);
  }, []);

  const handleAddItem = useCallback(() => {
    setEditingItem(null);
    setSheetOpen(true);
  }, []);

  const handleSaveItem = useCallback(
    async (item: BoardItem) => {
      if (!user) return;
      if (editingItem && editingItem.id) {
        await updateItem(boardId, editingItem.id, item);
      } else {
        await addItem(boardId, item, user.uid);
      }
      setSheetOpen(false);
      setEditingItem(null);
    },
    [editingItem, user, boardId]
  );

  const handleCancelSheet = useCallback(() => {
    setSheetOpen(false);
    setEditingItem(null);
  }, []);

  const handleCtxEdit = useCallback(() => {
    if (ctxItem) {
      setEditingItem(ctxItem);
      setSheetOpen(true);
    }
    setCtxOpen(false);
    setCtxItem(null);
  }, [ctxItem]);

  const handleCtxDelete = useCallback(async () => {
    if (!ctxItem?.id) return;
    setUndoItem(ctxItem);
    await deleteItem(boardId, ctxItem.id);
    setCtxOpen(false);
    setCtxItem(null);
    setTimeout(() => setUndoItem(null), 6000);
  }, [ctxItem, boardId]);

  const handleCtxDuplicate = useCallback(async () => {
    if (!ctxItem || !user) return;
    const dup = { ...ctxItem, x: ctxItem.x + 30, y: ctxItem.y + 30 };
    delete (dup as any).id;
    await addItem(boardId, dup, user.uid);
    setCtxOpen(false);
    setCtxItem(null);
  }, [ctxItem, user, boardId]);

  const handleCtxFront = useCallback(() => {
    setCtxOpen(false);
    setCtxItem(null);
  }, []);

  const handleCtxBack = useCallback(() => {
    setCtxOpen(false);
    setCtxItem(null);
  }, []);

  const handleUndo = useCallback(async () => {
    if (undoItem && user) {
      const item = { ...undoItem };
      delete (item as any).id;
      await addItem(boardId, item, user.uid);
      setUndoItem(null);
    }
  }, [undoItem, user, boardId]);

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
        <nav className="flex gap-1 items-center">
          <a href="/aksara" className="text-[10px] tracking-[0.12em] uppercase font-[var(--font-ibm-plex-mono)] font-medium text-[#221D15] no-underline px-3 py-1.5 rounded-full">
            Home
          </a>
          <span className="text-[10px] tracking-[0.12em] uppercase font-[var(--font-ibm-plex-mono)] font-medium text-[#221D15] bg-[#221D15]/10 px-3 py-1.5 rounded-full">
            {boardName}
          </span>
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
