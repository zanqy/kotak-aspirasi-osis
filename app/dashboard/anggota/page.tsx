"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomTabBar from "@/components/layout/BottomTabBar";
import Badge from "@/components/ui/Badge";
import { getInisial } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
  status: "pending" | "approved" | "rejected";
  avatar_url: string | null;
}

export default function AnggotaPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    const init = async () => {
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
      setCurrentUserId(sessionData.user.id);
      setUserName(sessionData.user.name || "");

      if (sessionData.user.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      fetchAnggota();
    };
    init();
  }, [router]);

  const fetchAnggota = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/anggota");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId: string, status: "approved" | "rejected") => {
    try {
      await fetch(`/api/dashboard/anggota/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchAnggota();
    } catch {
      // silently fail
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Apakah kamu yakin ingin menghapus anggota ini?")) return;
    try {
      await fetch(`/api/dashboard/anggota/${userId}`, {
        method: "DELETE",
      });
      fetchAnggota();
    } catch {
      // silently fail
    }
  };

  const pendingUsers = users.filter((u) => u.status === "pending");
  const aktifUsers = users.filter((u) => u.status === "approved");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[480px] mx-auto pb-16">
        <DashboardNav
          title="Anggota Humas"
          subtitle={`${aktifUsers.length} aktif · ${pendingUsers.length} pending`}
          userName={userName}
        />

        {loading ? (
          <div className="px-[18px] py-10 space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#f4f9fc] rounded-[14px]" />
            ))}
          </div>
        ) : (
          <>
            {/* Permintaan Akses */}
            {pendingUsers.length > 0 && (
              <>
                <p className="text-[13px] font-medium text-[#49769f] px-[18px] pt-4 pb-1">
                  Permintaan akses
                </p>
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="mx-[18px] mb-3 bg-white border border-[#c8dde8] rounded-[14px] p-3.5 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#d6f0f7] flex items-center justify-center flex-shrink-0">
                      <span className="text-[13px] font-medium text-[#49769f]">
                        {getInisial(user.name || user.email)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-[#1a3d47] truncate">
                          {user.name || user.email}
                        </span>
                        <Badge status="pending" />
                      </div>
                      <p className="text-[11px] text-[#6ea2b3] truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleUpdateStatus(user.id, "approved")}
                        className="bg-[#f0fbf6] text-[#1a7a4a] border border-[#a8e8c4] rounded-[8px] px-3 py-1.5 text-[12px] font-medium hover:opacity-90 transition-opacity"
                      >
                        Izinkan
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(user.id, "rejected")}
                        className="bg-[#fff0f0] text-[#c0392b] border border-[#f5b8b8] rounded-[8px] px-3 py-1.5 text-[12px] font-medium hover:opacity-90 transition-opacity"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Anggota Aktif */}
            <p className="text-[13px] font-medium text-[#49769f] px-[18px] pt-4 pb-1">
              Anggota aktif
            </p>
            {aktifUsers.length === 0 ? (
              <p className="text-[13px] text-[#6ea2b3] text-center py-6">
                Belum ada anggota
              </p>
            ) : (
              aktifUsers.map((user) => (
                <div
                  key={user.id}
                  className="mx-[18px] mb-3 bg-white border border-[#c8dde8] rounded-[14px] p-3.5 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-[#d6f0f7] flex items-center justify-center flex-shrink-0">
                    <span className="text-[13px] font-medium text-[#49769f]">
                      {getInisial(user.name || user.email)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[#1a3d47] truncate">
                        {user.name || user.email}
                      </span>
                      <Badge status={user.role === "admin" ? "admin" : "member"} />
                    </div>
                    <p className="text-[11px] text-[#6ea2b3] truncate">
                      {user.email}
                    </p>
                  </div>
                  {user.role !== "admin" && user.id !== currentUserId && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="bg-[#fff0f0] text-[#c0392b] border border-[#f5b8b8] rounded-[8px] px-3 py-1.5 text-[12px] font-medium hover:opacity-90 transition-opacity flex-shrink-0"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))
            )}
          </>
        )}

        <BottomTabBar active="anggota" />
      </div>
    </div>
  );
}