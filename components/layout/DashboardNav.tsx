"use client";

import { useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";

interface DashboardNavProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  badge?: { status: "menunggu" | "diproses" | "dibalas" | "diteruskan" };
  userName?: string;
}

export default function DashboardNav({
  title,
  subtitle,
  showBack = false,
  badge,
  userName,
}: DashboardNavProps) {
  const router = useRouter();

  const initial = userName
    ? userName.charAt(0).toUpperCase()
    : "?";

  return (
    <div className="bg-[#49769f] px-[18px] pt-9 pb-4 flex items-center gap-3">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="text-[#a8d4e8] hover:text-white transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-[15px] font-medium text-white truncate">{title}</h1>
          {badge && <Badge status={badge.status} />}
        </div>
        {subtitle && (
          <p className="text-[11px] text-[#a8d4e8] truncate mt-0.5">{subtitle}</p>
        )}
      </div>
      {userName && (
        <div className="w-8 h-8 rounded-full bg-[#a8d4e8] flex items-center justify-center flex-shrink-0">
          <span className="text-[13px] font-medium text-[#49769f]">{initial}</span>
        </div>
      )}
    </div>
  );
}