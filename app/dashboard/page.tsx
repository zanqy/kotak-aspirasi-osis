"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomTabBar from "@/components/layout/BottomTabBar";
import StatCard from "@/components/ui/StatCard";
import AspirasiItem from "@/components/ui/AspirasiItem";

interface Aspirasi { id: string; kode_tiket: string; isi: string; kategori: string | null; status: "menunggu" | "diproses" | "dibalas" | "diteruskan"; created_at: string; }

const e = [0.22, 1, 0.36, 1] as const;

export default function DashboardOverview() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({ total: 0, menunggu: 0, dibalas: 0, diteruskan: 0 });
  const [terbaru, setTerbaru] = useState<Aspirasi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) { router.push("/dashboard/login"); return; }
        const sessionData = await sessionRes.json();
        if (!sessionData.user) { router.push("/dashboard/login"); return; }
        setUserName(sessionData.user.name || "Pengguna");
        const res = await fetch("/api/dashboard/aspirasi");
        if (res.ok) {
          const json = await res.json();
          const all: Aspirasi[] = json.data || [];
          setStats({ total: json.total || 0, menunggu: all.filter((a) => a.status === "menunggu" || a.status === "diproses").length, dibalas: all.filter((a) => a.status === "dibalas").length, diteruskan: all.filter((a) => a.status === "diteruskan").length });
          setTerbaru(all.slice(0, 5));
        }
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[480px] mx-auto pb-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: e }}>
          <DashboardNav title="Dashboard Humas" subtitle={`Selamat datang, ${userName}`} userName={userName} />
        </motion.div>
        <div className="grid grid-cols-2 gap-[10px] p-4">
          {[{ n: stats.total, l: "Total aspirasi", c: "default" as const }, { n: stats.menunggu, l: "Belum dibalas", c: "yellow" as const }, { n: stats.dibalas, l: "Sudah dibalas", c: "green" as const }, { n: stats.diteruskan, l: "Diteruskan", c: "purple" as const }].map((card, i) => (
            <motion.div key={card.l} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: e, delay: 0.2 + i * 0.1 }}>
              <StatCard number={card.n} label={card.l} color={card.c as "default" | "yellow" | "green" | "purple"} animate />
            </motion.div>
          ))}
        </div>
        <motion.p className="text-[13px] font-display font-semibold text-blue px-[18px] pt-1 pb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: e, delay: 0.6 }}>Terbaru masuk</motion.p>
        {loading ? <div className="px-[18px] space-y-3">{[1,2,3].map((i) => <div key={i} className="animate-pulse"><div className="h-5 bg-gray-100 rounded w-24 mb-2" /><div className="h-4 bg-gray-100 rounded w-full mb-1" /><div className="h-4 bg-gray-100 rounded w-3/4" /></div>)}</div> :
         terbaru.length === 0 ? <p className="text-[13px] text-gray-400 text-center py-10">Belum ada aspirasi</p> :
         terbaru.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: e, delay: 0.6 + i * 0.06 }}>
            <AspirasiItem kode={item.kode_tiket} waktu={item.created_at} preview={item.isi} status={item.status} kategori={item.kategori || ""} onClick={() => router.push(`/dashboard/aspirasi/${item.id}`)} />
          </motion.div>
        ))}
        <BottomTabBar active="overview" />
      </div>
    </div>
  );
}
