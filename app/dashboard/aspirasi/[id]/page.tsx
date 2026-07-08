"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import DashboardNav from "@/components/layout/DashboardNav";
import ChatBubble from "@/components/ui/ChatBubble";
import { formatWaktu } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase";

interface Pesan {
  id: string;
  aspirasi_id: string;
  isi: string;
  pengirim: "siswa" | "humas";
  user_id: string | null;
  created_at: string;
  user_name: string | null;
}

interface Aspirasi {
  id: string;
  kode_tiket: string;
  isi: string;
  kategori: string | null;
  status: "menunggu" | "diproses" | "dibalas" | "diteruskan";
  diteruskan_ke: string | null;
  ditangani_oleh: string | null;
  penangan_nama: string | null;
  created_at: string;
}

export default function AspirasiDetail() {
  const params = useParams();
  const id = params.id as string;

  const [aspirasi, setAspirasi] = useState<Aspirasi | null>(null);
  const [pesan, setPesan] = useState<Pesan[]>([]);
  const [loading, setLoading] = useState(true);
  const [balasan, setBalasan] = useState("");
  const [sending, setSending] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const [forwardTo, setForwardTo] = useState("");
  const [userName, setUserName] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pesan]);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/dashboard/aspirasi/${id}`);
      if (res.ok) {
        const json = await res.json();
        setAspirasi(json.aspirasi);
        setPesan(json.pesan || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription for new messages from students
  useEffect(() => {
    if (!aspirasi?.id) return;

    const supabase = createBrowserClient();

    const pesanChannel = supabase
      .channel(`dashboard-pesan-${aspirasi.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pesan",
          filter: `aspirasi_id=eq.${aspirasi.id}`,
        },
        async (payload: { new: { id: string; aspirasi_id: string; isi: string; pengirim: string; user_id: string | null; created_at: string } }) => {
          const newPesan = payload.new;
          // Fetch the user name if it's from humas
          let user_name = null;
          if (newPesan.pengirim === "humas" && newPesan.user_id) {
            const userResult = await supabase
              .from("users")
              .select("name")
              .eq("id", newPesan.user_id)
              .limit(1);
            const userData = userResult.data as unknown as { name: string }[] | null;
            user_name = userData?.[0]?.name || null;
          }
          setPesan((prev) => {
            if (prev.some((p) => p.id === newPesan.id)) return prev;
            const newEntry: Pesan = {
              id: newPesan.id,
              aspirasi_id: newPesan.aspirasi_id,
              isi: newPesan.isi,
              pengirim: newPesan.pengirim as "siswa" | "humas",
              user_id: newPesan.user_id,
              created_at: newPesan.created_at,
              user_name,
            };
            return [...prev, newEntry];
          });
        }
      )
      .subscribe();

    const aspirasiChannel = supabase
      .channel(`dashboard-aspirasi-${aspirasi.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "aspirasi",
          filter: `id=eq.${aspirasi.id}`,
        },
        (payload: { new: { status: string; diteruskan_ke: string | null } }) => {
          const updated = payload.new;
          setAspirasi((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              status: updated.status as "menunggu" | "diproses" | "dibalas" | "diteruskan",
              diteruskan_ke: updated.diteruskan_ke,
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pesanChannel);
      supabase.removeChannel(aspirasiChannel);
    };
  }, [aspirasi?.id]);

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
      fetchDetail();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleKirimBalasan = async () => {
    if (!balasan.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/dashboard/aspirasi/${id}/pesan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isi: balasan.trim() }),
      });
      if (res.ok) {
        const pesanBaru = await res.json();
        setPesan((prev) => [...prev, pesanBaru]);
        setBalasan("");
        fetchDetail();
      }
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  const handleForward = async () => {
    if (!forwardTo.trim()) return;
    try {
      await fetch(`/api/dashboard/aspirasi/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diteruskan_ke: forwardTo.trim(),
          status: "diteruskan",
        }),
      });
      setShowForward(false);
      setForwardTo("");
      fetchDetail();
    } catch {
      // silently fail
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[480px] mx-auto">
          <DashboardNav title="..." subtitle="..." showBack />
          <div className="px-[18px] py-10 space-y-4 animate-pulse">
            <div className="h-5 bg-[#f4f9fc] rounded w-3/4" />
            <div className="h-20 bg-[#f4f9fc] rounded-[14px]" />
            <div className="h-20 bg-[#f4f9fc] rounded-[14px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!aspirasi) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[480px] mx-auto">
          <DashboardNav title="Tidak ditemukan" showBack />
          <p className="text-[13px] text-[#6ea2b3] text-center py-10">
            Aspirasi tidak ditemukan
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[480px] mx-auto pb-4">
        <DashboardNav
          title={aspirasi.kode_tiket}
          subtitle={aspirasi.kategori || ""}
          showBack
          userName={userName}
        />

        {/* Meta Rows */}
        <div className="border-b border-[#f0f7fa]">
          <div className="px-[18px] py-2.5 flex items-center justify-between border-b border-[#f0f7fa]">
            <span className="text-[12px] text-[#6ea2b3]">Masuk</span>
            <span className="text-[12px] text-[#1a3d47]">{formatWaktu(aspirasi.created_at)}</span>
          </div>
          <div className="px-[18px] py-2.5 flex items-center justify-between border-b border-[#f0f7fa]">
            <span className="text-[12px] text-[#6ea2b3]">Ditangani oleh</span>
            <span className="text-[12px] text-[#1a3d47]">
              {aspirasi.penangan_nama || "—"}
            </span>
          </div>
          <div className="px-[18px] py-2.5 flex items-center justify-between">
            <span className="text-[12px] text-[#6ea2b3]">Diteruskan ke</span>
            <span className="text-[12px] text-[#1a3d47]">
              {aspirasi.diteruskan_ke || "—"}
            </span>
          </div>
        </div>

        {/* Forward Button */}
        <button
          onClick={() => setShowForward(!showForward)}
          className="bg-[#f4f9fc] border border-[#c8dde8] rounded-[12px] px-4 py-2.5 text-[13px] text-[#6ea2b3] mx-[18px] my-3 w-[calc(100%-36px)] text-left hover:bg-[#eaf4f8] transition-colors"
        >
          Teruskan ke divisi lain →
        </button>

        {showForward && (
          <div className="mx-[18px] mb-3 flex gap-2">
            <input
              type="text"
              value={forwardTo}
              onChange={(e) => setForwardTo(e.target.value)}
              placeholder="Nama divisi..."
              className="flex-1 bg-[#f4f9fc] border border-[#c8dde8] rounded-[12px] px-3.5 py-2.5 text-[13px] text-[#1a3d47] outline-none placeholder:text-[#6ea2b3]"
              onKeyDown={(e) => e.key === "Enter" && handleForward()}
            />
            <button
              onClick={handleForward}
              className="bg-[#7bbde8] text-white rounded-[12px] px-4 py-2.5 text-[13px] font-medium"
            >
              Simpan
            </button>
          </div>
        )}

        {/* Chat Area */}
        <div className="bg-[#f4f9fc] px-4 py-4 flex flex-col gap-3 min-h-[200px]">
          {/* Pesan awal siswa */}
          <ChatBubble
            isi={aspirasi.isi}
            pengirim="kiri"
            label="Anonim"
            waktu={formatWaktu(aspirasi.created_at)}
          />

          {/* Semua pesan lain */}
          {pesan.map((p) => (
            <ChatBubble
              key={p.id}
              isi={p.isi}
              pengirim={p.pengirim === "humas" ? "kanan" : "kiri"}
              label={
                p.pengirim === "humas"
                  ? p.user_name || "Humas OSIS"
                  : "Anonim"
              }
              waktu={formatWaktu(p.created_at)}
            />
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-[#c8dde8] px-4 py-3 flex gap-2">
          <input
            type="text"
            value={balasan}
            onChange={(e) => setBalasan(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleKirimBalasan()}
            placeholder="Balas sebagai Humas OSIS..."
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
      </div>
    </div>
  );
}