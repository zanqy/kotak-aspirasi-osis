/**
 * Firebase Admin SDK (server-only).
 *
 * Dipakai di API Routes, middleware, dan lib/auth-api untuk:
 * - Verifikasi session cookie (Firebase Auth)
 * - Akses Firestore (Admin SDK bypass security rules — setara service role Supabase)
 *
 * PENTING: Jangan pernah import file ini dari client component!
 * Private key service account hanya boleh dipakai di server.
 */
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { env } from "./env";

let adminApp: ReturnType<typeof initializeApp> | null = null;

export function getAdminApp() {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApp();
    return adminApp;
  }
  adminApp = initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      // Private key di .env biasanya berisi literal \n — perlu di-decode.
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
  return adminApp;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}