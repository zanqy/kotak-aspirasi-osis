// lib/aksara/board.ts
// Board service — Firestore CRUD + real-time sync
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase-client";

export type BoardItem = {
  id?: string;
  kind: string;
  shape?: string;
  x: number;
  y: number;
  rot: number;
  scale?: number;
  text?: string;
  name?: string;
  color?: string;
  paper?: string;
  font?: string;
  ink?: string;
  sticker?: string;
  stamp?: string;
  shadow?: string;
  align?: string;
  ratio?: string;
  image?: string | null;
  pin?: string;
  pinPos?: string;
  tape?: string;
  tapePos?: string;
  filter?: string;
  frame?: string;
  highlight?: string;
  createdBy?: string;
  at?: any;
};

export function itemsCollection(boardId: string) {
  return collection(getClientDb(), "boards", boardId, "items");
}

export async function addItem(boardId: string, item: BoardItem, uid: string) {
  const data = { ...item, createdBy: uid, at: serverTimestamp() };
  delete data.id;
  const ref = await addDoc(itemsCollection(boardId), data);
  return ref.id;
}

export async function updateItem(boardId: string, itemId: string, data: Partial<BoardItem>) {
  const ref = doc(getClientDb(), "boards", boardId, "items", itemId);
  await updateDoc(ref, data as any);
}

export async function deleteItem(boardId: string, itemId: string) {
  const ref = doc(getClientDb(), "boards", boardId, "items", itemId);
  await deleteDoc(ref);
}

export function subscribeItems(
  boardId: string,
  callback: (items: BoardItem[]) => void
) {
  const q = query(itemsCollection(boardId), orderBy("at", "asc"));
  return onSnapshot(q, (snap) => {
    const items: BoardItem[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));
    callback(items);
  });
}

export async function getItems(boardId: string): Promise<BoardItem[]> {
  const q = query(itemsCollection(boardId), orderBy("at", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}
