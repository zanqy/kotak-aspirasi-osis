"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import ItemCard from "@/components/aksara/ItemCard";

type ItemSheetProps = {
  initial?: any;
  onSave: (item: any) => void;
  onCancel: () => void;
};

const KINDS = [
  { id: "note", label: "Note" },
  { id: "clip", label: "Kliping" },
  { id: "polaroid", label: "Foto" },
  { id: "tiket", label: "Tiket" },
  { id: "pita", label: "Pita" },
  { id: "perangko", label: "Perangko" },
  { id: "amplop", label: "Amplop" },
  { id: "tag", label: "Tag" },
  { id: "struk", label: "Struk" },
];

const SHAPES: Record<string, { id: string; label: string }[]> = {
  note: [
    { id: "sq", label: "Persegi" },
    { id: "wide", label: "Lebar" },
    { id: "tall", label: "Tinggi" },
    { id: "round", label: "Bulat" },
    { id: "torn", label: "Sobek" },
  ],
  clip: [
    { id: "rect", label: "Koran" },
    { id: "strip", label: "Kolom" },
    { id: "torn", label: "Sobek" },
  ],
  polaroid: [
    { id: "pola", label: "Polaroid" },
    { id: "flat", label: "Persegi" },
    { id: "round", label: "Bulat" },
    { id: "arch", label: "Lengkung" },
  ],
};

const NOTE_COLORS = ["#FFF3B0", "#F6D8DD", "#D7E4EF", "#DCE7CB", "#F7E39B", "#F1E0C4", "#FDFBF4", "#D9B98A"];
const INKS = ["hitam", "merah", "biru", "ungu", "hijau"];
const FONTS = ["tangan", "tegak", "ketik", "stencil", "spidol"];

