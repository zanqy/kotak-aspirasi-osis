"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { IconBrandGoogle } from "@tabler/icons-react";

const e = [0.22, 1, 0.36, 1] as const;

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
      try { const res = await fetch("/api/auth/session"); if (res.ok) { const data = await res.json(); if (data.user) router.replace("/dashboard"); } } catch {}
    };
    checkSession();
  }, [router]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError("Email dan password harus diisi"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), password: password.trim() }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Email atau password salah"); return; }
      window.location.href = "/dashboard";
    } catch { setError("Gagal terhubung ke server"); }
    finally { setLoading(false); }
  };

  return (
    <>
      {statusParam === "pending" && (
        <motion.div
          className="mt-4 bg-paper-deep border border-warn rounded-[3px] px-4 py-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[13px] text-warn text-center font-medium">Akunmu sedang menunggu persetujuan admin.</p>
        </motion.div>
      )}
      {statusParam === "rejected" && (
        <motion.div
          className="mt-4 bg-paper-deep border border-warn rounded-[3px] px-4 py-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[13px] text-warn text-center font-medium">Permintaan aksesmu ditolak oleh admin.</p>
        </motion.div>
      )}
      <div className="mt-5 flex flex-col gap-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: e, delay: 0.3 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={`w-full bg-paper border-[1.5px] rounded-[3px] px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-ink-faint font-mono focus:border-seal-deep focus:shadow-[0_0_0_3px_rgba(224,165,38,0.18)] ${error ? "border-warn" : "border-line"}`}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: e, delay: 0.5 }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Password"
            className={`w-full bg-paper border-[1.5px] rounded-[3px] px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-ink-faint font-mono focus:border-seal-deep focus:shadow-[0_0_0_3px_rgba(224,165,38,0.18)] ${error ? "border-warn" : "border-line"}`}
          />
        </motion.div>
        <motion.button
          onClick={handleLogin}
          disabled={loading}
          className="bg-ink text-paper rounded-[3px] py-3 w-full font-serif font-semibold text-[14px] border-b-2 border-seal transition-all duration-300 hover:-translate-y-0.5 hover:shadow-paper disabled:opacity-50 mt-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: e, delay: 0.7 }}
          whileTap={{ scale: 0.96 }}
        >
          {loading ? "Memproses..." : "Masuk ke Meja Kerja"}
        </motion.button>
        {error && (
          <motion.p className="text-xs text-warn text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {error}
          </motion.p>
        )}
      </div>
    </>
  );
}

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    try {
      const res = await fetch("/api/auth/login/google", { method: "POST", headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{ background: 'var(--paper)' }}>
      <div className="max-w-[420px] w-full">
        <motion.div
          className="bg-card border-[1.5px] border-line rounded-[6px] shadow-lift p-8 relative paper-fold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: e }}
        >
          {/* Seal mark */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 2, rotate: -14 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
          >
            <div className="w-14 h-14 rounded-full bg-seal flex items-center justify-center font-serif font-bold text-[18px] text-ink shadow-[0_4px_0_var(--seal-deep)]">
              OSIS
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="font-serif text-[22px] font-semibold text-ink text-center mt-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: e, delay: 0.2 }}
          >
            Meja Kerja OSIS
          </motion.h1>
          <motion.p
            className="text-[12px] text-ink-faint text-center mt-1 tracking-[0.6px] uppercase font-semibold"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: e, delay: 0.3 }}
          >
            HUMAS · DASHBOARD
          </motion.p>

          <Suspense fallback={<div className="mt-5 text-center text-[12.5px] text-ink-faint">Memuat...</div>}>
            <LoginForm />
          </Suspense>

          {/* Divider */}
          <motion.div
            className="flex items-center gap-3 my-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: e, delay: 0.9 }}
          >
            <div className="flex-1 h-px bg-line" />
            <span className="text-[10.5px] text-ink-faint font-bold uppercase tracking-[0.6px]">atau</span>
            <div className="flex-1 h-px bg-line" />
          </motion.div>

          {/* Google button */}
          <motion.button
            onClick={handleGoogleLogin}
            className="w-full bg-paper border-[1.5px] border-line rounded-[3px] py-2.5 flex items-center justify-center gap-3 text-[13px] text-ink font-serif font-semibold transition-all duration-300 hover:bg-paper-deep hover:-translate-y-0.5 hover:border-ink hover:shadow-paper"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: e, delay: 1.0 }}
            whileTap={{ scale: 0.96 }}
          >
            <IconBrandGoogle size={18} className="text-seal-deep" />
            Masuk dengan Google
          </motion.button>

          {/* Ticker kecil di bawah */}
          <motion.div
            className="mt-6 pt-4 border-t border-line text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: e, delay: 1.2 }}
          >
            <p className="text-[10.5px] text-ink-faint font-mono tracking-[0.4px]">
              ◆ Hanya anggota yang disetujui admin
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
