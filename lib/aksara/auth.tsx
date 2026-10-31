"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { getClientAuth, getClientDb } from "@/lib/firebase-client";

export type Student = {
  nama: string;
  email: string;
  fotoUrl: string;
  nisn: string;
  kelas: string;
  role: "siswa" | "osis" | "guru" | "admin";
  verified: boolean;
  bio: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type AuthStatus = "loading" | "anon" | "ready" | "error";

type AuthContextValue = {
  user: User | null;
  student: Student | null;
  status: AuthStatus;
  error: string | null;
  /** nama sudah diisi (dipakai untuk onboarding ringan setelah Google) */
  hasName: boolean;
  /** NISN terisi + terverifikasi — disiapkan untuk nanti, belum dipakai sebagai gate */
  verified: boolean;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshStudent: () => Promise<void>;
  saveStudent: (patch: Partial<Student>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_TIMEOUT_MS = 8000;

function blankStudent(u: User): Student {
  return {
    nama: u.displayName || "",
    email: u.email || "",
    fotoUrl: u.photoURL || "",
    nisn: "",
    kelas: "",
    role: "siswa",
    verified: false,
    bio: "",
  };
}

export function AksaraAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const settled = useRef(false);
  const profSub = useRef<(() => void) | null>(null);

  // Pastikan dokumen students/{uid} ada; kalau belum, buat kerangka (belum terverifikasi)
  const ensureStudentDoc = useCallback(async (u: User) => {
    const ref = doc(getClientDb(), "students", u.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const base = blankStudent(u);
      await setDoc(ref, { ...base, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      return base;
    }
    return snap.data() as Student;
  }, []);

  const bindProfile = useCallback(
    (u: User) => {
      if (profSub.current) {
        profSub.current();
        profSub.current = null;
      }
      const ref = doc(getClientDb(), "students", u.uid);
      profSub.current = onSnapshot(
        ref,
        (snap) => {
          if (snap.exists()) {
            setStudent(snap.data() as Student);
            setStatus("ready");
            setError(null);
          }
        },
        () => {
          // rules/network error — jangan gantung, biarkan UI jalan dengan data minimal
          setStudent((prev) => prev ?? blankStudent(u));
          setStatus("ready");
        }
      );
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    const auth = getClientAuth();

    // fallback supaya loading tidak pernah menggantung
    const timer = setTimeout(() => {
      if (!settled.current && !cancelled) {
        settled.current = true;
        setStatus((s) => (s === "loading" ? "anon" : s));
        setError("timeout");
      }
    }, AUTH_TIMEOUT_MS);

    // tangkap hasil redirect login Google (mobile)
    getRedirectResult(auth).catch(() => {});

    const unsub = onAuthStateChanged(
      auth,
      async (u) => {
        if (cancelled) return;
        clearTimeout(timer);
        settled.current = true;
        setUser(u);
        if (!u) {
          setStudent(null);
          setStatus("anon");
          setError(null);
          if (profSub.current) {
            profSub.current();
            profSub.current = null;
          }
          return;
        }
        try {
          const data = await ensureStudentDoc(u);
          if (cancelled) return;
          setStudent(data);
          setStatus("ready");
          setError(null);
          bindProfile(u);
        } catch {
          if (cancelled) return;
          setStudent(blankStudent(u));
          setStatus("ready");
          setError("profile-failed");
        }
      },
      () => {
        if (cancelled) return;
        clearTimeout(timer);
        settled.current = true;
        setStatus("error");
        setError("auth-error");
      }
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsub();
      if (profSub.current) {
        profSub.current();
        profSub.current = null;
      }
    };
  }, [ensureStudentDoc, bindProfile]);

  const signInGoogle = useCallback(async () => {
    setError(null);
    const auth = getClientAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      const code = String(err?.code || "");
      // popup diblokir / tidak didukung (banyak browser HP) → pakai redirect
      if (
        code.includes("popup-blocked") ||
        code.includes("popup-closed-by-user") ||
        code.includes("cancelled-popup-request") ||
        code.includes("operation-not-supported-in-this-environment")
      ) {
        if (code.includes("popup-closed-by-user") || code.includes("cancelled-popup-request")) {
          throw err;
        }
        await signInWithRedirect(auth, provider);
        return;
      }
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(getClientAuth());
  }, []);

  const refreshStudent = useCallback(async () => {
    if (!user) return;
    const data = await ensureStudentDoc(user);
    setStudent(data);
  }, [user, ensureStudentDoc]);

  const saveStudent = useCallback(
    async (patch: Partial<Student>) => {
      if (!user) throw new Error("belum login");
      const ref = doc(getClientDb(), "students", user.uid);
      await setDoc(
        ref,
        { ...patch, email: user.email || "", updatedAt: serverTimestamp() },
        { merge: true }
      );
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      student,
      status,
      error,
      hasName: Boolean(student?.nama && student.nama.trim().length > 0),
      verified: Boolean(student?.verified && student?.nisn),
      signInGoogle,
      logout,
      refreshStudent,
      saveStudent,
    }),
    [user, student, status, error, signInGoogle, logout, refreshStudent, saveStudent]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AksaraAuthProvider");
  return ctx;
}
