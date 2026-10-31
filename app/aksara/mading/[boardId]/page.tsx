"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/aksara/auth";
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
  const params = useParams();
  const slug = (params?.boardId as string) || "umum";
  const { user, student, status, verified } = useAuth();

  // board pribadi harus unik per user — dulu semua orang berbagi satu papan "pribadi"
  const boardId = slug === "pribadi" && user ? `pribadi_${user.uid}` : slug;
  const isPublicBoard = slug === "umum";

  const [items, setItems] = useState<BoardItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BoardItem | null>(null);
  const [ctxOpen, setCtxOpen] = useState(false);
  const [ctxItem, setCtxItem] = useState<BoardItem | null>(null);
  const [ctxAnchor, setCtxAnchor] = useState<{ x: number; y: number } | null>(null);
  const [undoItem, setUndoItem] = useState<BoardItem | null>(null);

  const boardName =
    slug === "umum"
      ? "Mading Umum"
      : slug === "pribadi"
        ? "Mading Pribadiku"
        : slug === "kelas"
          ? `Mading ${student?.kelas || "Kelas"}`
          : `Mading ${slug}`;

  const canEdit = Boolean(user && verified);
  const canView = isPublicBoard || Boolean(user);

  // papan pribadi butuh login
  useEffect(() => {
    if (status === "loading") return;
    if (!isPublicBoard && !user) return;
  }, [status, user, isPublicBoard]);

  useEffect(() => {
    if (status === "loading") return;
    if (!canView) return;
    const unsub = subscribeItems(boardId, (data) => {
      setItems(data);
      setLoaded(true);
    });
    return () => unsub();
  }, [canView, boardId, status]);

  const handleItemTap = useCallback((item: BoardItem) => {
    if (!canEdit) return;
    setEditingItem(item);
    setSheetOpen(true);
  }, [canEdit]);

  const handleItemLongPress = useCallback(
    (item: BoardItem, el: HTMLElement) => {
      if (!canEdit) return;
      const rect = el.getBoundingClientRect();
      setCtxItem(item);
      setCtxAnchor({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      setCtxOpen(true);
    },
    [canEdit]
  );

  const handleAddItem = useCallback(() => {
    if (!canEdit) return;
    setEditingItem(null);
    setSheetOpen(true);
  }, [canEdit]);

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

  const handleUndo = useCallback(async () => {
    if (undoItem && user) {
      const item = { ...undoItem };
      delete (item as any).id;
      await addItem(boardId, item, user.uid);
      setUndoItem(null);
    }
  }, [undoItem, user, boardId]);

  if (status === "loading" || !loaded) {
    return (
      <div className="min-h-screen bg-[#E9DDC4] flex flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="font-[var(--font-caveat)] text-xl">Memuat papan…</p>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="min-h-screen bg-[#E9DDC4] flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-[var(--font-caveat)] text-2xl">Papan ini perlu masuk dulu</p>
        <a
          href="/aksara/masuk"
          className="bg-[#221D15] text-[#F2ECDE] rounded-full px-5 py-2 font-[var(--font-fraunces)] font-bold no-underline"
        >
          Masuk
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 3.2rem)" }}>
      <div className="flex-1 relative">
        <Board items={items} onItemTap={handleItemTap} onItemLongPress={handleItemLongPress} />
      </div>

      <div className="sticky bottom-0 z-20 flex justify-between items-center gap-2 px-4 py-2 bg-[#F2ECDE]/95 backdrop-blur-sm border-t border-[#221D15]/25 font-[var(--font-ibm-plex-mono)] text-[10px] tracking-[0.12em] uppercase text-[#221D15]/55">
        <span className="truncate">
          {boardName} · {items.length} tempelan
        </span>
        <div className="flex gap-2 shrink-0">
          {undoItem && (
            <button
              onClick={handleUndo}
              className="bg-[#C03B21] text-[#F2ECDE] border-0 rounded-full px-3.5 py-1.5 font-[var(--font-fraunces)] font-bold text-[0.8rem] cursor-pointer"
            >
              ↶ Batalkan
            </button>
          )}
          {canEdit ? (
            <button
              onClick={handleAddItem}
              className="bg-[#221D15] text-[#F2ECDE] border-0 rounded-full px-4 py-1.5 font-[var(--font-fraunces)] font-bold text-[0.8rem] cursor-pointer"
            >
              + Tempel
            </button>
          ) : !user ? (
            <a
              href="/aksara/masuk"
              className="bg-[#221D15] text-[#F2ECDE] border-0 rounded-full px-4 py-1.5 font-[var(--font-fraunces)] font-bold text-[0.8rem] no-underline"
            >
              Masuk untuk nempel
            </a>
          ) : (
            <a
              href="/aksara/verifikasi"
              className="bg-[#C03B21] text-[#F2ECDE] border-0 rounded-full px-4 py-1.5 font-[var(--font-fraunces)] font-bold text-[0.8rem] no-underline"
            >
              Verifikasi buat nempel
            </a>
          )}
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
        onMove={() => {
          setCtxOpen(false);
          setCtxItem(null);
        }}
        onRotate={() => {
          setCtxOpen(false);
          setCtxItem(null);
        }}
        onFront={() => {
          setCtxOpen(false);
          setCtxItem(null);
        }}
        onBack={() => {
          setCtxOpen(false);
          setCtxItem(null);
        }}
        onDuplicate={handleCtxDuplicate}
        onDelete={handleCtxDelete}
        onClose={() => {
          setCtxOpen(false);
          setCtxItem(null);
        }}
        onPeek={() => setCtxOpen(false)}
      />
    </div>
  );
}
