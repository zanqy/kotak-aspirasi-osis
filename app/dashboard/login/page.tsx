"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { IconBrandGoogle } from "@tabler/icons-react";
import { getClientAuth } from "@/lib/firebase-client";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

function getFirebaseErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code;
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-email":
      return "Email atau password salah";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Coba lagi nanti.";
    case "auth/network-request-failed":
      return "Gagal terhubung ke server";
    default:
      return "Gagal login. Coba lagi.";
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const statusParam = searchParams.get("status");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.user) router.replace("/dashboard");
        }
      } catch {
        // Abaikan - user tetap bisa login manual
      }
    };
    checkSession();
    if (statusParam) {
      const url = new URL(window.location.href);
      url.searchParams.delete("status");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [router, statusParam]);

  /** Kirim ID token ke server untuk membuat session cookie httpOnly. */
  const createSession = async (idToken: string) => {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Gagal membuat session");
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email dan password harus diisi");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        getClientAuth(),
        email.trim(),
        password.trim()
      );
      const idToken = await userCredential.user.getIdToken();
      await createSession(idToken);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("login error:", err);
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {statusParam === "pending" && (
        <motion.div
          className="mt-4 bg-paper-deep border border-warn rounded-[3px] px-4 py-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[13px] text-warn text-center font-medium">
            Akunmu sedang menunggu persetujuan admin.
          </p>
        </motion.div>
      )}
      {statusParam === "rejected" && (
        <motion.div
          className="mt-4 bg-paper-deep border border-warn rounded-[3px] px-4 py-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[13px] text-warn text-center font-medium">
            Permintaan aksesmu ditolak oleh admin.
          </p>
        </motion.div>
      )}
      <div className="mt-5 flex flex-col gap-3">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-paper border-line border-[1.5px] rounded-[3px] px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-ink-faint font-mono" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="Password" className="w-full bg-paper border-line border-[1.5px] rounded-[3px] px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-ink-faint font-mono" />
        <button onClick={handleLogin} disabled={loading} className="bg-ink text-paper rounded-[3px] py-3 w-full font-serif font-semibold text-[14px] border-b-2 border-seal disabled:opacity-50 mt-2">
          {loading ? "Memproses..." : "Masuk ke Meja Kerja"}
        </button>
        {error && <p className="text-xs text-warn text-center">{error}</p>}
      </div>
    </>
  );
}

export default function LoginPage() {
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(getClientAuth(), provider);
      const idToken = await userCredential.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Gagal login dengan Google");
        return;
      }
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("google login error:", err);
      const code = (err as { code?: string })?.code;
      if (
        code !== "auth/popup-closed-by-user" &&
        code !== "auth/cancelled-popup-request"
      ) {
        alert(getFirebaseErrorMessage(err));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{ background: "var(--paper)" }}>
      <div className="max-w-[420px] w-full">
        <div className="bg-card border-[1.5px] border-line rounded-[6px] shadow-lift p-8">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-seal flex items-center justify-center font-serif font-bold text-[18px] text-ink shadow-[0_4px_0_var(--seal-deep)]">OSIS</div>
          </div>
          <h1 className="font-serif text-[22px] font-semibold text-ink text-center mt-4">Meja Kerja OSIS</h1>
          <p className="text-[12px] text-ink-faint text-center mt-1 tracking-[0.6px] uppercase font-semibold">HUMAS · DASHBOARD</p>
          <Suspense fallback={<div className="mt-5 text-center text-[12.5px] text-ink-faint">Memuat...</div>}>
            <LoginForm />
          </Suspense>
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-line" />
            <span className="text-[10.5px] text-ink-faint font-bold uppercase tracking-[0.6px]">atau</span>
            <div className="flex-1 h-px bg-line" />
          </div>
          <button onClick={handleGoogleLogin} disabled={googleLoading} className="w-full bg-paper border-[1.5px] border-line rounded-[3px] py-2.5 flex items-center justify-center gap-3 text-[13px] text-ink font-serif font-semibold disabled:opacity-50">
            <IconBrandGoogle size={18} className="text-seal-deep" />
            {googleLoading ? "Memproses..." : "Masuk dengan Google"}
          </button>
          <p className="mt-6 pt-4 border-t border-line text-center text-[10.5px] text-ink-faint font-mono tracking-[0.4px]">◆ Hanya anggota yang disetujui admin</p>
        </div>
      </div>
    </div>
  );
}
