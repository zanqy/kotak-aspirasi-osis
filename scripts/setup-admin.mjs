/**
 * Script setup admin user untuk Kotak Aspirasi OSIS.
 *
 * Cara pakai:
 *   node scripts/setup-admin.mjs <email> <password> [nama]
 *
 * Aksi:
 * 1. Buat user di Firebase Auth (kalau email sudah ada, pakai UID yang ada)
 * 2. Buat/update doc `users/{uid}` di Firestore dengan role=admin, status=approved
 */
import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Parse .env.local sederhana
const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, "");
}

const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4] || "Admin OSIS";

if (!email || !password) {
  console.error("Usage: node scripts/setup-admin.mjs <email> <password> [nama]");
  process.exit(1);
}

const app = initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const auth = getAuth(app);
const db = getFirestore(app);

let uid;
try {
  const user = await auth.getUserByEmail(email);
  uid = user.uid;
  console.log(`ℹ️  User sudah ada di Firebase Auth: ${email} (${uid})`);
} catch {
  const user = await auth.createUser({ email, password, displayName: name });
  uid = user.uid;
  console.log(`✅ User dibuat di Firebase Auth: ${email} (${uid})`);
}

const now = Timestamp.now();
await db.collection("users").doc(uid).set(
  {
    email,
    name,
    avatar_url: null,
    role: "admin",
    status: "approved",
    created_at: now,
    updated_at: now,
  },
  { merge: true }
);
console.log(`✅ Doc users/${uid} dibuat/diupdate (role=admin, status=approved)`);
console.log("🎉 Admin user siap! Login di https://kotak-aspirasi-osis.vercel.app/dashboard/login");
process.exit(0);