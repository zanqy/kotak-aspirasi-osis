"use client";

import { useRouter } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";
import Badge from "@/components/ui/Badge";

interface DashboardNavProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  badge?: { status: "menunggu" | "diproses" | "dibalas" | "diteruskan" };
  userName?: string;
}

export default function DashboardNav({ title, subtitle, showBack = false, badge, userName }: DashboardNavProps) {
  const router = useRouter();
  const initial = userName ? userName.charAt(0).toUpperCase() : "?";

  return (
    <div className="bg-navy px-[18px] pt-9 pb-4 flex items-center gap-3">
      {showBack && (
        <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors flex-shrink-0">
          <IconArrowLeft size={20} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-[15px] font-semibold text-white truncate">{title}</h1>
          {badge && <Badge status={badge.status} />}
        </div>
        {subtitle && <p className="text-[11px] text-white/50 truncate mt-0.5">{subtitle}</p>}
      </div>
      {userName && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue to-blue-light flex items-center justify-center flex-shrink-0">
          <span className="text-[13px] font-semibold text-white">{initial}</span>
        </div>
      )}
    </div>
  );
}
