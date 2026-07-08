"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Dropdown from "@/components/ui/Dropdown";

const kategoriOptions = [
  "Fasilitas & Sarana",
  "Kebersihan",
  "Keamanan",
  "Akademik",
  "Ekstrakulikuler",
  "Kepengurusan OSIS",
  "Lainnya",
];

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

  const handleSubmit = async () => {
    if (!isi.trim()) {
      setError("Isi aspirasi tidak boleh kosong");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/aspirasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isi: isi.trim(),
          kategori: kategori || null,
          email_siswa: email.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setKodeTiket(data.kode_tiket);
        setSubmitted(true);
      } else {
        setError(data.error || "Gagal mengirim aspirasi");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(kodeTiket);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-[480px] w-full mx-auto px-[22px] py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#f0fbf6] border border-[#a8e8c4] flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-[#1a7a4a]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-[20px] font-medium text-[#1a3d47] mb-1">
            Aspirasi terkirim!
          </h1>
          <p className="text-[28px] font-medium tracking-[0.1em] text-[#49769f] mt-3 mb-4">
            {kodeTiket}
          </p>
          <p className="text-[13px] text-[#6ea2b3] leading-[1.6] mb-6">
            Simpan kode ini untuk memantau status aspirasimu
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCopy}
              className="bg-[#7bbde8] text-white rounded-[14px] py-3.5 w-full font-medium text-[14px] transition-opacity hover:opacity-90"
            >
              {copied ? "Tersalin ✓" : "Salin Kode"}
            </button>
            <button
              onClick={() => router.push(`/cek-aspirasi?kode=${kodeTiket}`)}
              className="bg-white text-[#4e8ea2] border border-[#c8dde8] rounded-[14px] py-3.5 w-full font-medium text-[14px] transition-opacity hover:opacity-90"
            >
              Cek Status Aspirasi →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[480px] mx-auto">
        {/* Hero Section */}
        <div className="bg-[#49769f] pt-9 px-[22px] pb-7">
          <p className="text-[11px] tracking-widest uppercase text-[#7bbde8]">
            OSIS · Humas
          </p>
          <h1 className="text-[26px] font-medium text-white leading-[1.3] mt-2">
            Suaramu penting, kami siap mendengar.
          </h1>
          <p className="text-[13px] text-[#a8d4e8] leading-[1.7] mt-3">
            Sampaikan aspirasi, kritik, atau masukanmu untuk OSIS secara anonim.
            Aman, mudah, dan langsung sampai.
          </p>
        </div>

        {/* Cara Pakai */}
        <div className="px-[22px] py-[22px] border-b border-[#f0f7fa]">
          <p className="text-[11px] uppercase tracking-wider font-medium text-[#49769f] mb-4">
            Cara pakai
          </p>
          <div className="flex flex-col">
            {[
              {
                title: "Tulis aspirasimu",
                desc: "Ceritakan apa yang ingin kamu sampaikan ke OSIS",
              },
              {
                title: "Kirim & simpan kode tiket",
                desc: "Kamu dapat kode unik untuk melacak status aspirasi",
              },
              {
                title: "Pantau & tunggu balasan",
                desc: "Humas OSIS akan merespons dan meneruskan aspirasimu",
              },
            ].map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-[#49769f] text-white text-[13px] font-medium flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  {i < 2 && (
                    <div className="w-px h-5 bg-[#d0e8ef] mt-1.5" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-[13px] font-medium text-[#1a3d47]">
                    {step.title}
                  </p>
                  <p className="text-[12px] text-[#6ea2b3] leading-[1.5] mt-1">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Section */}
        <div className="px-[22px] py-[22px]">
          <p className="text-[11px] uppercase tracking-wider font-medium text-[#49769f] mb-3">
            Tulis aspirasi
          </p>
          <div className="flex flex-col gap-[12px]">
            <Dropdown
              options={kategoriOptions}
              value={kategori}
              onChange={setKategori}
              placeholder="Pilih kategori (opsional)"
            />

            <div>
              <textarea
                value={isi}
                onChange={(e) => {
                  setIsi(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Ceritakan aspirasimu di sini..."
                className={`w-full bg-[#f4f9fc] border rounded-[14px] px-4 py-3.5 text-[14px] text-[#1a3d47] min-h-[110px] resize-none outline-none placeholder:text-[#6ea2b3] ${
                  error ? "border-red-400" : "border-[#c8dde8]"
                }`}
              />
              {error && (
                <p className="text-[11px] text-red-500 mt-1 pl-1">{error}</p>
              )}
            </div>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (opsional)"
              className="w-full bg-[#f4f9fc] border border-[#c8dde8] rounded-[14px] px-4 py-3.5 text-[14px] text-[#1a3d47] outline-none placeholder:text-[#6ea2b3]"
            />
            <p className="text-[11px] text-[#a8c8d4] pl-1 -mt-1">
              Email tidak disimpan — hanya untuk kirim kode tiket sekali
            </p>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#7bbde8] text-white rounded-[14px] py-3.5 w-full font-medium text-[14px] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Mengirim..." : "Kirim Aspirasi"}
            </button>

            <button
              onClick={() => router.push("/cek-aspirasi")}
              className="bg-white text-[#4e8ea2] border border-[#c8dde8] rounded-[14px] py-3 w-full font-medium text-[14px] transition-opacity hover:opacity-90"
            >
              Sudah kirim? Cek status →
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#f0f7fa] px-[22px] py-4 flex justify-between items-center">
          <span className="text-[11px] text-[#a8c8d4]">OSIS · Humas</span>
          <span className="text-[11px] text-[#a8c8d4]">Kepengurusan 2024/2025</span>
        </div>
      </div>
    </div>
  );
}