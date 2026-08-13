"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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

const e = [0.22, 1, 0.36, 1] as const;

// Ticker content - marquee di masthead
const tickerItems = [
  "Surat baru datang setiap hari, jangan biarkan menumpuk",
  "Target balas dalam 3–5 hari kerja",
  "Identitas pengirim tetap dirahasiakan dari sistem ini",
];

const kategoriLabels: Record<string, string> = {
  akademik: "Akademik",
  fasilitas: "Fasilitas",
  kegiatan: "Kegiatan",
  lainnya: "Lainnya",
};

export default function DashboardOverview() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [stats, setStats] = useState({ total: 0, menunggu: 0, diproses: 0, dibalas: 0 });
  const [terbaru, setTerbaru] = useState<Aspirasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("semua");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) { router.push("/dashboard/login"); return; }
        const sessionData = await sessionRes.json();
        if (!sessionData.user) { router.push("/dashboard/login"); return; }
        setUserName(sessionData.user.name || "Pengguna");
        setUserRole(sessionData.user.role === "admin" ? "Divisi Admin" : "Divisi OSIS");
        const res = await fetch("/api/dashboard/aspirasi");
        if (res.ok) {
          const json = await res.json();
          const all: Aspirasi[] = json.data || [];
          setStats({
            total: all.length,
            menunggu: all.filter((a) => a.status === "menunggu").length,
            diproses: all.filter((a) => a.status === "diproses" || a.status === "diteruskan").length,
            dibalas: all.filter((a) => a.status === "dibalas").length,
          });
          setTerbaru(all.slice(0, 10));
        }
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [router]);

  // Filter berdasarkan tab & search
  const filtered = terbaru.filter((a) => {
    // Tab filter
    if (activeTab === "semua") {
      // tidak ada filter
    } else if (activeTab === "belum") {
      if (a.status !== "menunggu") return false;
    } else if (activeTab === "diproses") {
      if (a.status !== "diproses" && a.status !== "diteruskan") return false;
    } else if (activeTab === "selesai") {
      if (a.status !== "dibalas") return false;
    } else {
      // filter kategori
      if (a.kategori !== activeTab) return false;
    }
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!a.kode_tiket.toLowerCase().includes(q) && !a.isi.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const mapStatus = (status: Aspirasi["status"]): "baru" | "diproses" | "diteruskan" | "selesai" => {
    if (status === "menunggu") return "baru";
    if (status === "dibalas") return "selesai";
    if (status === "diteruskan") return "diteruskan";
    return "diproses";
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          radial-gradient(1000px 500px at 85% -10%, rgba(224,165,38,0.06), transparent 60%),
          var(--paper)
        `,
      }}
    >
      {/* Ticker marquee */}
      <div
        className="overflow-hidden border-b border-line"
        style={{ background: "var(--paper-deep)" }}
      >
        <div
          className="flex gap-10 whitespace-nowrap py-1.5"
          style={{ animation: "marquee 34s linear infinite", width: "max-content" }}
        >
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span
              key={i}
              className="text-[10.5px] font-bold uppercase tracking-[0.6px]"
              style={{ color: "var(--ink-faint)" }}
            >
              <i className="ti ti-inbox" style={{ color: "var(--seal-deep)", marginRight: 6 }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      <DashboardNav
        title="Meja Kerja OSIS"
        subtitle="Kotak Suara · Kepengurusan 2024/2025"
        userName={userName}
        role={userRole}
      />

      <div className="max-w-[1320px] mx-auto px-5 pb-20 pt-6">

        {/* Workspace head */}
        <motion.div
          className="flex items-end justify-between gap-4 flex-wrap mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: e, delay: 0.35 }}
        >
          <div>
            <h1 className="font-serif font-semibold text-[24px] md:text-[30px] text-ink" style={{ letterSpacing: "-0.3px" }}>
              Selamat bertugas, {userName.split(" ")[0]} 👋
            </h1>
            <p className="text-[12.5px] text-ink-soft mt-1 max-w-[440px] leading-relaxed">
              Ini meja arsip suratmu hari ini — buka amplopnya satu-satu, tentukan tindak lanjut­nya.
            </p>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-card border-[1.5px] border-line rounded-[99px] px-4 py-2.5 min-w-[230px]">
            <i className="ti ti-search text-ink-faint" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode tiket atau isi surat..."
              className="flex-1 bg-transparent border-none outline-none text-[12.5px] text-ink placeholder:text-ink-faint"
            />
          </div>
        </motion.div>

        {/* Rak stempel - stat cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-[18px] mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: e }}
        >
          {[
            { value: stats.total, label: "Total surat", badgeText: "Arsip", icon: "ti ti-mail", filter: "" },
            { value: stats.menunggu, label: "Belum dibuka", badgeText: "Antre", icon: "ti ti-mail-opened", filter: "belum" },
            { value: stats.diproses, label: "Sedang diproses", badgeText: "Proses", icon: "ti ti-loader-2", filter: "diproses" },
            { value: stats.dibalas, label: "Selesai", badgeText: "Tuntas", icon: "ti ti-check", filter: "selesai" },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: e, delay: 0.5 + i * 0.1 }}
              onClick={() => setActiveTab(card.filter || "semua")}
              style={{ cursor: "pointer" }}
            >
              <StatCard
                label={card.label}
                value={card.value}
                badgeText={card.badgeText}
                icon={card.icon}
                onClick={() => setActiveTab(card.filter || "semua")}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Archive layout - 2 kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-6 items-start">
          {/* Folder panel - kiri */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: e, delay: 0.9 }}
          >
            {/* Folder tabs - kategori */}
            <div className="flex gap-0.5 pl-[14px] -mb-px">
              {[
                { label: "Semua map", value: "semua" },
                { label: "Akademik", value: "akademik" },
                { label: "Fasilitas", value: "fasilitas" },
                { label: "Kegiatan", value: "kegiatan" },
                { label: "Lainnya", value: "lainnya" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={[
                    "font-serif text-[12.5px] font-semibold px-4 py-2.5 rounded-t-lg",
                    "border-[1.5px] border-b-0 transition-all",
                    activeTab === tab.value
                      ? "bg-card text-ink border-line relative z-[2]"
                      : "bg-paper-deep text-ink-soft border-line hover:text-ink",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Folder body */}
            <div
              className="bg-card border-[1.5px] border-line rounded-r-md rounded-b-md shadow-paper relative"
              style={{ boxShadow: "var(--shadow-paper)" }}
            >
              {/* Jahitan dashed */}
              <div
                aria-hidden="true"
                className="absolute inset-[9px] rounded-[2px] pointer-events-none -z-0"
                style={{
                  border: "1.5px dashed var(--line)",
                }}
              />
              <div className="relative z-[1] py-1">
                {/* Meta row */}
                <div className="flex items-center justify-between px-[22px] pt-4 pb-2 text-[11px]" style={{ color: "var(--ink-faint)" }}>
                  <span>{filtered.length} surat dalam map ini</span>
                  <span>Diurutkan: terbaru dulu</span>
                </div>

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
                  <div className="text-center py-16" style={{ color: "var(--ink-faint)" }}>
                    <i className="ti ti-folder-x text-[30px] block mb-2" />
                    <p className="text-[12.5px] max-w-[220px] mx-auto leading-relaxed">
                      Map ini masih kosong. Coba ganti filter atau kata kunci pencarian.
                    </p>
                  </div>
                ) : (
                  filtered.map((item, i) => (
                    <div key={item.id}>
                      <AspirasiItem
                        id={parseInt(item.id) || i}
                        code={item.kode_tiket}
                        category={kategoriLabels[item.kategori || "lainnya"] || "Lainnya"}
                        excerpt={item.isi}
                        status={mapStatus(item.status)}
                        date={item.created_at}
                        isUnread={item.status === "menunggu"}
                        isSelected={false}
                        onClick={() => router.push(`/dashboard/aspirasi/${item.id}`)}
                      />
                      {i < filtered.length - 1 && <div className="h-px bg-line mx-[18px]" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Desk panel - kanan (sticky) */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: e, delay: 1.0 }}
            style={{ position: "sticky", top: 22 }}
          >
            {/* Empty state */}
            <div
              className="bg-card border-[1.5px] border-dashed border-line rounded-md px-6 py-16 text-center"
              style={{ borderColor: "var(--line)" }}
            >
              <i className="ti ti-mail-opened text-[30px] block mb-3 mx-auto" style={{ color: "var(--ink-faint)" }} />
              <p className="text-[12.5px] max-w-[220px] mx-auto leading-relaxed" style={{ color: "var(--ink-faint)" }}>
                Klik salah satu amplop di map sebelah kiri untuk membukanya di sini.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <BottomTabBar active="overview" />
    </div>
  );
}
