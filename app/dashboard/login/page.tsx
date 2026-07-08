"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
          if (data.user) {
            router.replace("/dashboard");
          }
        }
      } catch {
        // not logged in
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email dan password harus diisi");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Email atau password salah");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {statusParam === "pending" && (
        <div className="mt-4 bg-[#fff9ec] border border-[#ffe9a0] rounded-[14px] px-4 py-3">
          <p className="text-[13px] text-[#9a7000] text-center">Akunmu sedang menunggu persetujuan admin.</p>
        </div>
      )}
      {statusParam === "rejected" && (
        <div className="mt-4 bg-[#fff0f0] border border-[#f5b8b8] rounded-[14px] px-4 py-3">
          <p className="text-[13px] text-[#c0392b] text-center">Permintaan aksesmu ditolak oleh admin.</p>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full bg-[#f4f9fc] border border-[#c8dde8] rounded-[14px] px-4 py-3.5 text-[14px] text-[#1a3d47] outline-none placeholder:text-[#6ea2b3]"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="Password"
          className="w-full bg-[#f4f9fc] border border-[#c8dde8] rounded-[14px] px-4 py-3.5 text-[14px] text-[#1a3d47] outline-none placeholder:text-[#6ea2b3]"
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-[#7bbde8] text-white rounded-[14px] py-3.5 w-full font-medium text-[14px] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
        {error && <p className="text-[12px] text-red-500 text-center">{error}</p>}
      </div>
    </>
  );
}

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    try {
      const res = await fetch("/api/auth/login/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silently fail
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f9fc] flex items-center justify-center p-5">
      <div className="max-w-[400px] w-full">
        <div className="bg-white rounded-[20px] border border-[#c8dde8] p-7">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-[14px] bg-[#f4f9fc] border border-[#c8dde8] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#49769f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
          <h1 className="text-[20px] font-medium text-[#49769f] text-center mt-3">
            Dashboard Humas
          </h1>
          <p className="text-[13px] text-[#6ea2b3] text-center mt-1">
            OSIS · Humas
          </p>

          <Suspense fallback={<div className="mt-5 text-center text-[13px] text-[#6ea2b3]">Memuat...</div>}>
            <LoginForm />
          </Suspense>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[#c8dde8]" />
            <span className="text-[12px] text-[#a8c8d4]">atau</span>
            <div className="flex-1 h-px bg-[#c8dde8]" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-[#c8dde8] rounded-[14px] py-3 flex items-center justify-center gap-3 text-[14px] text-[#1a3d47] font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Masuk dengan Google
          </button>
        </div>
      </div>
    </div>
  );
}