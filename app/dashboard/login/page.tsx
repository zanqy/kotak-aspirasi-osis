"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { IconLock, IconBrandGoogle } from "@tabler/icons-react";

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
      {statusParam === "pending" && <motion.div className="mt-4 bg-amber-50 border border-amber-200 rounded-[14px] px-4 py-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}><p className="text-[13px] text-amber-700 text-center">Akunmu sedang menunggu persetujuan admin.</p></motion.div>}
      {statusParam === "rejected" && <motion.div className="mt-4 bg-red-50 border border-red-200 rounded-[14px] px-4 py-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}><p className="text-[13px] text-red-600 text-center">Permintaan aksesmu ditolak oleh admin.</p></motion.div>}
      <div className="mt-5 flex flex-col gap-3">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: e, delay: 0.3 }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={`w-full bg-gray-50 border-[1.5px] rounded-[14px] px-4 py-3.5 text-sm text-navy outline-none placeholder:text-gray-400 focus:border-blue focus:shadow-[0_0_0_4px_rgba(29,111,255,0.06)] ${error ? "border-red-400" : "border-[#DCE8FF]"}`} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: e, delay: 0.5 }}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="Password" className={`w-full bg-gray-50 border-[1.5px] rounded-[14px] px-4 py-3.5 text-sm text-navy outline-none placeholder:text-gray-400 focus:border-blue focus:shadow-[0_0_0_4px_rgba(29,111,255,0.06)] ${error ? "border-red-400" : "border-[#DCE8FF]"}`} />
        </motion.div>
        <motion.button onClick={handleLogin} disabled={loading} className="bg-gradient-to-br from-blue to-blue-dark text-white rounded-[9px] py-3.5 w-full font-display font-semibold text-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(29,111,255,0.3)] active:scale-95 disabled:opacity-50" initial={{ opacity: 0, scale: 0.3, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, ease: e, delay: 0.7 }} whileTap={{ scale: 0.96 }}>{loading ? "Memproses..." : "Masuk"}</motion.button>
        {error && <motion.p className="text-xs text-red-500 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>}
      </div>
    </>
  );
}

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    try { const res = await fetch("/api/auth/login/google", { method: "POST", headers: { "Content-Type": "application/json" } }); const data = await res.json(); if (data.url) window.location.href = data.url; } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="max-w-[400px] w-full">
        <motion.div className="bg-white rounded-[20px] border border-[#E8EFFF] p-7" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: e }}>
          <motion.div className="flex justify-center" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: e }}>
            <div className="w-12 h-12 rounded-[14px] bg-blue-pale border border-[#DCE8FF] flex items-center justify-center"><IconLock size={24} className="text-blue" /></div>
          </motion.div>
          <motion.h1 className="font-display text-xl font-semibold text-navy text-center mt-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: e, delay: 0.1 }}>Dashboard Humas</motion.h1>
          <motion.p className="text-[13px] text-gray-400 text-center mt-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: e, delay: 0.2 }}>OSIS · Humas</motion.p>
          <Suspense fallback={<div className="mt-5 text-center text-[13px] text-gray-400">Memuat...</div>}><LoginForm /></Suspense>
          <motion.div className="flex items-center gap-3 my-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: e, delay: 0.9 }}><div className="flex-1 h-px bg-[#DCE8FF]" /><span className="text-xs text-gray-400">atau</span><div className="flex-1 h-px bg-[#DCE8FF]" /></motion.div>
          <motion.button onClick={handleGoogleLogin} className="w-full bg-white border-[1.5px] border-[#DCE8FF] rounded-[9px] py-3 flex items-center justify-center gap-3 text-sm text-navy font-display font-medium transition-all duration-500 hover:bg-blue-pale hover:-translate-y-0.5 hover:border-blue active:scale-95" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: e, delay: 1.0 }} whileTap={{ scale: 0.96 }}>
            <IconBrandGoogle size={20} className="text-blue" /> Masuk dengan Google
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
