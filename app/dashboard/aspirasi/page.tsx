"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomTabBar from "@/components/layout/BottomTabBar";
import AspirasiItem from "@/components/ui/AspirasiItem";

interface Aspirasi { id: string; kode_tiket: string; isi: string; kategori: string | null; status: "menunggu" | "diproses" | "dibalas" | "diteruskan"; created_at: string; }

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
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) { const d = await sessionRes.json(); if (d.user) setUserName(d.user.name || ""); }
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
      if (res.ok) { const json = await res.json(); setAspirasi(json.data || []); }
    } catch {} finally { setLoading(false); }
  };

  const handleFilterChange = (status: string) => { setFilterStatus(status); fetchData(status); };

  const filtered = aspirasi.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return a.kode_tiket.toLowerCase().includes(q) || a.isi.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[480px] mx-auto pb-16">
        <DashboardNav title="Aspirasi" subtitle={`${aspirasi.length} total`} userName={userName} />
        <div className="px-4 py-3 bg-white border-b border-gray-100 flex gap-2">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari aspirasi..." className="flex-1 bg-gray-50 border-[1.5px] border-[#DCE8FF] rounded-[10px] px-3 py-2 text-[13px] text-navy outline-none placeholder:text-gray-400 focus:border-blue" />
        </div>
        <div className="px-4 py-2.5 bg-white border-b border-gray-100 flex gap-2 overflow-x-auto hide-scrollbar">
          {filterTabs.map((tab) => (
            <button key={tab.value} onClick={() => handleFilterChange(tab.value)} className={`text-xs px-3.5 py-1.5 rounded-full border whitespace-nowrap transition-colors font-medium ${filterStatus === tab.value ? "bg-blue text-white border-blue" : "bg-white text-gray-400 border-[#DCE8FF] hover:border-blue hover:text-blue"}`}>{tab.label}</button>
          ))}
        </div>
        {loading ? <div className="px-[18px] py-6 space-y-4">{[1,2,3].map((i) => <div key={i} className="animate-pulse"><div className="h-5 bg-gray-100 rounded w-24 mb-2" /><div className="h-4 bg-gray-100 rounded w-full mb-1" /><div className="h-4 bg-gray-100 rounded w-3/4" /></div>)}</div> :
         filtered.length === 0 ? <p className="text-[13px] text-gray-400 text-center py-10">Tidak ada aspirasi</p> :
         filtered.map((item) => <AspirasiItem key={item.id} kode={item.kode_tiket} waktu={item.created_at} preview={item.isi} status={item.status} kategori={item.kategori || ""} onClick={() => router.push(`/dashboard/aspirasi/${item.id}`)} />)}
        <BottomTabBar active="aspirasi" />
      </div>
    </div>
  );
}
