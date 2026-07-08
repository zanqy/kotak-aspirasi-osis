"use client";

import { useRouter } from "next/navigation";

interface BottomTabBarProps {
  active: "overview" | "aspirasi" | "anggota";
}

export default function BottomTabBar({ active }: BottomTabBarProps) {
  const router = useRouter();

  const tabs = [
    {
      key: "overview",
      label: "Overview",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      path: "/dashboard",
    },
    {
      key: "aspirasi",
      label: "Aspirasi",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      path: "/dashboard/aspirasi",
    },
    {
      key: "anggota",
      label: "Anggota",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      path: "/dashboard/anggota",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-[#f0f7fa] flex items-center justify-around py-2 safe-bottom">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => router.push(tab.path)}
            className="flex flex-col items-center gap-0.5 px-4 py-1"
            style={{ color: isActive ? "#49769f" : "#a8c8d4" }}
          >
            {tab.icon}
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}