"use client";

import { useRouter } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";

interface DashboardNavProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  userName?: string;
}

export default function DashboardNav({ title, subtitle, showBack = false, userName }: DashboardNavProps) {
  const router = useRouter();
  const initial = userName ? userName.charAt(0).toUpperCase() : "?";

  return (
    <div className="relative border-b-2 border-ink px-5 py-5 flex items-end justify-between gap-4 flex-wrap">
      {/* Masthead ID - Seal mark */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-seal flex items-center justify-center font-serif font-bold text-[16px] text-ink flex-shrink-0 shadow-[0_3px_0_var(--seal-deep)]">
          OSIS
        </div>
        <div>
          <h1 className="font-serif font-semibold text-[19px] leading-[1.1] text-ink">{title}</h1>
          {subtitle && <p className="text-[11px] text-ink-soft tracking-[0.4px] mt-[2px]">{subtitle}</p>}
        </div>
      </div>

      {/* Right side - back button & user */}
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full border-[1.5px] border-line text-ink-soft hover:border-ink hover:text-ink bg-card flex items-center justify-center transition-all">
            <IconArrowLeft size={18} />
          </button>
        )}
        {userName && (
          <div className="w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center font-serif font-bold text-[13px] flex-shrink-0">
            {initial}
          </div>
        )}
      </div>
    </div>
  );
}
