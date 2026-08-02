"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { IconSend, IconSearch, IconPencil, IconEye, IconHome, IconMessage, IconInfoCircle, IconEdit } from "@tabler/icons-react";
import { Particles, SuccessState } from "@/components/landing/LandingShared";
import MobileLanding from "@/components/landing/MobileLanding";
import PageLoader from "@/components/landing/PageLoader";

const easeCustom = [0.22, 1, 0.36, 1] as const;

const kategoriOptions = ["Fasilitas & Sarana", "Kebersihan", "Keamanan", "Akademik", "Ekstrakulikuler", "Kepengurusan OSIS", "Lainnya"];
const steps = [
  { icon: IconPencil, title: "Tulis aspirasimu", desc: "Ceritakan apa yang ingin kamu sampaikan dengan jelas" },
  { icon: IconSend, title: "Kirim & simpan kode", desc: "Dapatkan kode unik untuk melacak status aspirasimu" },
  { icon: IconEye, title: "Pantau balasan", desc: "Humas OSIS merespons dan meneruskan aspirasimu" },
];
const heroStats = [{ num: "100%", label: "Anonim" }, { num: "3–5", label: "Hari respons" }, { num: "24/7", label: "Selalu terbuka" }];
const navItems = [
  { id: "home", icon: IconHome, label: "Beranda" },
  { id: "aspirasi", icon: IconMessage, label: "Kirim Aspirasi" },
  { id: "status", icon: IconSearch, label: "Cek Status" },
  { id: "about", icon: IconInfoCircle, label: "Tentang OSIS" },
];

// --- Framer Motion Variants ---
const sidebarVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeCustom },
  },
};

const mainContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: easeCustom, delayChildren: 0.1, staggerChildren: 0.1 },
  },
};

const containerStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeCustom },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 25, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easeCustom },
  },
};

