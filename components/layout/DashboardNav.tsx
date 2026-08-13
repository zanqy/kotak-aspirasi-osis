"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconArrowLeft, IconLogout } from "@tabler/icons-react";

interface DashboardNavProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  userName?: string;
  role?: string;
}


export default function DashboardNav({ title, subtitle, showBack = false, userName, role }: DashboardNavProps) {
  const router = useRouter();
  const initial = userName ? userName.charAt(0).toUpperCase() : "?";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/dashboard/login";
  };

  return (
    <header
      className="relative border-b-2 border-ink px-5 py-5 flex items-end justify-between gap-4 flex-wrap"
      style={{
        background: "linear-gradient(to right, var(--paper), var(--paper))",
        opacity: 0,
        animation: "riseInSm 0.7s ease 0.1s forwards",
      }}
    >
      {/* Masthead ID */}
      <div className="flex items-center gap-3">
        {/* Seal mark - lingkaran emas */}
        <motion.div
          className="w-10 h-10 rounded-full bg-seal flex items-center justify-center font-serif font-bold text-[16px] text-ink flex-shrink-0"
          style={{ boxShadow: "0 3px 0 var(--seal-deep)" }}
          whileHover={{ rotate: -8, scale: 1.05 }}
          transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
        >
          O
        </motion.div>

        {/* Nama & sub */}
        <div>
          <h1 className="font-serif font-semibold text-[19px] leading-[1.1] text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-ink-soft tracking-[0.4px] mt-[2px]">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Info chip - divisi */}
        {role && (
          <div className="text-right text-[11.5px] text-ink-soft leading-tight hidden sm:block">
            Bertugas sebagai<br />
            <b className="text-ink font-semibold">{role}</b>
          </div>
        )}

        {/* Avatar */}
        {userName && (
          <div
            className="w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center font-serif font-bold text-[13px] flex-shrink-0"
            title={userName}
          >
            {initial}
          </div>
        )}

        {/* Tombol kembali */}
        {showBack && (
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full border-[1.5px] border-line text-ink-soft hover:border-ink hover:text-ink bg-card flex items-center justify-center transition-all"
            aria-label="Kembali"
          >
            <IconArrowLeft size={18} />
          </button>
        )}

        {/* Tombol keluar */}
        <button
          onClick={handleLogout}
          className="w-9 h-9 rounded-full border-[1.5px] border-line text-ink-soft hover:border-ink hover:text-ink bg-transparent flex items-center justify-center transition-all"
          aria-label="Keluar"
          title="Keluar"
        >
          <IconLogout size={18} />
        </button>
      </div>
    </header>
  );
}
