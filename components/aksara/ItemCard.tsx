"use client";

import { CSSProperties } from "react";

type ItemCardProps = {
  item: any;
  onTap?: () => void;
};

const PAPER_COLORS: Record<string, string> = {
  polos: "transparent",
  garis: "transparent",
  kotak: "transparent",
  polka: "transparent",
  strip: "transparent",
  kraft: "#D9B98A",
  daur: "#E8DCC4",
  koran: "#F1E0C4",
};

export default function ItemCard({ item }: ItemCardProps) {
  const kind = item.kind || "note";
  const rot = item.rot || 0;
  const scale = item.scale || 1;
  const color = item.color || "#FFF3B0";
  const paper = item.paper || "polos";
  const font = item.font || "tangan";
  const ink = item.ink || "hitam";
  const sticker = item.sticker || "tanpa";
  const stamp = item.stamp || "tanpa";
  const shadow = item.shadow || "lembut";
  const align = item.align || "kiri";
  const shape = item.shape || "sq";
  const text = item.text || "";
  const name = item.name || "";
  const image = item.image;

  const inkColor: Record<string, string> = {
    hitam: "#2b241c",
    merah: "#C03B21",
    biru: "#2c5d8a",
    ungu: "#7B4B94",
    hijau: "#3C6B33",
  };
  const ic = inkColor[ink] || "#2b241c";

  const fontFamily: Record<string, string> = {
    tangan: "var(--font-caveat)",
    tegak: "var(--font-spectral)",
    ketik: "var(--font-ibm-plex-mono)",
    stencil: "var(--font-fraunces)",
    spidol: "var(--font-caveat)",
  };
  const ff = fontFamily[font] || "var(--font-caveat)";

  const shadowClass: Record<string, string> = {
    lembut: "0 3px 6px rgba(24,20,16,0.3)",
    tegas: "0 6px 12px rgba(24,20,16,0.45)",
    panjang: "0 12px 24px -6px rgba(24,20,16,0.5)",
  };
  const sh = shadowClass[shadow] || shadowClass.lembut;

  const stickerGlyph: Record<string, string> = {
    bintang: "★", hati: "♥", bunga: "🌸", kupu: "🦋", petir: "⚡",
    kilau: "✨", mahkota: "👑", awan: "☁", salju: "❄", daun: "🍃",
    panah: "➤", jangkar: "⚓", matahari: "☀", bulan: "☾", segel: "●",
    tanpa: "",
  };
  const sg = stickerGlyph[sticker] || "";

  // Base classes per kind
  if (kind === "polaroid") {
    const ratioClass: Record<string, string> = {
      r11: "aspect-square",
      r43: "aspect-[4/3]",
      r34: "aspect-[3/4]",
      r169: "aspect-video",
    };
    return (
      <div
        className={`relative bg-[#FDFBF4] p-1.5 rounded-sm shadow-[0_4px_8px_rgba(24,20,16,0.3)] ${ratioClass[item.ratio] || "aspect-square"} w-[120px]`}
        style={{ boxShadow: sh }}
      >
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="w-full h-full object-cover rounded-sm" />
        )}
        {text && (
          <p className="font-[var(--font-caveat)] text-[0.8rem] text-center mt-1 leading-tight">
            {text}
          </p>
        )}
        {sg && (
          <span className="absolute top-1 right-1 text-[10px]">{sg}</span>
        )}
      </div>
    );
  }

  if (kind === "clip") {
    return (
      <div
        className="relative max-w-[180px] px-3 py-2"
        style={{
          background: color,
          boxShadow: sh,
          fontFamily: ff,
          color: ic,
        }}
      >
        {/* tape */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[40px] h-[12px] bg-[rgba(240,226,170,0.9)] rotate-[-2deg] shadow-[0_1px_2px_rgba(24,20,16,0.2)]" />
        {name && (
          <span className="block font-[var(--font-ibm-plex-mono)] text-[8px] tracking-wider uppercase opacity-60 mb-1">
            {name}
          </span>
        )}
        <p className="text-[0.9rem] leading-snug whitespace-pre-wrap">{text}</p>
        {sg && <span className="absolute top-1 right-1 text-[10px]">{sg}</span>}
      </div>
    );
  }

  if (kind === "tiket") {
    return (
      <div
        className="relative px-3 py-2 max-w-[160px] border-l-2 border-r-2 border-dashed border-[#221D15]/30"
        style={{
          background: color,
          boxShadow: sh,
          fontFamily: ff,
          color: ic,
        }}
      >
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-[repeating-linear-gradient(180deg,#221D15_0_2px,transparent_2px_4px)] opacity-30" />
        <div className="absolute top-0 bottom-0 right-0 w-1 bg-[repeating-linear-gradient(180deg,#221D15_0_2px,transparent_2px_4px)] opacity-30" />
        <p className="text-[0.9rem] leading-snug whitespace-pre-wrap text-center">{text}</p>
        {sg && <span className="absolute top-1 right-1 text-[10px]">{sg}</span>}
      </div>
    );
  }

  if (kind === "amplop") {
    return (
      <div
        className="relative px-3 py-2 max-w-[160px] bg-[#F6D8DD] rounded-sm"
        style={{ boxShadow: sh, fontFamily: ff, color: ic }}
      >
        <div className="absolute top-0 left-0 right-0 h-[24px] bg-[rgba(34,29,21,0.12)] clip-path-[polygon(0_0,100%_0,50%_100%)]" />
        <p className="text-[0.9rem] leading-snug whitespace-pre-wrap mt-4">{text}</p>
        {name && (
          <span className="block font-[var(--font-ibm-plex-mono)] text-[8px] tracking-wider uppercase opacity-60 mt-1">
            {name}
          </span>
        )}
        {sg && <span className="absolute top-1 right-1 text-[10px]">{sg}</span>}
      </div>
    );
  }

  if (kind === "pita") {
    return (
      <div
        className="relative px-4 py-1.5 max-w-[200px] bg-[#F9E8EC] text-center"
        style={{ boxShadow: sh, fontFamily: ff, color: ic }}
      >
        <p className="text-[0.9rem] font-bold leading-snug whitespace-pre-wrap">{text}</p>
        {sg && <span className="absolute top-0.5 right-1 text-[10px]">{sg}</span>}
      </div>
    );
  }

  if (kind === "perangko") {
    return (
      <div
        className="relative px-2 py-1.5 max-w-[120px] bg-[#FDFBF4] border-2 border-dashed border-[#221D15]/50"
        style={{ boxShadow: sh, fontFamily: ff, color: ic }}
      >
        <p className="text-[0.8rem] leading-snug whitespace-pre-wrap text-center">{text}</p>
        {sg && <span className="absolute top-0.5 right-0.5 text-[8px]">{sg}</span>}
      </div>
    );
  }

  if (kind === "tag") {
    return (
      <div
        className="relative px-3 py-1.5 max-w-[140px] bg-[#DCE7CB] rounded-sm"
        style={{ boxShadow: sh, fontFamily: ff, color: ic }}
      >
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#221D15]/20" />
        <p className="text-[0.85rem] leading-snug whitespace-pre-wrap">{text}</p>
        {sg && <span className="absolute top-0.5 right-0.5 text-[8px]">{sg}</span>}
      </div>
    );
  }

  if (kind === "struk") {
    return (
      <div
        className="relative px-3 py-2 max-w-[140px] bg-[#F3E8CD] border-t-2 border-b-2 border-dashed border-[#221D15]/30"
        style={{ boxShadow: sh, fontFamily: ff, color: ic }}
      >
        <p className="font-[var(--font-ibm-plex-mono)] text-[8px] tracking-wider uppercase opacity-60 mb-1">
          AKSARA MART
        </p>
        <p className="text-[0.8rem] leading-snug whitespace-pre-wrap">{text}</p>
        {sg && <span className="absolute top-0.5 right-0.5 text-[8px]">{sg}</span>}
      </div>
    );
  }

  // Default: note (sticky)
  const shapeClass: Record<string, string> = {
    sq: "rounded-sm",
    wide: "rounded-sm",
    tall: "rounded-sm",
    round: "rounded-full",
    torn: "rounded-sm",
  };

  const paperBg: Record<string, string> = {
    polos: color,
    garis: color,
    kotak: color,
    polka: color,
    strip: color,
    kraft: "#D9B98A",
    daur: "#E8DCC4",
    koran: "#F1E0C4",
  };

  return (
    <div
      className={`relative px-3 py-2 min-w-[80px] max-w-[200px] ${shapeClass[shape] || "rounded-sm"}`}
      style={{
        background: paperBg[paper] || color,
        boxShadow: sh,
        fontFamily: ff,
        color: ic,
      }}
    >
      {/* pin */}
      {item.pin && item.pin !== "tanpa" && (
        <div
          className={`absolute -top-2 ${item.pinPos === "kiri" ? "left-2" : "left-1/2 -translate-x-1/2"} w-3 h-3 rounded-full`}
          style={{ background: item.pin === "merah" ? "#C03B21" : item.pin === "biru" ? "#2c5d8a" : item.pin === "kuning" ? "#F7E39B" : item.pin === "hijau" ? "#3C6B33" : "#221D15" }}
        />
      )}
      {/* tape */}
      {item.tape && item.tape !== "tanpa" && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[28px] h-[9px] bg-[rgba(240,226,170,0.9)] rotate-[-2deg] shadow-[0_1px_2px_rgba(24,20,16,0.2)]" />
      )}
      <p className="text-[1rem] leading-snug whitespace-pre-wrap">{text}</p>
      {name && (
        <span className="block font-[var(--font-ibm-plex-mono)] text-[8px] tracking-wider uppercase opacity-60 mt-1">
          {name}
        </span>
      )}
      {sg && <span className="absolute top-1 right-1 text-[10px]">{sg}</span>}
      {stamp && stamp !== "tanpa" && (
        <span className="absolute -top-1 -right-1 text-[8px] font-[var(--font-ibm-plex-mono)] uppercase tracking-wider bg-[#FDFBF4] border border-[#221D15]/30 rounded px-1 py-0.5 rotate-[7deg] opacity-75">
          {stamp}
        </span>
      )}
    </div>
  );
}
