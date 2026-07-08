"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ChatBubble from "@/components/ui/ChatBubble";
import Badge from "@/components/ui/Badge";
import { formatWaktu } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase";

interface Pesan {
  id: string;
  isi: string;
  pengirim: "siswa" | "humas";
  created_at: string;
}

interface AspirasiData {
  id: string;
  kode_tiket: string;
  isi: string;
  kategori: string | null;
  status: "menunggu" | "diproses" | "dibalas" | "diteruskan";
  created_at: string;
}

function CekAspirasiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [kodeInput, setKodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<AspirasiData | null>(null);
  const [pesan, setPesan] = useState<Pesan[]>([]);
  const [balasan, setBalasan] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const aspirationIdRef = useRef<string | null>(null);

  const queryKode = searchParams.get("kode");

  const fetchData = useCallback(async (kode: string) => {
    setLoading(true);
    setError("");
    setData(null);
    setPesan([]);
    aspirationIdRef.current = null;
    try {
      const res = await fetch(`/api/aspirasi/${encodeURIComponent(kode)}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.aspirasi);
        setPesan(json.pesan || []);
        aspirationIdRef.current = json.aspirasi.id;
      } else {
        setError("Kode tiket tidak ditemukan. Pastikan kode yang kamu masukkan benar.");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (queryKode) {
      setKodeInput(queryKode.toUpperCase());
      fetchData(queryKode.toUpperCase());
    }
  }, [queryKode, fetchData]);

  // Real-time subscription for new messages and status changes
  useEffect(() => {
    if (!aspirationIdRef.current) return;

    const supabase = createBrowserClient();
    const aspirasiId = aspirationIdRef.current;

    // Subscribe to new pesan for this aspirasi
    const pesanChannel = supabase
      .channel(`cek-pesan-${aspirasiId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pesan",
          filter: `aspirasi_id=eq.${aspirasiId}`,
        },
        (payload) => {
          const newPesan = payload.new as Pesan;
          setPesan((prev) => {
            // Avoid duplicates
            if (prev.some((p) => p.id === newPesan.id)) return prev;
            return [...prev, newPesan];
          });
        }
      )
      .subscribe();

    // Subscribe to aspirasi status changes
    const aspirasiChannel = supabase
      .channel(`cek-aspirasi-${aspirasiId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "aspirasi",
          filter: `id=eq.${aspirasiId}`,
        },
        (payload) => {
          const updated = payload.new as AspirasiData;
          setData((prev) => {
            if (!prev) return prev;
            return { ...prev, status: updated.status };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pesanChannel);
      supabase.removeChannel(aspirasiChannel);
    };
  }, [data?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pesan]);

  const handleCek = () => {
    if (!kodeInput.trim()) return;
    fetchData(kodeInput.trim().toUpperCase());
  };

  const handleKirimBalasan = async () => {
    if (!balasan.trim() || !data) return;
    setSending(true);
    try {
      const res = await fetch(`/api/aspirasi/${data.kode_tiket}/pesan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isi: balasan.trim() }),
      });
      if (res.ok) {
        const pesanBaru = await res.json();
        setPesan((prev) => [...prev, pesanBaru]);
        setBalasan("");
      }
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  const adaBalasan = data && data.status === "dibalas";

  return (
    <>
      {/* Top Nav */}
      <div className="bg-[#49769f] px-[18px] pt-9 pb-4 flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="text-[#a8d4e8] hover:text-white transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-[15px] font-medium text-white">Cek Aspirasi</h1>
          <p className="text-[11px] text-[#a8d4e8]">Humas OSIS</p>
        </div>
      </div>

      {/* State 1: Input Kode (no data, no error) */}
      {!loading && !error && !data && (
        <div className="px-[18px] py-6 flex flex-col gap-4">
          <p className="text-[13px] text-[#6ea2b3] leading-[1.6]">
            Masukkan kode tiket yang kamu dapat setelah mengirim aspirasi. Contoh:{" "}
            <span className="font-medium text-[#49769f]">ASP-2847</span>
          </p>
          <input
            type="text"
            value={kodeInput}
            onChange={(e) => setKodeInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleCek()}
            placeholder="ASP-XXXX"
            className="w-full bg-[#f4f9fc] border border-[#c8dde8] rounded-[14px] px-4 py-3.5 text-[16px] font-medium text-[#49769f] tracking-[0.08em] text-center outline-none uppercase placeholder:text-[#6ea2b3]"
          />
          <button
            onClick={handleCek}
            className="bg-[#7bbde8] text-white rounded-[14px] py-3.5 w-full font-medium text-[14px] transition-opacity hover:opacity-90"
          >
            Cek Status
          </button>
          <p className="text-[12px] text-[#a8c8d4] text-center">
            Kode tiket dikirim ke emailmu setelah submit
          </p>
        </div>
      )}

      {/* State 2: Loading */}
      {loading && (
        <div className="px-[18px] py-10 flex flex-col gap-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-[#f4f9fc] rounded-[14px]" />
            <div className="h-20 bg-[#f4f9fc] rounded-[14px]" />
            <div className="h-20 bg-[#f4f9fc] rounded-[14px]" />
          </div>
        </div>
      )}

      {/* State 3: Error */}
      {!loading && error && (
        <div className="px-[18px] py-6 flex flex-col gap-4">
          <input
            type="text"
            value={kodeInput}
            onChange={(e) => setKodeInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleCek()}
            placeholder="ASP-XXXX"
            className="w-full bg-[#fff0f0] border border-[#f5b8b8] rounded-[14px] px-4 py-3.5 text-[16px] font-medium text-[#c0392b] tracking-[0.08em] text-center outline-none uppercase"
          />
          <p className="text-[13px] text-[#c0392b] text-center leading-[1.6]">
            {error}
          </p>
          <button
            onClick={() => {
              setError("");
              setKodeInput("");
            }}
            className="bg-[#7bbde8] text-white rounded-[14px] py-3.5 w-full font-medium text-[14px] transition-opacity hover:opacity-90"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* State 4 & 5: Data loaded */}
      {!loading && !error && data && (
        <>
          {/* Meta Rows */}
          <div className="border-b border-[#f0f7fa]">
            <div className="px-[18px] py-2.5 flex items-center justify-between border-b border-[#f0f7fa]">
              <span className="text-[12px] text-[#6ea2b3]">Status</span>
              <Badge status={data.status} />
            </div>
            <div className="px-[18px] py-2.5 flex items-center justify-between border-b border-[#f0f7fa]">
              <span className="text-[12px] text-[#6ea2b3]">Dikirim</span>
              <span className="text-[12px] text-[#1a3d47]">{formatWaktu(data.created_at)}</span>
            </div>
            <div className="px-[18px] py-2.5 flex items-center justify-between">
              <span className="text-[12px] text-[#6ea2b3]">Kategori</span>
              <span className="text-[12px] text-[#1a3d47]">{data.kategori || "—"}</span>
            </div>
          </div>

          {/* Chat Area */}
          <div className="bg-[#f4f9fc] px-4 py-4 flex flex-col gap-3 min-h-[200px]">
            {/* Pesan siswa selalu tampil first */}
            <ChatBubble
              isi={data.isi}
              pengirim="kanan"
              label="Kamu"
              waktu={formatWaktu(data.created_at)}
            />

            {pesan.filter((p) => p.pengirim === "humas").length > 0 ? (
              pesan
                .filter((p) => p.pengirim !== "siswa")
                .map((p) => (
                  <ChatBubble
                    key={p.id}
                    isi={p.isi}
                    pengirim="kiri"
                    label="Humas OSIS"
                    waktu={formatWaktu(p.created_at)}
                  />
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 gap-2 mt-2">
                <span className="text-[32px]">💬</span>
                <p className="text-[13px] text-[#6ea2b3] text-center leading-[1.5] max-w-[260px]">
                  Humas OSIS belum membalas. Kami akan segera menghubungimu.
                </p>
              </div>
            )}

            {/* Balasan siswa setelah humas */}
            {pesan
              .filter((p) => p.pengirim === "siswa")
              .slice(1)
              .map((p) => (
                <ChatBubble
                  key={p.id}
                  isi={p.isi}
                  pengirim="kanan"
                  label="Kamu"
                  waktu={formatWaktu(p.created_at)}
                />
              ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input / Footer */}
          {adaBalasan ? (
            <div className="bg-white border-t border-[#c8dde8] px-4 py-3 flex gap-2">
              <input
                type="text"
                value={balasan}
                onChange={(e) => setBalasan(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleKirimBalasan()}
                placeholder="Balas..."
                className="flex-1 bg-[#f4f9fc] border border-[#c8dde8] rounded-[12px] px-3.5 py-2.5 text-[13px] text-[#1a3d47] outline-none placeholder:text-[#6ea2b3]"
              />
              <button
                onClick={handleKirimBalasan}
                disabled={sending || !balasan.trim()}
                className="bg-[#7bbde8] text-white rounded-[12px] px-4 py-2.5 text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "..." : "Kirim"}
              </button>
            </div>
          ) : (
            <div className="bg-white border-t border-[#c8dde8] px-4 py-3 text-center">
              <span className="text-[12px] text-[#a8c8d4]">
                Balasan akan muncul di sini
              </span>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function CekAspirasi() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[480px] mx-auto">
        <Suspense fallback={<CekAspirasiFallback />}>
          <CekAspirasiContent />
        </Suspense>
      </div>
    </div>
  );
}

function CekAspirasiFallback() {
  return (
    <div className="px-[18px] py-10">
      <div className="animate-pulse space-y-4">
        <div className="h-5 bg-[#f4f9fc] rounded w-24" />
        <div className="h-12 bg-[#f4f9fc] rounded-[14px]" />
      </div>
    </div>
  );
}

//afaersdwef//