export default function Home() {
  const router = useRouter();
  const [kategori, setKategori] = useState("");
  const [isi, setIsi] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [kodeTiket, setKodeTiket] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"aspirasi" | "status" | "about">("aspirasi");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isi.trim()) { setError("Isi aspirasi tidak boleh kosong"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/aspirasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isi: isi.trim(), kategori: kategori || null, email_siswa: email.trim() || null })
      });
      const data = await res.json();
      if (res.ok) { setKodeTiket(data.kode_tiket); setSubmitted(true); } else setError(data.error || "Gagal mengirim aspirasi");
    } catch { setError("Gagal terhubung ke server"); } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <>
        <PageLoader />
        <Particles />
        <SuccessState
          kodeTiket={kodeTiket}
          copied={copied}
          onCopy={() => { navigator.clipboard.writeText(kodeTiket); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          onCek={() => router.push(`/cek-aspirasi?kode=${kodeTiket}`)}
        />
      </>
    );
  }

  return (
    <>
      <PageLoader />
      <Particles />
      <div className="hidden md:flex min-h-screen relative z-10">
        {/* DESKTOP SIDEBAR */}
        <motion.aside
          className="w-[220px] flex-shrink-0 bg-navy flex-col rounded-l-[14px] overflow-hidden flex"
          initial="hidden"
          animate="visible"
          variants={sidebarVariants}
          whileHover={{ boxShadow: "4px 0 40px rgba(13,27,62,0.12)" }}
        >
          <div className="px-5 pt-6 pb-5 border-b border-white/10">
            <div className="flex items-center gap-2.5 mb-1">
              <motion.div
                className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-blue to-blue-light flex items-center justify-center font-display font-bold text-sm text-white flex-shrink-0"
                whileHover={{ scale: 1.06, rotate: -3, boxShadow: "0 8px 24px rgba(29,111,255,0.25)" }}
              >
                O
              </motion.div>
              <span className="font-display font-semibold text-sm text-white leading-tight">OSIS Humas</span>
            </div>
            <p className="text-[11px] text-white/40 tracking-[0.3px]">Kepengurusan 2024/2025</p>
          </div>

          <nav className="px-3 py-4 flex-1">
            <p className="text-[10px] text-white/30 tracking-[1px] uppercase px-2 mb-2">Menu</p>
            <motion.div variants={containerStagger} initial="hidden" animate="visible">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  variants={fadeUpVariants}
                  className="w-full flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg text-[13px] transition-colors mb-0.5 text-white bg-blue font-medium shadow-[0_4px_16px_rgba(29,111,255,0.25)] relative overflow-hidden"
                  whileTap={{ scale: 0.96 }}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </nav>

          <div className="px-3 py-4 border-t border-white/10 flex items-center gap-2.5 rounded-bl-[14px]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue to-blue-light flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
              S
            </div>
            <div>
              <p className="text-xs text-white font-medium">Siswa</p>
              <p className="text-[10px] text-white/40">Anonim</p>
            </div>
          </div>
        </motion.aside>

        {/* MAIN CONTENT */}
        <motion.main
          className="flex-1 overflow-hidden flex flex-col bg-white rounded-r-[14px]"
          initial="hidden"
          animate="visible"
          variants={mainContentVariants}
        >
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <h1 className="font-display text-base font-semibold text-navy">Suara Pelajar</h1>
            <motion.span
              className="bg-blue-pale text-blue text-[11px] font-semibold px-2.5 py-1 rounded-[20px] tracking-[0.3px] cursor-default"
              whileHover={{ scale: 1.04, y: -1, boxShadow: "0 4px 16px rgba(29,111,255,0.12)", backgroundColor: "#1D6FFF", color: "#fff" }}
            >
              Aspirasi Terbuka
            </motion.span>
          </div>

          <div className="px-6 py-5 overflow-y-auto flex-1">
            {/* HERO BANNER */}
            <motion.div
              className="rounded-[14px] p-7 mb-5 relative overflow-hidden bg-gradient-to-br from-blue to-blue-dark cursor-default"
              variants={fadeUpVariants}
              whileHover={{ y: -2, boxShadow: "0 16px 48px rgba(29,111,255,0.15)" }}
            >
              <div className="absolute right-[-30px] top-[-40px] w-[180px] h-[180px] rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute right-10 bottom-[-50px] w-[120px] h-[120px] rounded-full bg-white/4 pointer-events-none" />

              <motion.div
                className="inline-flex items-center gap-1.5 bg-white/15 rounded-[20px] px-3 py-1 text-[11px] text-white/90 mb-3.5 font-medium cursor-default"
                whileHover={{ backgroundColor: "rgba(255,255,255,0.22)", x: 3 }}
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-blue-light"
                  animate={{ boxShadow: ["0 0 0 0 rgba(29,111,255,0.5)", "0 0 0 12px rgba(29,111,255,0)", "0 0 0 0 rgba(29,111,255,0)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                Humas OSIS aktif menerima aspirasi
              </motion.div>

              <h2 className="font-display text-[26px] font-bold text-white leading-[1.25] mb-2.5">
                Suaramu penting, <span className="text-blue-light">kami siap mendengar.</span>
              </h2>
              <p className="text-[13px] text-white/80 leading-relaxed max-w-[460px]">
                Sampaikan aspirasi, kritik, atau masukan untuk OSIS secara anonim — aman, mudah, dan langsung sampai.
              </p>

              <motion.div className="flex gap-5 mt-5" variants={containerStagger} initial="hidden" animate="visible">
                {heroStats.map((s) => (
                  <motion.div
                    key={s.label}
                    variants={fadeUpVariants}
                    className="text-left px-2 py-1 rounded-lg cursor-default"
                    whileHover={{ y: -3, scale: 1.01, backgroundColor: "rgba(255,255,255,0.05)" }}
                  >
                    <span className="font-display text-xl font-bold text-white block">{s.num}</span>
                    <span className="text-[11px] text-white/55 block mt-0.5">{s.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* CARA KERJA SECTION */}
            <p className="font-display text-[13px] font-semibold text-gray-400 tracking-[1px] uppercase mb-3 cursor-default">
              Cara kerja
            </p>
            <motion.div
              className="grid grid-cols-3 gap-3 mb-5"
              variants={containerStagger}
              initial="hidden"
              animate="visible"
            >
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  variants={cardVariants}
                  className="rounded-xl p-[18px_16px] relative overflow-hidden bg-blue-pale border-[1.5px] border-transparent cursor-default"
                  whileHover={{ y: -5, scale: 1.008, backgroundColor: "#fff", borderColor: "#1D6FFF", boxShadow: "0 16px 40px rgba(29,111,255,0.10)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="absolute right-[-6px] bottom-[-10px] font-display text-[72px] font-bold text-blue/8 leading-none pointer-events-none select-none">
                    {i + 1}
                  </span>
                  <motion.div
                    className="w-[34px] h-[34px] rounded-[9px] bg-blue flex items-center justify-center mb-3"
                    whileHover={{ scale: 1.06, rotate: -3, background: "linear-gradient(135deg, #1D6FFF, #60AFFF)", boxShadow: "0 4px 20px rgba(29,111,255,0.25)" }}
                  >
                    <step.icon size={17} className="text-white" />
                  </motion.div>
                  <h4 className="font-display text-[13px] font-semibold text-navy mb-1">{step.title}</h4>
                  <p className="text-[11.5px] text-gray-700 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* FORM CONTAINER */}
            <motion.div
              className="bg-gray-50 rounded-[14px] p-5 border-[1.5px] border-[#E8EFFF]"
              variants={fadeUpVariants}
              whileHover={{ borderColor: "#1D6FFF", boxShadow: "0 4px 32px rgba(29,111,255,0.04)" }}
            >
              <div className="font-display text-sm font-semibold text-navy flex items-center gap-2 mb-4">
                <IconEdit size={18} className="text-blue" />
                <span>Tulis Aspirasi</span>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3 mb-3.5">
                  <div className="flex flex-col gap-[5px]">
                    <label className="text-xs font-medium text-gray-700 cursor-default">
                      Kategori <span className="text-[10px] text-gray-400 font-normal">(opsional)</span>
                    </label>
                    <select
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      className="w-full border-[1.5px] border-[#DCE8FF] rounded-lg px-3 py-[9px] text-[13px] text-navy bg-white outline-none transition-all duration-400 focus:border-blue focus:shadow-[0_0_0_4px_rgba(29,111,255,0.06)] hover:border-blue-light"
                    >
                      {[""].concat(kategoriOptions).map((opt) => (
                        <option key={opt} value={opt}>{opt || "Pilih kategori"}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-[5px]">
                    <label className="text-xs font-medium text-gray-700 cursor-default">
                      Email <span className="text-[10px] text-gray-400 font-normal">(opsional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      className="w-full border-[1.5px] border-[#DCE8FF] rounded-lg px-3 py-[9px] text-[13px] text-navy bg-white outline-none transition-all duration-400 focus:border-blue focus:shadow-[0_0_0_4px_rgba(29,111,255,0.06)] hover:border-blue-light placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-[5px] mb-3.5">
                  <label className="text-xs font-medium text-gray-700">Aspirasi kamu</label>
                  <textarea
                    value={isi}
                    onChange={(e) => { setIsi(e.target.value); if (error) setError(""); }}
                    placeholder="Ceritakan aspirasimu di sini..."
                    className={`w-full border-[1.5px] rounded-lg px-3 py-[9px] text-[13px] text-navy bg-white outline-none min-h-[100px] resize-y transition-all duration-400 focus:border-blue focus:shadow-[0_0_0_4px_rgba(29,111,255,0.06)] hover:border-blue-light placeholder:text-gray-400 ${error ? "border-red-400" : "border-[#DCE8FF]"}`}
                  />
                  {error && <p className="text-[11px] text-red-500">{error}</p>}
                </div>
                <p className="text-[11px] text-gray-400 mb-4">Hanya untuk kirim kode tiket, tidak disimpan</p>

                <div className="flex gap-2.5">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-[11px] border-none rounded-[9px] bg-gradient-to-br from-blue to-blue-dark text-white text-[13px] font-display font-semibold flex items-center justify-center gap-1.5 transition-all duration-500 disabled:opacity-50 relative overflow-hidden"
                    whileHover={{ scale: 1.01, y: -2, boxShadow: "0 12px 32px rgba(29,111,255,0.3)", background: "linear-gradient(135deg, #60AFFF, #1D6FFF)" }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <IconSend size={16} />
                    <span>{loading ? "Mengirim..." : "Kirim Aspirasi"}</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => router.push("/cek-aspirasi")}
                    className="py-[11px] px-[18px] rounded-[9px] border-[1.5px] border-[#DCE8FF] bg-white text-blue text-[13px] font-display font-semibold whitespace-nowrap transition-all duration-500 active:scale-95 relative overflow-hidden flex items-center gap-1"
                    whileHover={{ y: -2, backgroundColor: "#EBF2FF", borderColor: "#1D6FFF", boxShadow: "0 8px 28px rgba(29,111,255,0.10)" }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span>Cek status</span>
                    <span>→</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.main>
      </div>

      <MobileLanding
        kategori={kategori} setKategori={setKategori} isi={isi} setIsi={setIsi}
        email={email} setEmail={setEmail} error={error} loading={loading}
        onSubmit={handleSubmit} mobileTab={mobileTab} setMobileTab={setMobileTab}
        mobileSidebarOpen={mobileSidebarOpen} setMobileSidebarOpen={setMobileSidebarOpen}
      />
    </>
  );
}

