"use client";

import { useRouter } from "next/navigation";
import { IconLayoutList, IconMessage, IconUsers } from "@tabler/icons-react";

interface BottomTabBarProps {
  active: "overview" | "aspirasi" | "anggota";
}

export default function BottomTabBar({ active }: BottomTabBarProps) {
  const router = useRouter();

  const tabs = [
    { key: "overview", label: "Overview", icon: IconLayoutList, path: "/dashboard" },
    { key: "aspirasi", label: "Aspirasi", icon: IconMessage, path: "/dashboard/aspirasi" },
    { key: "anggota", label: "Anggota", icon: IconUsers, path: "/dashboard/anggota" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-gray-100 flex items-center justify-around py-2 safe-bottom">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => router.push(tab.path)}
            className="flex flex-col items-center gap-0.5 px-4 py-1 transition-colors"
            style={{ color: isActive ? "#1D6FFF" : "#94A3B8" }}
          >
            <tab.icon size={20} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
