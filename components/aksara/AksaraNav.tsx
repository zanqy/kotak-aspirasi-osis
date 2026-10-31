"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/aksara/auth";

const LINKS: { href: string; label: string; match: (p: string) => boolean }[] = [
  { href: "/aksara", label: "Home", match: (p) => p === "/aksara" },
  { href: "/aksara/mading/umum", label: "Mading", match: (p) => p.startsWith("/aksara/mading") },
  { href: "/aksara/kirim", label: "Kirim", match: (p) => p.startsWith("/aksara/kirim") },
  { href: "/aksara/profil", label: "Profil", match: (p) => p.startsWith("/aksara/profil") },
];

export default function AksaraNav() {
  const pathname = usePathname() || "/aksara";
  const router = useRouter();
  const { user, logout, student } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/aksara");
  }

  return (
    <header className="sticky top-0 z-30 flex justify-between items-center gap-2 px-4 py-2.5 bg-[#F2ECDE]/95 backdrop-blur-sm border-b border-[#221D15]/25">
      <Link href="/aksara" className="font-[var(--font-fraunces)] font-extrabold text-[1.15rem] no-underline text-[#221D15] shrink-0">
        AKSARA<span className="text-[#C03B21]">.</span>
      </Link>
      <nav className="flex gap-1 items-center overflow-x-auto">
        {LINKS.map((l) => {
          const active = l.match(pathname);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`text-[10px] tracking-[0.12em] uppercase font-[var(--font-ibm-plex-mono)] font-medium no-underline px-2.5 py-1.5 rounded-full whitespace-nowrap ${
                active ? "bg-[#221D15] text-[#F2ECDE]" : "text-[#221D15]"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
        {user ? (
          <button
            onClick={handleLogout}
            title={student?.nama || user.email || ""}
            className="text-[10px] tracking-[0.12em] uppercase font-[var(--font-ibm-plex-mono)] font-medium px-2.5 py-1.5 rounded-full border border-[#221D15]/25 text-[#221D15] bg-transparent cursor-pointer whitespace-nowrap"
          >
            Keluar
          </button>
        ) : (
          <Link
            href="/aksara/masuk"
            className="text-[10px] tracking-[0.12em] uppercase font-[var(--font-ibm-plex-mono)] font-medium px-2.5 py-1.5 rounded-full bg-[#C03B21] text-[#F2ECDE] no-underline whitespace-nowrap"
          >
            Masuk
          </Link>
        )}
      </nav>
    </header>
  );
}
