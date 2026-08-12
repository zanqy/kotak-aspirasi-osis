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

// Ticker content for masthead
const tickerItems = [
  "Selamat Datang di Meja Kerja OSIS",
  "Kelola aspirasi dengan rapi",
  "Tanggapi setiap suara siswa",
];

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

  // Map status untuk AspirasiItem
  const mapStatus = (status: Aspirasi["status"]): "baru" | "diproses" | "diteruskan" | "selesai" => {
    if (status === "menunggu") return "baru";
    if (status === "dibalas") return "selesai";
    return status;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      {/* Ticker marquee */}
      <div className="overflow-hidden border-b border-line bg-paper-deep">
        <div className="flex gap-10 whitespace-nowrap py-1.5 px-4" style={{ animation: 'marquee 34s linear infinite', width: 'max-content' }}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-ink-faint">
              ● {item}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto pb-20 px-4 pt-6">
        <DashboardNav title="Dashboard OSIS" subtitle={`Selamat datang, ${userName}`} userName={userName} />

        {/* Rak stempel - stat cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-[18px] my-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: e, delay: 0.35 }}
        >
          {[
            { value: stats.total, label: "Total surat", badgeText: "Arsip", icon: "ti ti-mail", status: "" },
            { value: stats.menunggu, label: "Belum dibuka", badgeText: "Antre", icon: "ti ti-mail-opened", status: "menunggu" },
            { value: stats.dibalas, label: "Sudah dibalas", badgeText: "Tuntas", icon: "ti ti-check", status: "dibalas" },
            { value: stats.diteruskan, label: "Diteruskan", badgeText: "Proses", icon: "ti ti-send", status: "diteruskan" },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: e, delay: 0.5 + i * 0.1 }}
            >
              <StatCard
                label={card.label}
                value={card.value}
                badgeText={card.badgeText}
                icon={card.icon}
                onClick={() => card.status && router.push(`/dashboard/aspirasi?status=${card.status}`)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Section title */}
        <motion.p
          className="text-[12.5px] font-bold text-ink-soft uppercase tracking-[1px] mb-4 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: e, delay: 0.6 }}
        >
          <span className="flex-1 h-px bg-line" />
          Terbaru Masuk
        </motion.p>

        {/* List aspirasi */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-5 bg-paper-deep rounded w-24 mb-2" />
                <div className="h-4 bg-paper-deep rounded w-full mb-1" />
                <div className="h-4 bg-paper-deep rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : terbaru.length === 0 ? (
          <div className="text-center py-16 text-ink-faint">
            <i className="ti ti-inbox text-[30px] block mb-2" />
            <p className="text-[12.5px]">Belum ada aspirasi masuk</p>
          </div>
        ) : (
          <div className="bg-card border border-line rounded-[6px] shadow-paper">
            {terbaru.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: e, delay: 0.6 + i * 0.08 }}
              >
                <AspirasiItem
                  id={parseInt(item.id) || i}
                  code={item.kode_tiket}
                  category={item.kategori || "Lainnya"}
                  excerpt={item.isi}
                  status={mapStatus(item.status)}
                  date={item.created_at}
                  isUnread={item.status === "menunggu"}
                  isSelected={false}
                  onClick={() => router.push(`/dashboard/aspirasi/${item.id}`)}
                />
                {i < terbaru.length - 1 && <div className="h-px bg-line mx-[18px]" />}
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <BottomTabBar active="overview" />
    </div>
  );
}
