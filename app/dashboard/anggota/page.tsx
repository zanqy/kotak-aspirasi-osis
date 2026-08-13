"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BottomTabBar from "@/components/layout/BottomTabBar";
import Badge from "@/components/ui/Badge";
import { getInisial } from "@/lib/utils";
import { IconCheck, IconX, IconTrash } from "@tabler/icons-react";

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
      const sessionRes = await fetch("/api/auth/session");
      if (!sessionRes.ok) { router.push("/dashboard/login"); return; }
      const sessionData = await sessionRes.json();
      if (!sessionData.user) { router.push("/dashboard/login"); return; }
      setCurrentUserId(sessionData.user.id);
      setUserName(sessionData.user.name || "");
      if (sessionData.user.role !== "admin") { router.push("/dashboard"); return; }
      fetchAnggota();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchAnggota = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/anggota");
      if (res.ok) { const data = await res.json(); setUsers(data); }
    } catch {} finally { setLoading(false); }
  };

  const handleUpdateStatus = async (userId: string, status: "approved" | "rejected") => {
    try {
      await fetch(`/api/dashboard/anggota/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchAnggota();
    } catch {}
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Apakah kamu yakin ingin menghapus anggota ini?")) return;
    try {
      await fetch(`/api/dashboard/anggota/${userId}`, { method: "DELETE" });
      fetchAnggota();
    } catch {}
  };

  const pendingUsers = users.filter((u) => u.status === "pending");
  const aktifUsers = users.filter((u) => u.status === "approved");

  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      {/* Header full width */}
      <div
        className="relative border-b-2 border-ink px-4 sm:px-5 py-4 sm:py-5 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: "var(--paper)" }}
      >
        {/* Left - seal + title */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-seal flex items-center justify-center font-serif font-bold text-[14px] sm:text-[16px] text-ink flex-shrink-0"
            style={{ boxShadow: "0 3px 0 var(--seal-deep)" }}
          >
            O
          </div>
          <div>
            <h1 className="font-serif font-semibold text-[16px] sm:text-[19px] leading-tight text-ink">
              Kelola Anggota
            </h1>
            <p className="text-[10px] sm:text-[11px] text-ink-soft">
              {aktifUsers.length} aktif · {pendingUsers.length} pending
            </p>
          </div>
        </div>

        {/* Right - avatar + logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {userName && (
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-ink text-paper flex items-center justify-center font-serif font-bold text-[12px] sm:text-[13px]"
              title={userName}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <button
            onClick={async () => {
              try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
              window.location.href = "/dashboard/login";
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[1.5px] border-line text-ink-soft hover:border-ink hover:text-ink bg-card flex items-center justify-center transition-all"
            title="Keluar"
          >
            <i className="ti ti-logout text-[14px] sm:text-[18px]" />
          </button>
        </div>
      </div>

      {/* Content - responsive padding */}
      <div className="pb-20 px-4 sm:px-5 pt-4 sm:pt-6">

        {loading ? (
          <div className="space-y-4 animate-pulse mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-paper-deep rounded-[8px]" />
            ))}
          </div>
        ) : (
          <>
            {/* Permintaan akses pending */}
            {pendingUsers.length > 0 && (
              <div className="mt-6">
                <div
                  className="text-[10px] font-bold uppercase tracking-[1px] mb-3 flex items-center gap-2"
                  style={{ color: "var(--ink-faint)" }}
                >
                  <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
                  Permintaan Akses
                  <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
                </div>

                <div className="bg-card border-[1.5px] border-line rounded-[6px] divide-y divide-line">
                  {pendingUsers.map((user) => (
                    <motion.div
                      key={user.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {/* Avatar + Info row */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "var(--paper-deep)" }}
                        >
                          <span
                            className="font-serif font-bold text-[12px] sm:text-[13px]"
                            style={{ color: "var(--ink-soft)" }}
                          >
                            {getInisial(user.name || user.email)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span
                              className="text-[13px] font-medium truncate"
                              style={{ color: "var(--ink)" }}
                            >
                              {user.name || user.email}
                            </span>
                            <Badge status="pending" />
                          </div>
                          <p
                            className="text-[11px] truncate"
                            style={{ color: "var(--ink-faint)" }}
                          >
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons - stacked on mobile */}
                      <div className="flex gap-2 flex-shrink-0 sm:ml-auto">
                        <button
                          onClick={() => handleUpdateStatus(user.id, "approved")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-[3px] text-[11px] font-medium border transition-all"
                          style={{
                            background: "rgba(79,121,66,0.12)",
                            color: "var(--ok)",
                            borderColor: "rgba(79,121,66,0.25)",
                          }}
                        >
                          <IconCheck size={13} />
                          <span className="hidden sm:inline">Izinkan</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(user.id, "rejected")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-[3px] text-[11px] font-medium border transition-all"
                          style={{
                            background: "rgba(181,84,30,0.10)",
                            color: "var(--warn)",
                            borderColor: "rgba(181,84,30,0.25)",
                          }}
                        >
                          <IconX size={13} />
                          <span className="hidden sm:inline">Tolak</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Anggota aktif */}
            <div className="mt-6">
              <div
                className="text-[10px] font-bold uppercase tracking-[1px] mb-3 flex items-center gap-2"
                style={{ color: "var(--ink-faint)" }}
              >
                <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
                Anggota Aktif
                <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
              </div>

              {aktifUsers.length === 0 ? (
                <div
                  className="text-center py-12"
                  style={{ color: "var(--ink-faint)" }}
                >
                  <i className="ti ti-users text-[28px] block mb-2" />
                  <p className="text-[12.5px]">Belum ada anggota aktif</p>
                </div>
              ) : (
                <div className="bg-card border-[1.5px] border-line rounded-[6px] divide-y divide-line">
                  {aktifUsers.map((user) => (
                    <motion.div
                      key={user.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {/* Avatar + Info row */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "var(--paper-deep)" }}
                        >
                          <span
                            className="font-serif font-bold text-[12px] sm:text-[13px]"
                            style={{ color: "var(--ink-soft)" }}
                          >
                            {getInisial(user.name || user.email)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span
                              className="text-[13px] font-medium truncate"
                              style={{ color: "var(--ink)" }}
                            >
                              {user.name || user.email}
                            </span>
                            <Badge status={user.role === "admin" ? "admin" : "member"} />
                          </div>
                          <p
                            className="text-[11px] truncate"
                            style={{ color: "var(--ink-faint)" }}
                          >
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* Delete button */}
                      {user.role !== "admin" && user.id !== currentUserId && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all self-start sm:self-auto"
                          style={{
                            background: "rgba(181,84,30,0.10)",
                            color: "var(--warn)",
                            border: "1px solid rgba(181,84,30,0.25)",
                          }}
                          title="Hapus anggota"
                        >
                          <IconTrash size={14} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <BottomTabBar active="anggota" />
    </div>
  );
}