export default function ItemSheet({ initial, onSave, onCancel }: ItemSheetProps) {
  const [kind, setKind] = useState(initial?.kind || "note");
  const [shape, setShape] = useState(initial?.shape || "sq");
  const [text, setText] = useState(initial?.text || "");
  const [name, setName] = useState(initial?.name || "");
  const [color, setColor] = useState(initial?.color || "#FFF3B0");
  const [ink, setInk] = useState(initial?.ink || "hitam");
  const [font, setFont] = useState(initial?.font || "tangan");
  const [sticker, setSticker] = useState(initial?.sticker || "tanpa");
  const [stamp, setStamp] = useState(initial?.stamp || "tanpa");
  const [paper] = useState(initial?.paper || "polos");
  const [shadow, setShadow] = useState(initial?.shadow || "lembut");
  const [align, setAlign] = useState(initial?.align || "kiri");
  const [ratio, setRatio] = useState(initial?.ratio || "r11");
  const [image, setImage] = useState<string | null>(initial?.image || null);

  const shapes = SHAPES[kind] || [{ id: "sq", label: "Default" }];

  // Reset shape when kind changes
  function handleKindChange(k: string) {
    setKind(k);
    const s = SHAPES[k];
    if (s && s.length) setShape(s[0].id);
    else setShape("sq");
  }

  function handleSave() {
    const item = {
      ...initial,
      kind,
      shape,
      text: text.trim(),
      name: name.trim(),
      color,
      ink,
      font,
      sticker,
      stamp,
      paper,
      shadow,
      align,
      ratio,
      image,
      id: initial?.id || `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      x: initial?.x ?? 200 + Math.floor(Math.random() * 900),
      y: initial?.y ?? 200 + Math.floor(Math.random() * 600),
      rot: initial?.rot ?? Math.round(Math.random() * 6 - 3),
      scale: initial?.scale ?? 1,
      at: initial?.at || Date.now(),
    };
    onSave(item);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  // Preview item
  const previewItem = {
    kind,
    shape,
    text: text || "Pratinjau...",
    name: name || undefined,
    color,
    ink,
    font,
    sticker,
    stamp,
    paper,
    shadow,
    align,
    ratio,
    image: image || undefined,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#221D15]/50 backdrop-blur-sm">
      <div className="w-full max-w-[520px] bg-[#FDFBF4] rounded-t-[20px] p-5 max-h-[85vh] overflow-y-auto shadow-[0_-10px_30px_rgba(24,20,16,0.3)]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-[var(--font-fraunces)] font-bold text-[1.2rem]">
            {initial ? "Ubah tempelan" : "Tempel baru"}
          </h2>
          <button onClick={onCancel} className="text-[#221D15]/50 text-xl leading-none">
            ×
          </button>
        </div>

        {/* Preview */}
        <div className="flex justify-center mb-5 p-4 bg-[#F2ECDE]/50 rounded-[12px]">
          <ItemCard item={previewItem} />
        </div>

        {/* Jenis */}
        <div className="mb-4">
          <p className="text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mb-2">
            Jenis
          </p>
          <div className="flex gap-2 flex-wrap">
            {KINDS.map((k) => (
              <button
                key={k.id}
                onClick={() => handleKindChange(k.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-[var(--font-ibm-plex-mono)] tracking-wider uppercase border ${
                  kind === k.id
                    ? "bg-[#221D15] text-[#F2ECDE] border-[#221D15]"
                    : "bg-transparent text-[#221D15] border-[#221D15]/30"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bentuk */}
        {shapes.length > 1 && (
          <div className="mb-4">
            <p className="text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mb-2">
              Bentuk
            </p>
            <div className="flex gap-2 flex-wrap">
              {shapes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setShape(s.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-[var(--font-ibm-plex-mono)] tracking-wider uppercase border ${
                    shape === s.id
                      ? "bg-[#221D15] text-[#F2ECDE] border-[#221D15]"
                      : "bg-transparent text-[#221D15] border-[#221D15]/30"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rasio (foto only) */}
        {kind === "polaroid" && shape !== "round" && (
          <div className="mb-4">
            <p className="text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mb-2">
              Rasio
            </p>
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "r11", label: "1:1" },
                { id: "r43", label: "4:3" },
                { id: "r34", label: "3:4" },
                { id: "r169", label: "16:9" },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRatio(r.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-[var(--font-ibm-plex-mono)] tracking-wider uppercase border ${
                    ratio === r.id
                      ? "bg-[#221D15] text-[#F2ECDE] border-[#221D15]"
                      : "bg-transparent text-[#221D15] border-[#221D15]/30"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Warna kertas */}
        {kind === "note" && (
          <div className="mb-4">
            <p className="text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mb-2">
              Warna kertas
            </p>
            <div className="flex gap-2 flex-wrap">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${color === c ? "border-[#221D15]" : "border-transparent"}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Font */}
        <div className="mb-4">
          <p className="text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mb-2">
            Gaya tulisan
          </p>
          <div className="flex gap-2 flex-wrap">
            {FONTS.map((f) => (
              <button
                key={f}
                onClick={() => setFont(f)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-[var(--font-ibm-plex-mono)] tracking-wider uppercase border ${
                  font === f
                    ? "bg-[#221D15] text-[#F2ECDE] border-[#221D15]"
                    : "bg-transparent text-[#221D15] border-[#221D15]/30"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Tinta */}
        <div className="mb-4">
          <p className="text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mb-2">
            Warna tinta
          </p>
          <div className="flex gap-2 flex-wrap">
            {INKS.map((inkColor) => {
              const c: Record<string, string> = {
                hitam: "#2b241c",
                merah: "#C03B21",
                biru: "#2c5d8a",
                ungu: "#7B4B94",
                hijau: "#3C6B33",
              };
              return (
                <button
                  key={inkColor}
                  onClick={() => setInk(inkColor)}
                  className={`w-8 h-8 rounded-full border-2 ${ink === inkColor ? "border-[#221D15]" : "border-transparent"}`}
                  style={{ background: c[inkColor] }}
                />
              );
            })}
          </div>
        </div>

        {/* Stiker */}
        <div className="mb-4">
          <p className="text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mb-2">
            Stiker
          </p>
          <div className="flex gap-2 flex-wrap">
            {["tanpa", "bintang", "hati", "bunga", "kupu", "petir", "kilau", "mahkota", "awan", "salju", "daun", "panah", "jangkar", "matahari", "bulan", "segel"].map((s) => (
              <button
                key={s}
                onClick={() => setSticker(s)}
                className={`px-2 py-1 rounded text-[10px] font-[var(--font-ibm-plex-mono)] tracking-wider uppercase border ${
                  sticker === s
                    ? "bg-[#221D15] text-[#F2ECDE] border-[#221D15]"
                    : "bg-transparent text-[#221D15] border-[#221D15]/30"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Stempel */}
        <div className="mb-4">
          <p className="text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mb-2">
            Stempel
          </p>
          <div className="flex gap-2 flex-wrap">
            {["tanpa", "osis", "penting", "rahasia", "love", "senyum", "semangat", "baru", "dibaca", "wow"].map((s) => (
              <button
                key={s}
                onClick={() => setStamp(s)}
                className={`px-2 py-1 rounded text-[10px] font-[var(--font-ibm-plex-mono)] tracking-wider uppercase border ${
                  stamp === s
                    ? "bg-[#221D15] text-[#F2ECDE] border-[#221D15]"
                    : "bg-transparent text-[#221D15] border-[#221D15]/30"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Bayangan */}
        <div className="mb-4">
          <p className="text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mb-2">
            Bayangan
          </p>
          <div className="flex gap-2 flex-wrap">
            {["lembut", "tegas", "panjang"].map((s) => (
              <button
                key={s}
                onClick={() => setShadow(s)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-[var(--font-ibm-plex-mono)] tracking-wider uppercase border ${
                  shadow === s
                    ? "bg-[#221D15] text-[#F2ECDE] border-[#221D15]"
                    : "bg-transparent text-[#221D15] border-[#221D15]/30"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Align */}
        <div className="mb-4">
          <p className="text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mb-2">
            Teks rata
          </p>
          <div className="flex gap-2 flex-wrap">
            {["kiri", "tengah", "kanan"].map((s) => (
              <button
                key={s}
                onClick={() => setAlign(s)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-[var(--font-ibm-plex-mono)] tracking-wider uppercase border ${
                  align === s
                    ? "bg-[#221D15] text-[#F2ECDE] border-[#221D15]"
                    : "bg-transparent text-[#221D15] border-[#221D15]/30"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Foto upload (polaroid only) */}
        {kind === "polaroid" && (
          <div className="mb-4">
            <p className="text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mb-2">
              Foto
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-[0.85rem] font-[var(--font-spectral)]"
            />
            {image && (
              <button
                onClick={() => setImage(null)}
                className="mt-2 text-[0.8rem] text-[#C03B21] font-[var(--font-spectral)] italic"
              >
                Hapus foto
              </button>
            )}
          </div>
        )}

        {/* Text input */}
        <div className="mb-4">
          <p className="text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mb-2">
            Tulisan
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis di sini..."
            rows={3}
            className="w-full font-[var(--font-caveat)] text-[1.1rem] text-[#2b241c] bg-transparent border border-[#221D15]/20 rounded-[8px] p-2.5 outline-none focus:border-[#C03B21] resize-none"
          />
        </div>

        {/* Name input */}
        <div className="mb-5">
          <p className="text-[10px] tracking-[0.16em] uppercase text-[#221D15]/55 font-[var(--font-ibm-plex-mono)] mb-2">
            Nama (opsional)
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Namamu..."
            className="w-full font-[var(--font-caveat)] text-[1.1rem] text-[#2b241c] bg-transparent border border-[#221D15]/20 rounded-[8px] p-2.5 outline-none focus:border-[#C03B21]"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-none bg-transparent text-[#221D15] border-[1.5px] border-[#221D15]/30 rounded-[10px] px-4 py-3 font-[var(--font-spectral)] font-medium text-[0.95rem]"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-[#221D15] text-[#F2ECDE] border-0 rounded-[10px] px-4 py-3 font-[var(--font-fraunces)] font-bold text-[1rem]"
          >
            {initial ? "Simpan perubahan" : "Tempel"}
          </button>
        </div>
      </div>
    </div>
  );
}
