"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomTabBar from "@/components/layout/BottomTabBar";
import AspirasiItem from "@/components/ui/AspirasiItem";

interface Aspirasi {
  id: string;
  kode_tiket: string;
  isi: string;
  kategori: string | null;
  status: "menunggu" | "diproses" | "dibalas" | "diteruskan";
  created_at: string;
}

const filterTabs = [
  { label: "Semua", value: "" },
  { label: "Menunggu", value: "menunggu" },
  { label: "Diproses", value: "diproses" },
  { label: "Dibalas", value: "dibalas" },
  { label: "Diteruskan", value: "diteruskan" },
];

export default function AspirasiList() {
  const router = useRouter();
  const [aspirasi, setAspirasi] = useState<Aspirasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const init = async () => {
      // Get session from API
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData.user) {
          setUserName(sessionData.user.name || "");
        }
      }
      fetchData();
    };
    init();
  }, []);

  const fetchData = async (statusFilter?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/dashboard/aspirasi?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setAspirasi(json.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    fetchData(status);
  };

  const filtered = aspirasi.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.kode_tiket.toLowerCase().includes(q) ||
      a.isi.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[480px] mx-auto pb-16">
        <DashboardNav
          title="Aspirasi"
          subtitle={`${aspirasi.length} total`}
          userName={userName}
        />

        {/* Search Bar */}
        <div className="px-4 py-3 bg-white border-b border-[#f0f7fa] flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aspirasi..."
            className="flex-1 bg-[#f4f9fc] border border-[#c8dde8] rounded-[10px] px-3 py-2 text-[13px] text-[#1a3d47] outline-none placeholder:text-[#6ea2b3]"
          />
          <button className="bg-[#f4f9fc] border border-[#c8dde8] rounded-[10px] px-3 py-2 text-[12px] text-[#6ea2b3] flex-shrink-0">
            Filter
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-2.5 bg-white border-b border-[#f0f7fa] flex gap-2 overflow-x-auto hide-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleFilterChange(tab.value)}
              className={`text-[12px] px-3.5 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                filterStatus === tab.value
                  ? "bg-[#49769f] text-white border-[#49769f]"
                  : "bg-white text-[#6ea2b3] border-[#c8dde8]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="px-[18px] py-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-5 bg-[#f4f9fc] rounded w-24 mb-2" />
                <div className="h-4 bg-[#f4f9fc] rounded w-full mb-1" />
                <div className="h-4 bg-[#f4f9fc] rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-[13px] text-[#6ea2b3] text-center py-10">
            Tidak ada aspirasi
          </p>
        ) : (
          filtered.map((item) => (
            <AspirasiItem
              key={item.id}
              kode={item.kode_tiket}
              waktu={item.created_at}
              preview={item.isi}
              status={item.status}
              kategori={item.kategori || ""}
              onClick={() => router.push(`/dashboard/aspirasi/${item.id}`)}
            />
          ))
        )}

        <BottomTabBar active="aspirasi" />
      </div>
    </div>
  );
}