"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
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
  { label: "Semua map", value: "" },
  { label: "Akademik", value: "akademik" },
  { label: "Fasilitas", value: "fasilitas" },
  { label: "Kegiatan", value: "kegiatan" },
  { label: "Lainnya", value: "lainnya" },
];

const _e = [0.22, 1, 0.36, 1] as const;

function AspirasiListInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [aspirasi, setAspirasi] = useState<Aspirasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "");
  const [userName, setUserName] = useState("");

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
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const d = await sessionRes.json();
          if (d.user) setUserName(d.user.name || "");
        } else {
          router.push("/dashboard/login");
          return;
        }
      } catch {
        // ignore
      }
      fetchData(filterStatus);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    fetchData(status);
    const url = new URL(window.location.href);
    if (status) url.searchParams.set("status", status);
    else url.searchParams.delete("status");
    window.history.replaceState({}, "", url.toString());
  };

  const filtered = aspirasi.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return a.kode_tiket.toLowerCase().includes(q) || a.isi.toLowerCase().includes(q);
  }).filter((a) => {
    if (!filterStatus) return true;
    return a.kategori === filterStatus;
  });

  const mapStatus = (status: Aspirasi["status"]): "baru" | "diproses" | "diteruskan" | "selesai" => {
    if (status === "menunggu") return "baru";
    if (status === "dibalas") return "selesai";
    return status;
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      <div className="max-w-[900px] mx-auto pb-20 px-4 pt-6">
        <DashboardNav title="Arsip Aspirasi" subtitle={`${aspirasi.length} total surat`} userName={userName} />

        <motion.div
          className="flex items-center gap-2 bg-card border-[1.5px] border-line rounded-[99px] px-4 py-2.5 my-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: e, delay: 0.2 }}
        >
          <i className="ti ti-search text-ink-faint" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan kode tiket atau isi surat..."
            className="flex-1 bg-transparent border-none outline-none text-[12.5px] text-ink placeholder:text-ink-faint"
          />
        </motion.div>

        <motion.div
          className="flex gap-0.5 pl-[14px] -mb-px"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: e, delay: 0.3 }}
        >
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleFilterChange(tab.value)}
              className={[
                "font-serif text-[12.5px] font-semibold",
                "px-4 py-2.5 rounded-t-lg",
                "border-[1.5px] border-b-0 transition-all",
                filterStatus === tab.value
                  ? "bg-card text-ink border-line relative z-[2]"
                  : "bg-paper-deep text-ink-soft border-line hover:text-ink",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        <div
          className="bg-card border-[1.5px] border-line rounded-r-md rounded-b-md shadow-paper relative"
          style={{ animation: "unfold 0.7s cubic-bezier(0.22,1,0.36,1) forwards" }}
        >
          <div className="relative z-[1] py-1">
            {loading ? (
              <div className="px-[18px] py-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-5 bg-paper-deep rounded w-24 mb-2" />
                    <div className="h-4 bg-paper-deep rounded w-full mb-1" />
                    <div className="h-4 bg-paper-deep rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-ink-faint">
                <i className="ti ti-inbox text-[30px] block mb-2" />
                <p className="text-[12.5px]">
                  Tidak ada aspirasi{filterStatus ? ` dengan status ${filterStatus}` : ""}
                </p>
              </div>
            ) : (
              filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: e, delay: 0.1 * i }}
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
                  {i < filtered.length - 1 && <div className="h-px bg-line mx-[18px]" />}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
      <BottomTabBar active="aspirasi" />
    </div>
  );
}

export default function AspirasiList() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "var(--paper)" }}
        >
          <div className="text-ink-faint text-[13px]">Memuat arsip...</div>
        </div>
      }
    >
      <AspirasiListInner />
    </Suspense>
  );
}
