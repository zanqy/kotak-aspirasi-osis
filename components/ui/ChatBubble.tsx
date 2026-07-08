"use client";

interface ChatBubbleProps {
  isi: string;
  pengirim: "kiri" | "kanan";
  label: string;
  waktu: string;
}

export default function ChatBubble({
  isi,
  pengirim,
  label,
  waktu,
}: ChatBubbleProps) {
  const isKanan = pengirim === "kanan";

  return (
    <div
      className={`flex flex-col ${isKanan ? "items-end" : "items-start"} gap-1`}
    >
      <div
        className={`max-w-[80%] px-3.5 py-2.5 text-[13px] leading-[1.6] ${
          isKanan
            ? "bg-[#49769f] text-white rounded-[18px_18px_4px_18px]"
            : "bg-white text-[#1a3d47] border border-[#c8dde8] rounded-[18px_18px_18px_4px]"
        }`}
      >
        {isi}
      </div>
      <div
        className={`flex items-center gap-1.5 px-1 text-[11px] ${
          isKanan ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <span className="text-[#6ea2b3]">{label}</span>
        <span className="text-[#a8c8d4]">·</span>
        <span className="text-[#a8c8d4]">{waktu}</span>
      </div>
    </div>
  );
}