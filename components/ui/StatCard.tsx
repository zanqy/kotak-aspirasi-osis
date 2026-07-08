"use client";

interface StatCardProps {
  number: number;
  label: string;
  color?: string;
}

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  default: { bg: "#f4f9fc", text: "#49769f", border: "#d0e8ef" },
  yellow: { bg: "#fff9ec", text: "#9a7000", border: "#ffe9a0" },
  green: { bg: "#f0fbf6", text: "#1a7a4a", border: "#a8e8c4" },
  purple: { bg: "#f5f0fc", text: "#6a3fa0", border: "#d4b8f0" },
};

export default function StatCard({ number, label, color }: StatCardProps) {
  const c = colorMap[color || "default"] || colorMap.default;

  return (
    <div
      className="rounded-[14px] border p-4 flex flex-col"
      style={{
        backgroundColor: c.bg,
        borderColor: c.border,
      }}
    >
      <span
        className="text-[26px] font-semibold leading-tight"
        style={{ color: c.text }}
      >
        {number}
      </span>
      <span className="text-[12px] text-[#6ea2b3] mt-1">{label}</span>
    </div>
  );
}