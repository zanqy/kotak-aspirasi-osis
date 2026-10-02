/**
 * Firebase Client SDK (browser-only).
 *
 * Dipakai di client component untuk:
 * - Login (signInWithEmailAndPassword / signInWithPopup Google)
 * - Realtime subscription Firestore (onSnapshot) di halaman cek-aspirasi
 *   dan dashboard detail.
 *
 * PENTING: Hanya import dari komponen dengan "use client".
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

let clientApp: ReturnType<typeof initializeApp> | null = null;

export function getClientApp() {
  if (clientApp) return clientApp;
  if (getApps().length > 0) {
    clientApp = getApp();
    return clientApp;
  }
  clientApp = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  });
  return clientApp;
}

export function getClientDb() {
  return getFirestore(getClientApp());
}

export function getClientAuth() {
  return getAuth(getClientApp());
}