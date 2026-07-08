"use client";

interface BadgeProps {
  status:
    | "menunggu"
    | "diproses"
    | "dibalas"
    | "diteruskan"
    | "pending"
    | "admin"
    | "member";
}

const badgeStyles: Record<BadgeProps["status"], string> = {
  menunggu: "bg-[#eaf4f8] text-[#4e8ea2] border border-[#c8dde8]",
  diproses: "bg-[#fff9ec] text-[#9a7000] border border-[#ffe9a0]",
  dibalas: "bg-[#f0fbf6] text-[#1a7a4a] border border-[#a8e8c4]",
  diteruskan: "bg-[#f5f0fc] text-[#6a3fa0] border border-[#d4b8f0]",
  pending: "bg-[#fff9ec] text-[#9a7000] border border-[#ffe9a0]",
  admin: "bg-[#49769f] text-white",
  member: "bg-[#eaf4f8] text-[#4e8ea2]",
};

const badgeLabels: Record<BadgeProps["status"], string> = {
  menunggu: "Menunggu",
  diproses: "Diproses",
  dibalas: "Dibalas",
  diteruskan: "Diteruskan",
  pending: "Pending",
  admin: "Admin",
  member: "Member",
};

export default function Badge({ status }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-0.5 text-[11px] font-medium ${badgeStyles[status]}`}
    >
      {badgeLabels[status]}
    </span>
  );
}