"use client";

import { IconCheck, IconClock, IconArrowForward, IconUser, IconShield } from "@tabler/icons-react";

interface BadgeProps {
  status: "menunggu" | "diproses" | "dibalas" | "diteruskan" | "pending" | "admin" | "member";
}

const badgeConfig: Record<BadgeProps["status"], { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
  menunggu: { bg: "bg-blue-pale", text: "text-blue-dark", border: "border-blue/20", icon: <IconClock size={12} />, label: "Menunggu" },
  diproses: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: <IconClock size={12} />, label: "Diproses" },
  dibalas: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: <IconCheck size={12} />, label: "Dibalas" },
  diteruskan: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: <IconArrowForward size={12} />, label: "Diteruskan" },
  pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: <IconClock size={12} />, label: "Pending" },
  admin: { bg: "bg-blue", text: "text-white", border: "border-blue", icon: <IconShield size={12} />, label: "Admin" },
  member: { bg: "bg-blue-pale", text: "text-blue-dark", border: "border-blue/20", icon: <IconUser size={12} />, label: "Member" },
};

export default function Badge({ status }: BadgeProps) {
  const c = badgeConfig[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${c.bg} ${c.text} ${c.border}`}>
      {c.icon}
      {c.label}
    </span>
  );
}
