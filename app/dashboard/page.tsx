"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomTabBar from "@/components/layout/BottomTabBar";
import StatCard from "@/components/ui/StatCard";
import AspirasiItem from "@/components/ui/AspirasiItem";

interface Aspirasi {
  id: string;
  kode_tiket: string;
  isi: string;
  kategori: string | null;
  status: "menunggu" | "diproses" | "dibalas" | "diteruskan";
  created_at: string;
}

export default function DashboardOverview() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    menunggu: 0,
    dibalas: 0,
    diteruskan: 0,
  });
  const [terbaru, setTerbaru] = useState<Aspirasi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get session from API
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) {
          router.push("/dashboard/login");
          return;
        }
        const sessionData = await sessionRes.json();
        if (!sessionData.user) {
          router.push("/dashboard/login");
          return;
        }
        setUserName(sessionData.user.name || "Pengguna");

        // Fetch aspirasi from API
        const res = await fetch("/api/dashboard/aspirasi");
        if (res.ok) {
          const json = await res.json();
          const all: Aspirasi[] = json.data || [];
          setStats({
            total: json.total || 0,
            menunggu: all.filter((a) => a.status === "menunggu" || a.status === "diproses").length,
            dibalas: all.filter((a) => a.status === "dibalas").length,
            diteruskan: all.filter((a) => a.status === "diteruskan").length,
          });
          setTerbaru(all.slice(0, 5));
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[480px] mx-auto pb-16">
        <DashboardNav
          title="Dashboard Humas"
          subtitle={`Selamat datang, ${userName}`}
          userName={userName}
        />

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-[10px] p-4">
          <StatCard number={stats.total} label="Total aspirasi" />
          <StatCard number={stats.menunggu} label="Belum dibalas" color="yellow" />
          <StatCard number={stats.dibalas} label="Sudah dibalas" color="green" />
          <StatCard number={stats.diteruskan} label="Diteruskan" color="purple" />
        </div>

        {/* Terbaru Masuk */}
        <p className="text-[13px] font-medium text-[#49769f] px-[18px] pt-1 pb-2">
          Terbaru masuk
        </p>
        <div>
          {loading ? (
            <div className="px-[18px] space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-5 bg-[#f4f9fc] rounded w-24 mb-2" />
                  <div className="h-4 bg-[#f4f9fc] rounded w-full mb-1" />
                  <div className="h-4 bg-[#f4f9fc] rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : terbaru.length === 0 ? (
            <p className="text-[13px] text-[#6ea2b3] text-center py-10">
              Belum ada aspirasi
            </p>
          ) : (
            terbaru.map((item) => (
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
        </div>

        <BottomTabBar active="overview" />
      </div>
    </div>
  );
}