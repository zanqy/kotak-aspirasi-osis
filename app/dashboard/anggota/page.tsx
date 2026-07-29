"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomTabBar from "@/components/layout/BottomTabBar";
import Badge from "@/components/ui/Badge";
import { getInisial } from "@/lib/utils";
import { IconCheck, IconX, IconTrash } from "@tabler/icons-react";

interface User { id: string; email: string; name: string; role: "admin" | "member"; status: "pending" | "approved" | "rejected"; avatar_url: string | null; }

export default function AnggotaPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    const init = async () => {
      const sessionRes = await fetch("/api/auth/session");
      if (!sessionRes.ok) { router.push("/dashboard/login"); return; }
      const sessionData = await sessionRes.json();
      if (!sessionData.user) { router.push("/dashboard/login"); return; }
      setCurrentUserId(sessionData.user.id); setUserName(sessionData.user.name || "");
      if (sessionData.user.role !== "admin") { router.push("/dashboard"); return; }
      fetchAnggota();
    };
    init();
  }, [router]);

  const fetchAnggota = async () => {
    setLoading(true);
    try { const res = await fetch("/api/dashboard/anggota"); if (res.ok) { const data = await res.json(); setUsers(data); } } catch {} finally { setLoading(false); }
  };

  const handleUpdateStatus = async (userId: string, status: "approved" | "rejected") => {
    try { await fetch(`/api/dashboard/anggota/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); fetchAnggota(); } catch {}
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Apakah kamu yakin ingin menghapus anggota ini?")) return;
    try { await fetch(`/api/dashboard/anggota/${userId}`, { method: "DELETE" }); fetchAnggota(); } catch {}
  };

  const pendingUsers = users.filter((u) => u.status === "pending");
  const aktifUsers = users.filter((u) => u.status === "approved");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[480px] mx-auto pb-16">
        <DashboardNav title="Anggota Humas" subtitle={`${aktifUsers.length} aktif · ${pendingUsers.length} pending`} userName={userName} />
        {loading ? <div className="px-[18px] py-10 space-y-4 animate-pulse">{[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-[14px]" />)}</div> : (
          <>
            {pendingUsers.length > 0 && (
              <>
                <p className="text-[13px] font-display font-semibold text-blue px-[18px] pt-4 pb-1">Permintaan akses</p>
                {pendingUsers.map((user) => (
                  <div key={user.id} className="mx-[18px] mb-3 bg-white border-[1.5px] border-[#DCE8FF] rounded-[14px] p-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-pale flex items-center justify-center flex-shrink-0"><span className="text-[13px] font-display font-semibold text-blue">{getInisial(user.name || user.email)}</span></div>
                    <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="text-[13px] font-medium text-navy truncate">{user.name || user.email}</span><Badge status="pending" /></div><p className="text-[11px] text-gray-400 truncate">{user.email}</p></div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleUpdateStatus(user.id, "approved")} className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-emerald-100 transition-colors"><IconCheck size={14} className="inline mr-1" />Izinkan</button>
                      <button onClick={() => handleUpdateStatus(user.id, "rejected")} className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-100 transition-colors"><IconX size={14} className="inline mr-1" />Tolak</button>
                    </div>
                  </div>
                ))}
              </>
            )}
            <p className="text-[13px] font-display font-semibold text-blue px-[18px] pt-4 pb-1">Anggota aktif</p>
            {aktifUsers.length === 0 ? <p className="text-[13px] text-gray-400 text-center py-6">Belum ada anggota</p> : aktifUsers.map((user) => (
              <div key={user.id} className="mx-[18px] mb-3 bg-white border-[1.5px] border-[#DCE8FF] rounded-[14px] p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-pale flex items-center justify-center flex-shrink-0"><span className="text-[13px] font-display font-semibold text-blue">{getInisial(user.name || user.email)}</span></div>
                <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="text-[13px] font-medium text-navy truncate">{user.name || user.email}</span><Badge status={user.role === "admin" ? "admin" : "member"} /></div><p className="text-[11px] text-gray-400 truncate">{user.email}</p></div>
                {user.role !== "admin" && user.id !== currentUserId && (
                  <button onClick={() => handleDelete(user.id)} className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-100 transition-colors flex-shrink-0"><IconTrash size={14} /></button>
                )}
              </div>
            ))}
          </>
        )}
        <BottomTabBar active="anggota" />
      </div>
    </div>
  );
}
