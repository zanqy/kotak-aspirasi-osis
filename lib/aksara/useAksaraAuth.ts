"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase-client";

// Auth anti-nyangkut: loading tidak pernah selamanya.
// Kalau Firebase gagal / diblokir / lambat, anggap belum login setelah timeout.
export function useAksaraAuth(timeoutMs = 8000) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        setAuthLoading(false);
      }
    };
    const t = setTimeout(() => {
      setAuthError("timeout");
      setUser(null);
      finish();
    }, timeoutMs);
    let unsub: (() => void) | undefined;
    try {
      const auth = getClientAuth();
      unsub = onAuthStateChanged(
        auth,
        (u) => {
          clearTimeout(t);
          setUser(u);
          finish();
        },
        () => {
          clearTimeout(t);
          setAuthError("auth-error");
          setUser(null);
          finish();
        }
      );
    } catch {
      clearTimeout(t);
      setAuthError("init-failed");
      setUser(null);
      finish();
    }
    return () => {
      settled = true;
      clearTimeout(t);
      if (unsub) unsub();
    };
  }, [timeoutMs]);

  return { user, authLoading, authError };
}
