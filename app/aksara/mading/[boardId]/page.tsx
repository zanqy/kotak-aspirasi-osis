"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback, useRef } from "react";
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

function canvasScale(): number {
  try {
    const c = document.querySelector(".aksara-v1 .canvas") as HTMLElement | null;
    if (!c) return 1;
    const m = getComputedStyle(c).transform;
    if (!m || m === "none") return 1;
    const v = m.replace("matrix(", "").replace(")", "").split(",").map(Number);
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]) || 1;
  } catch {
    return 1;
  }
}

function elOf(id: string): HTMLElement | null {
  return document.querySelector(`.aksara-v1 .canvas [data-id="${id}"]`);
}

export default function BoardPage() {
  const params = useParams();
  const slug = (params?.boardId as string) || "umum";
  const { user, student, status, hasName } = useAuth();

  const boardId = slug === "pribadi" && user ? `pribadi_${user.uid}` : slug;
  const isPublicBoard = slug === "umum";

  const [items, setItems] = useState<BoardItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BoardItem | null>(null);
  const [pastePoint, setPastePoint] = useState<{ x: number; y: number } | null>(null);

  // ---- menu kontekstual ----
  const [ctxItem, setCtxItem] = useState<BoardItem | null>(null);
  const [ctxRot, setCtxRot] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [peeked, setPeeked] = useState(false);
  const [moveMode, setMoveMode] = useState(false);
  const movePos = useRef<{ x: number; y: number } | null>(null);

  // ---- hapus semua ----
  const [clearOpen, setClearOpen] = useState(false);
  const [undoItem, setUndoItem] = useState<BoardItem | null>(null);

  const boardName =
    slug === "umum"
      ? "Mading Umum"
      : slug === "pribadi"
        ? "Mading Pribadiku"
        : slug === "kelas"
          ? `Mading ${student?.kelas || "Kelas"}`
          : `Mading ${slug}`;

  const canEdit = Boolean(user && hasName);
  const canView = isPublicBoard || Boolean(user);

  useEffect(() => {
    if (status === "loading") return;
    if (!canView) return;
    const unsub = subscribeItems(boardId, (data) => {
      setItems(data);
      setLoaded(true);
    });
    return () => unsub();
  }, [canView, boardId, status]);

  // ---------- ghost: salinan melayang selama menu terbuka ----------
  function makeGhost(item: BoardItem) {
    const el = elOf(item.id || "");
    if (!el) return;
    closeGhost();
    const r = el.getBoundingClientRect();
    const g = el.cloneNode(true) as HTMLElement;
    g.classList.add("ctxGhost");
    g.style.width = `${el.offsetWidth}px`;
    g.style.height = `${el.offsetHeight}px`;
    g.style.transformOrigin = "50% 50%";
    const s = canvasScale() * (item.scale || 1);
    g.style.left = `${r.left + r.width / 2 - el.offsetWidth / 2}px`;
    g.style.top = `${r.top + r.height / 2 - el.offsetHeight / 2}px`;
    g.style.transform = `rotate(${item.rot || 0}deg) scale(${s})`;
    document.body.appendChild(g);
    (window as any).__aksaraGhost = g;
    el.style.visibility = "hidden";
  }

  function closeGhost() {
    const g = (window as any).__aksaraGhost as HTMLElement | null;
    if (g && g.parentNode) g.parentNode.removeChild(g);
    (window as any).__aksaraGhost = null;
  }

  function unhideItem(item: BoardItem) {
    elOf(item.id || "")?.style.setProperty("visibility", "");
  }

  function paintRot(item: BoardItem, rot: number, scale?: number) {
    const sc = scale ?? item.scale ?? 1;
    elOf(item.id || "")?.style.setProperty(
      "transform", `rotate(${rot}deg)${sc !== 1 ? ` scale(${sc})` : ""}`
    );
    const g = (window as any).__aksaraGhost as HTMLElement | null;
    if (g) g.style.transform = `rotate(${rot}deg) scale(${canvasScale() * sc})`;
  }

  // ---------- buka / tutup menu ----------
  const openCtx = useCallback((item: BoardItem, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    (window as any).__aksaraCtxAnchor = r;
    setCtxItem(item);
    setCtxRot(Math.round(item.rot || 0));
    setMoreOpen(false);
    setPeeked(false);
    makeGhost(item);
  }, []);

  const closeCtx = useCallback(
    async (save = true) => {
      if (ctxItem && save) {
        try {
          await updateItem(boardId, ctxItem.id!, { rot: ctxRot } as any);
        } catch {
          /* abaikan */
        }
      }
      closeGhost();
      if (ctxItem) unhideItem(ctxItem);
      setCtxItem(null);
      setMoreOpen(false);
      setPeeked(false);
    },
    [ctxItem, ctxRot, boardId]
  );

  // ---------- aksi menu ----------
  const handleRotLive = useCallback(
    (v: number) => {
      const r = Math.max(-180, Math.min(180, Math.round(v)));
      setCtxRot(r);
      if (ctxItem) paintRot(ctxItem, r);
    },
    [ctxItem]
  );

  const handleRotCommit = useCallback(() => {
    if (!ctxItem) return;
    updateItem(boardId, ctxItem.id!, { rot: ctxRot } as any).catch(() => {});
  }, [ctxItem, ctxRot, boardId]);

  const handleBig = useCallback(() => {
    if (!ctxItem) return;
    const ns = Math.min(1.8, Math.round(((ctxItem.scale || 1) + 0.15) * 100) / 100);
    paintRot(ctxItem, ctxRot, ns);
    setCtxItem({ ...ctxItem, scale: ns });
    updateItem(boardId, ctxItem.id!, { scale: ns } as any).catch(() => {});
  }, [ctxItem, ctxRot, boardId]);

  const handleSmall = useCallback(() => {
    if (!ctxItem) return;
    const ns = Math.max(0.5, Math.round(((ctxItem.scale || 1) - 0.15) * 100) / 100);
    paintRot(ctxItem, ctxRot, ns);
    setCtxItem({ ...ctxItem, scale: ns });
    updateItem(boardId, ctxItem.id!, { scale: ns } as any).catch(() => {});
  }, [ctxItem, ctxRot, boardId]);

  const handleFlip = useCallback(() => {
    if (!ctxItem) return;
    const nf = !(ctxItem as any).flip;
    setCtxItem({ ...ctxItem, flip: nf } as BoardItem);
    updateItem(boardId, ctxItem.id!, { flip: nf } as any).catch(() => {});
  }, [ctxItem, boardId]);

  const handleFront = useCallback(() => {
    if (!ctxItem) return;
    const max = items.reduce((m, it) => Math.max(m, (it as any).z ?? 0), 0);
    closeCtx(false);
    updateItem(boardId, ctxItem.id!, { z: max + 1 } as any).catch(() => {});
  }, [ctxItem, items, boardId, closeCtx]);

  const handleBack = useCallback(() => {
    if (!ctxItem) return;
    const min = items.reduce((m, it) => Math.min(m, (it as any).z ?? 0), 0);
    closeCtx(false);
    updateItem(boardId, ctxItem.id!, { z: min - 1 } as any).catch(() => {});
  }, [ctxItem, items, boardId, closeCtx]);

  const handleDuplicate = useCallback(async () => {
    if (!ctxItem || !user) return;
    const dup = { ...ctxItem, x: ctxItem.x + 30, y: ctxItem.y + 30 };
    delete (dup as any).id;
    closeCtx(false);
    await addItem(boardId, dup, user.uid);
  }, [ctxItem, user, boardId, closeCtx]);

  const handleDelete = useCallback(async () => {
    if (!ctxItem?.id) return;
    setUndoItem(ctxItem);
    closeCtx(false);
    await deleteItem(boardId, ctxItem.id);
    setTimeout(() => setUndoItem(null), 6000);
  }, [ctxItem, boardId, closeCtx]);

  const handleEdit = useCallback(() => {
    if (!ctxItem) return;
    closeCtx(false);
    setEditingItem(ctxItem);
    setPastePoint(null);
    setSheetOpen(true);
  }, [ctxItem, closeCtx]);

  // ---------- mode pindah: ketuk papan untuk menaruh ----------
  const handleMove = useCallback(() => {
    if (!ctxItem) return;
    movePos.current = { x: ctxItem.x, y: ctxItem.y };
    setMoveMode(true);
    setPeeked(true);
  }, [ctxItem]);

  const handleMoveConfirm = useCallback(async () => {
    if (ctxItem && movePos.current) {
      await updateItem(boardId, ctxItem.id!, { x: movePos.current.x, y: movePos.current.y } as any).catch(() => {});
    }
    setMoveMode(false);
    closeCtx(false);
  }, [ctxItem, boardId, closeCtx]);

  const handleMoveCancel = useCallback(() => {
    setMoveMode(false);
    setItems((cur) => [...cur]); // gambar ulang → posisi kembali
    setPeeked(false);
  }, []);

  // ---------- ketuk papan: hanya untuk mode pindah ----------
  // Nambah tempelan HANYA lewat tombol + Tempel sesuatu (ketuk biasa = geser kamera).
  const handleBoardTap = useCallback(
    (x: number, y: number) => {
      if (!canEdit || !moveMode || !ctxItem) return;
      movePos.current = { x, y };
      const el = elOf(ctxItem.id || "");
      if (el) {
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
      }
      const g = (window as any).__aksaraGhost as HTMLElement | null;
      if (g) {
        const s = canvasScale() * (ctxItem.scale || 1);
        const r = el?.getBoundingClientRect();
        if (r && el) {
          g.style.left = `${r.left + r.width / 2 - el.offsetWidth / 2}px`;
          g.style.top = `${r.top + r.height / 2 - el.offsetHeight / 2}px`;
          g.style.transform = `rotate(${ctxRot}deg) scale(${s})`;
        }
      }
    },
    [canEdit, moveMode, ctxItem, ctxRot]
  );

  const handleAddItem = useCallback(() => {
    if (!canEdit) return;
    setEditingItem(null);
    setPastePoint(null);
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
      setPastePoint(null);
    },
    [editingItem, user, boardId]
  );

  // ---------- kosongkan papan ----------
  const handleClearAll = useCallback(async () => {
    setClearOpen(false);
    for (const it of items) {
      if (it.id) {
        try {
          await deleteItem(boardId, it.id);
        } catch {
          /* lanjut */
        }
      }
    }
  }, [items, boardId]);

  const handleUndo = useCallback(async () => {
    if (undoItem && user) {
      const item = { ...undoItem };
      delete (item as any).id;
      await addItem(boardId, item, user.uid);
      setUndoItem(null);
    }
  }, [undoItem, user, boardId]);

  if (status === "loading" || (canView && !loaded)) {
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
          href={`/aksara/masuk?next=${encodeURIComponent(`/aksara/mading/${slug}`)}`}
          className="bg-[#221D15] text-[#F2ECDE] rounded-full px-5 py-2 font-[var(--font-fraunces)] font-bold no-underline"
        >
          Masuk
        </a>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="aksara-v1">
        <main className="shell">
          <header className="mast">
            <p className="orn">Diterbitkan MPK · OSIS — Wajib Dibaca, Tidak Wajib Percaya</p>
            <h1>
              AKSARA<i>.</i>
            </h1>
            <div className="ed">
              <span>
                EDISI <b>231</b>
              </span>
              <span>{today.toUpperCase()}</span>
              <span>
                HARGA: <b>1 SENYUM</b>
              </span>
            </div>
          </header>

          <div className="dataline">
            <span>
              <b>CUACA</b> Cerah Berawan
            </span>
            <span>
              <b>KURS</b> 1 Rindu = 2 Curhat
            </span>
            <span>
              <b>TERBIT</b> {today.toUpperCase()} WIB
            </span>
          </div>

          <Board
            items={items as never}
            onItemTap={(it) => {
              if (!canEdit || moveMode) return;
              setEditingItem(it as unknown as BoardItem);
              setPastePoint(null);
              setSheetOpen(true);
            }}
            onItemLongPress={openCtx as never}
            onBoardTap={handleBoardTap}
            onClear={() => setClearOpen(true)}
            canEdit={canEdit}
            folioLabel={`${boardName.toUpperCase()}`}
          />

          <div className="madingBar">
            {undoItem && (
              <button type="button" className="mBtn mBtnGhost" onClick={handleUndo}>
                ↶ Batalkan hapus
              </button>
            )}
            {canEdit ? (
              <button type="button" className="mBtn" onClick={handleAddItem}>
                ＋ Tempel sesuatu
              </button>
            ) : (
              <a className="mBtn" href="/aksara/masuk">
                Masuk untuk nempel
              </a>
            )}
          </div>
        </main>

        {moveMode && (
          <div className="moveBar open">
            <span className="moveHint">Ketuk papan di posisi yang pas…</span>
            <div className="moveActions">
              <button type="button" className="btn ghost" onClick={handleMoveCancel}>
                Batal
              </button>
              <button type="button" className="btn" onClick={handleMoveConfirm}>
                Tetapkan posisi
              </button>
            </div>
          </div>
        )}

        {clearOpen && (
          <div
            style={{
              position: "fixed", inset: 0, zIndex: 200, display: "grid",
              placeItems: "center", padding: 24, background: "rgba(34,29,21,.55)",
            }}
            onClick={() => setClearOpen(false)}
          >
            <div
              style={{
                background: "#FDFBF4", borderRadius: 14, padding: "22px 20px",
                maxWidth: 320, textAlign: "center", transform: "rotate(-1deg)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <p style={{ font: "700 1.2rem var(--font-fraunces)", marginBottom: 6 }}>
                Kosongkan papan?
              </p>
              <p style={{ font: "italic 400 .9rem/1.5 var(--font-spectral)", color: "rgba(34,29,21,.65)", marginBottom: 16 }}>
                {items.length} tempelan akan hilang permanen.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button" onClick={() => setClearOpen(false)}
                  style={{ flex: 1, background: "transparent", color: "#221D15", border: "1.5px solid rgba(34,29,21,.3)", borderRadius: 9, padding: 12, font: "600 .95rem var(--font-fraunces)", cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="button" onClick={handleClearAll}
                  style={{ flex: 1, background: "#C03B21", color: "#fff", border: 0, borderRadius: 9, padding: 12, font: "600 .95rem var(--font-fraunces)", cursor: "pointer" }}
                >
                  Ya, kosongkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {sheetOpen && (
        <ItemSheet
          initial={editingItem || undefined}
          atPoint={pastePoint}
          onSave={handleSaveItem as never}
          onCancel={() => {
            setSheetOpen(false);
            setEditingItem(null);
            setPastePoint(null);
          }}
        />
      )}

      <ContextMenu
        open={Boolean(ctxItem)}
        rot={ctxRot}
        scale={ctxItem?.scale || 1}
        canFlip={ctxItem?.kind === "polaroid"}
        moreOpen={moreOpen}
        peeked={peeked || moveMode}
        onRot={handleRotLive}
        onRotCommit={handleRotCommit}
        onBig={handleBig}
        onSmall={handleSmall}
        onFlip={handleFlip}
        onPeek={() => setPeeked(true)}
        onMore={() => setMoreOpen((v) => !v)}
        onEdit={handleEdit}
        onMove={handleMove}
        onFront={handleFront}
        onBack={handleBack}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onClose={() => closeCtx(true)}
        onShowMenu={() => {
          setPeeked(false);
          setMoveMode(false);
        }}
      />
    </>
  );
}
