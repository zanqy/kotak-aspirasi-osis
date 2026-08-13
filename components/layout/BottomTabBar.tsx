"use client";

import { useRouter } from "next/navigation";
import { IconLayoutList, IconMessage, IconUsers } from "@tabler/icons-react";

interface BottomTabBarProps {
  active: "overview" | "aspirasi" | "anggota";
}

export default function BottomTabBar({ active }: BottomTabBarProps) {
  const router = useRouter();

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: IconLayoutList, path: "/dashboard" },
    { key: "anggota" as const, label: "Anggota", icon: IconUsers, path: "/dashboard/anggota" },
    { key: "aspirasi" as const, label: "Aspirasi", icon: IconMessage, path: "/dashboard/aspirasi" },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 border-t-2 border-ink"
      style={{
        background: "var(--card)",
        zIndex: 40,
      }}
    >
      <div
        className="flex items-center justify-around py-2.5 safe-bottom px-4"
      >
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => router.push(tab.path)}
              className="flex flex-col items-center gap-1 px-4 py-1 transition-all"
              style={{
                color: isActive ? "var(--seal-deep)" : "var(--ink-faint)",
              }}
            >
              <tab.icon
                size={20}
                stroke={isActive ? 2 : 1.5}
              />
              <span
                className="text-[10px] font-sans font-medium tracking-wide"
                style={{
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--ink)" : "var(--ink-faint)",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
