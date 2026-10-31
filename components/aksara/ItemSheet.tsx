"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef, useState } from "react";
import { V1, buildItem } from "@/lib/aksara/v1-render";

type SheetProps = {
  initial?: any;
  /** titik papan tempat menempel (dari ketuk papan kosong); kalau null pakai acak */
  atPoint?: { x: number; y: number } | null;
  onSave: (item: any) => void;
  onCancel: () => void;
};

type Opt = [string, string];
const KIND_META: { id: string; icon: string; label: string }[] = [
  { id: "note", icon: "▭", label: "Note" },
  { id: "clip", icon: "▤", label: "Kliping" },
  { id: "tiket", icon: "◫", label: "Tiket" },
  { id: "pita", icon: "❯❮", label: "Pita" },
  { id: "perangko", icon: "▦", label: "Perangko" },
  { id: "amplop", icon: "✉", label: "Amplop" },
  { id: "tag", icon: "◈", label: "Tag" },
  { id: "struk", icon: "≣", label: "Struk" },
  { id: "tulis", icon: "✎", label: "Tulis" },
  { id: "polaroid", icon: "▣", label: "Foto" },
  { id: "umbul", icon: "⚑", label: "Umbul" },
  { id: "balon", icon: "○", label: "Balon" },
  { id: "badge", icon: "✸", label: "Badge" },
  { id: "lampu", icon: "✦", label: "Lampu" },
  { id: "lampion", icon: "◍", label: "Lampion" },
  { id: "layang", icon: "◇", label: "Layang" },
  { id: "kipas", icon: "✵", label: "Kipas" },
  { id: "rantai", icon: "∞", label: "Rantai" },
];

const KIND_ICON: Record<string, string> = {
  bintang: "★", hati: "♥", bunga: "✿", kupu: "❋", petir: "⚡", kilau: "✦",
  mahkota: "♛", awan: "☁", salju: "❄", nada: "♪", payung: "☂", bulan: "☾",
  segel: "★", daun: "❧", panah: "➳", jangkar: "⚓", matahari: "☀", cap: "",
};
const INK_HEX: Record<string, string> = {
  hitam: "#2b241c", merah: "#C03B21", biru: "#2C5E9E", ungu: "#7B4B94", hijau: "#3E6B35",
};
const FRAME_HEX: Record<string, string> = {
  putih: "#FFFDF7", krem: "#F3E9D2", pink: "#F9E8EC", hitam: "#2B241C", kayu: "#7D5230",
};
const HL_HEX: Record<string, string> = {
  kuning: "#ECC13E", pink: "#E882A0", biru: "#78A0D7", hijau: "#78BE6E",
};
const PIN_HEX: Record<string, [string, string]> = {
  merah: ["#E4634A", "#8E2814"], kuning: ["#F2C230", "#8A6A10"], biru: ["#6EA3E0", "#1E4276"],
  hijau: ["#7FC47A", "#2A5E28"], hitam: ["#6B6259", "#14110D"],
};

const TEXT_KINDS = ["note", "clip", "tiket", "pita", "perangko", "amplop", "tag", "struk", "tulis", "balon", "badge", "polaroid"];
const FONT_KINDS = ["note", "clip", "tiket", "polaroid", "amplop", "tag"];
const HL_KINDS = ["note", "clip", "tiket"];
const ALIGN_KINDS = ["note", "clip", "tiket", "perangko", "struk", "tulis"];
const COLOR_KINDS = ["note", "pita", "perangko", "amplop", "tag", "balon", "badge"];
const TAPE_KINDS = ["clip", "polaroid"];

function rnd<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export default function ItemSheet({ initial, atPoint, onSave, onCancel }: SheetProps) {
  const [kind, setKind] = useState(initial?.kind || "note");
  const [shape, setShape] = useState(initial?.shape || "sq");
  const [text, setText] = useState(initial?.text || "");
  const [name, setName] = useState(initial?.name || "");
  const [color, setColor] = useState(initial?.color || "#F7E39B");
  const [paper, setPaper] = useState(initial?.paper || "polos");
  const [font, setFont] = useState(initial?.font || "tangan");
  const [ink, setInk] = useState(initial?.ink || "hitam");
  const [filter, setFilter] = useState(initial?.filter || "biasa");
  const [tape, setTape] = useState(initial?.tape ?? "bening");
  const [tapePos, setTapePos] = useState(initial?.tapePos || "atas");
  const [frame, setFrame] = useState(initial?.frame || "putih");
  const [highlight, setHighlight] = useState(initial?.highlight || "tanpa");
  const [stamp, setStamp] = useState(initial?.stamp || "tanpa");
  const [sticker, setSticker] = useState(initial?.sticker || "tanpa");
  const [sp, setSp] = useState(initial?.sp || "tr");
  const [sg, setSg] = useState(initial?.sg || "normal");
  const [pin, setPin] = useState(initial?.pin || "merah");
  const [pinPos, setPinPos] = useState(initial?.pinPos || "tengah");
  const [align, setAlign] = useState(initial?.align || "kiri");
  const [shadow, setShadow] = useState(initial?.shadow || "lembut");
  const [ratio, setRatio] = useState(initial?.ratio || "11");
  const [image, setImage] = useState<string | null>(initial?.image || null);
  const [adv, setAdv] = useState(false);
  const prevRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const shapes: Opt[] = (V1.SHAPES as any)[kind] || [["sq", "Persegi"]];
  const papers: Opt[] = (V1.PAPERS as any)[kind] || [];

  useEffect(() => {
    if (!shapes.some((s) => s[0] === shape)) setShape(shapes[0][0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  useEffect(() => {
    if (papers.length && !papers.some((p) => p[0] === paper)) setPaper(papers[0][0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  function handleKindChange(k: string) {
    setKind(k);
    const list: Opt[] = (V1.SHAPES as any)[k] || [["sq", "Persegi"]];
    setShape(list[0][0]);
    const pl: Opt[] = (V1.PAPERS as any)[k] || [];
    if (pl.length) setPaper(pl[0][0]);
  }

  // ---------- pratinjau live: rakit dari kelas item asli ----------
  const previewData = useMemo(
    () => ({
      id: "prev", kind, shape, text: text.trim() || null, name: name.trim() || null,
      color, paper, font, ink, filter, tape, tapePos, frame, highlight,
      stamp, sticker, sp, sg, pin, pinPos, align, shadow, ratio, image,
      x: 0, y: 0, rot: 0, scale: 1,
    }),
    [kind, shape, text, name, color, paper, font, ink, filter, tape, tapePos, frame,
      highlight, stamp, sticker, sp, sg, pin, pinPos, align, shadow, ratio, image]
  );

  useEffect(() => {
    const box = prevRef.current;
    if (!box) return;
    box.innerHTML = "";
    try {
      const el = buildItem(previewData as any);
      box.appendChild(el);
    } catch {
      /* abaikan pratinjau gagal */
    }
  }, [previewData]);

  // ---------- Kejutan: acak seperti referensi ----------
  function surprise() {
    const R = (l: Opt[]) => rnd(l)[0];
    setShape(R((V1.SHAPES as any)[kind] || [["sq", "x"]]));
    if (kind === "note") {
      setColor(rnd(V1.NOTE_COLORS as string[])); setPin(R(V1.PINS as Opt[]));
      setPinPos(R(V1.PINS_POS as Opt[])); setAlign(R(V1.ALIGNS as Opt[])); setSp(R(V1.SPS as Opt[]));
      setPaper(R(((V1.PAPERS as any).note as Opt[]))); setFont(R(V1.FONTS as Opt[]));
      setInk(R(V1.INKS as Opt[])); setSticker(R(V1.STICKERS as Opt[])); setStamp(R(V1.STAMPS as Opt[]));
      setHighlight(R(V1.HIGHLIGHTS as Opt[]));
    }
    if (kind === "clip") {
      setAlign(R(V1.ALIGNS as Opt[])); setSp(R(V1.SPS as Opt[])); setPaper(R(((V1.PAPERS as any).clip as Opt[])));
      setFont(R(V1.FONTS as Opt[])); setInk(R(V1.INKS as Opt[])); setTape(R(V1.TAPES as Opt[]));
      setTapePos(R(V1.TAPE_POS as Opt[])); setSticker(R(V1.STICKERS as Opt[])); setStamp(R(V1.STAMPS as Opt[]));
      setHighlight(R(V1.HIGHLIGHTS as Opt[]));
    }
    if (kind === "tiket") {
      setAlign(R(V1.ALIGNS as Opt[])); setSp(R(V1.SPS as Opt[])); setPaper(R(((V1.PAPERS as any).tiket as Opt[])));
      setSticker(R(V1.STICKERS as Opt[])); setStamp(R(V1.STAMPS as Opt[])); setHighlight(R(V1.HIGHLIGHTS as Opt[]));
      setInk(R(V1.INKS as Opt[]));
    }
    if (kind === "pita") {
      setColor(rnd(V1.NOTE_COLORS as string[])); setSticker(R(V1.STICKERS as Opt[]));
      setStamp(R(V1.STAMPS as Opt[])); setInk(R(V1.INKS as Opt[]));
    }
    if (kind === "amplop" || kind === "tag") {
      setSp(R(V1.SPS as Opt[])); setColor(rnd(V1.NOTE_COLORS as string[])); setFont(R(V1.FONTS as Opt[]));
      setInk(R(V1.INKS as Opt[])); setSticker(R(V1.STICKERS as Opt[])); setStamp(R(V1.STAMPS as Opt[]));
    }
    if (kind === "perangko") {
      setAlign(R(V1.ALIGNS as Opt[])); setSp(R(V1.SPS as Opt[])); setColor(rnd(V1.NOTE_COLORS as string[]));
      setSticker(R(V1.STICKERS as Opt[])); setStamp(R(V1.STAMPS as Opt[])); setInk(R(V1.INKS as Opt[]));
    }
    if (kind === "struk") {
      setAlign(R(V1.ALIGNS as Opt[])); setInk(R(V1.INKS as Opt[]));
      setSticker(R(V1.STICKERS as Opt[])); setStamp(R(V1.STAMPS as Opt[]));
    }
    if (kind === "balon" || kind === "badge") {
      setColor(rnd(V1.NOTE_COLORS as string[])); setInk(R(V1.INKS as Opt[]));
      setSticker(R(V1.STICKERS as Opt[])); setStamp(R(V1.STAMPS as Opt[]));
    }
    if (kind === "tulis") {
      setInk(R(V1.INKS as Opt[])); setAlign(R(V1.ALIGNS as Opt[]));
      setSticker(R(V1.STICKERS as Opt[])); setStamp(R(V1.STAMPS as Opt[]));
    }
    if (kind === "umbul") {
      setShape(R(((V1.SHAPES as any).umbul as Opt[]))); setSticker(R(V1.STICKERS as Opt[]));
      setStamp(R(V1.STAMPS as Opt[]));
    }
    if (["lampu", "lampion", "layang", "kipas", "rantai"].includes(kind)) {
      setSticker(R(V1.STICKERS as Opt[])); setStamp(R(V1.STAMPS as Opt[]));
    }
    if (kind === "polaroid") {
      setSp(R(V1.SPS as Opt[])); setFont(R(V1.FONTS as Opt[])); setInk(R(V1.INKS as Opt[]));
      setFilter(R(V1.FILTERS as Opt[])); setTape(R(V1.TAPES as Opt[])); setTapePos(R(V1.TAPE_POS as Opt[]));
      setFrame(R(V1.FRAMES as Opt[])); setSticker(R(V1.STICKERS as Opt[])); setStamp(R(V1.STAMPS as Opt[]));
    }
    setShadow(R(V1.SHADOWS as Opt[])); setSg(R(V1.SGS as Opt[]));
  }

  function handleSave() {
    const item: any = {
      ...initial, kind, shape,
      text: text.trim(), name: name.trim(), color, paper, font, ink, filter,
      tape, tapePos, frame, highlight, stamp, sticker, sp, sg, pin, pinPos,
      align, shadow, ratio, image,
      id: initial?.id || `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      x: initial?.x ?? atPoint?.x ?? 200 + Math.floor(Math.random() * 900),
      y: initial?.y ?? atPoint?.y ?? 200 + Math.floor(Math.random() * 600),
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
      const url = reader.result as string;
      // rasio otomatis: pilih yang paling dekat dengan aspek foto
      const img = new Image();
      img.onload = () => {
        const a = img.width / img.height;
        const cands: [string, number][] = [["11", 1], ["43", 4 / 3], ["34", 3 / 4], ["169", 16 / 9]];
        let best = "11", bd = 1e9;
        for (const [id, v] of cands) {
          const d = Math.abs(a - v);
          if (d < bd) { bd = d; best = id; }
        }
        setRatio(best);
      };
      img.src = url;
      setImage(url);
    };
    reader.readAsDataURL(file);
  }

  function OptRow({ id, list, cur, pick, paint }: {
    id: string; list: Opt[]; cur: string; pick: (v: string) => void; paint?: (t: Opt) => string;
  }) {
    if (!list.length) return null;
    return (
      <div className="shapes" id={id}>
        {list.map((t) => (
          <button
            key={t[0]} type="button" className="shape"
            data-shape={t[0]} aria-pressed={t[0] === cur ? "true" : "false"}
            onClick={() => pick(t[0])}
            dangerouslySetInnerHTML={{ __html: `${paint ? paint(t) : "<b></b>"}<span>${t[1]}</span>` }}
          />
        ))}
      </div>
    );
  }

  const showText = TEXT_KINDS.includes(kind);
  const showName = kind === "clip" || kind === "polaroid";

  return (
    <div className="aksara-v1">
      <div className="sheet open">
        <div className="panel">
          <h3>{initial ? "Ubah tempelan" : "Tempel di papan"}</h3>
          <p className="sub">Pilih benda, lalu tempel di titik yang kamu ketuk.</p>
          <div className="livePrev on" ref={prevRef} />

          <div className="kinds">
            {KIND_META.map((k) => (
              <button
                key={k.id} type="button" className="kind" data-kind={k.id}
                aria-pressed={k.id === kind ? "true" : "false"}
                onClick={() => handleKindChange(k.id)}
              >
                <i>{k.icon}</i><span>{k.label}</span>
              </button>
            ))}
          </div>

          <OptRow id="shapes" list={shapes} cur={shape} pick={setShape} />

          {kind === "polaroid" && shape !== "round" && (
            <OptRow
              id="ratios" list={V1.RATIOS as Opt[]} cur={ratio} pick={setRatio}
              paint={(t) => `<b style="width:${t[0] === "34" ? 13 : t[0] === "169" ? 27 : 20}px"></b>`}
            />
          )}

          {COLOR_KINDS.includes(kind) && (
            <OptRow
              id="colors" list={(V1.NOTE_COLORS as string[]).map((c) => [c, c] as Opt)}
              cur={color} pick={setColor}
              paint={(t) => `<b style="background:${t[0]};border-radius:50%"></b>`}
            />
          )}

          {!!papers.length && <OptRow id="papers" list={papers} cur={paper} pick={setPaper} />}

          {FONT_KINDS.includes(kind) && (
            <OptRow
              id="fonts" list={V1.FONTS as Opt[]} cur={font} pick={setFont}
              paint={(t) => `<b style="font-family:${t[0] === "tegak" ? "var(--fs)" : t[0] === "ketik" ? "var(--fm)" : t[0] === "stencil" ? "var(--fd)" : t[0] === "spidol" ? "'Gochi Hand',cursive" : "var(--fh)"};font-size:11px">Aa</b>`}
            />
          )}

          {kind !== "tiket" || true ? (
            <OptRow
              id="inks" list={V1.INKS as Opt[]} cur={ink} pick={setInk}
              paint={(t) => `<b style="background:${INK_HEX[t[0]]};border-radius:50%"></b>`}
            />
          ) : null}

          {kind === "polaroid" && (
            <OptRow
              id="filters" list={V1.FILTERS as Opt[]} cur={filter} pick={setFilter}
            />
          )}

          {TAPE_KINDS.includes(kind) && (
            <OptRow
              id="tapes" list={V1.TAPES as Opt[]} cur={tape} pick={setTape}
              paint={(t) => `<b style="background:${t[0] === "bening" ? "rgba(240,226,170,.9)" : t[0] === "merah" ? "#C03B21" : t[0] === "biru" ? "#2C5E9E" : t[0] === "hitam" ? "#221D15" : "rgba(240,226,170,.9)"}"></b>`}
            />
          )}

          {kind === "polaroid" && (
            <OptRow
              id="frames" list={V1.FRAMES as Opt[]} cur={frame} pick={setFrame}
              paint={(t) => `<b style="background:${FRAME_HEX[t[0]]};border-color:rgba(34,29,21,.35)"></b>`}
            />
          )}

          <OptRow
            id="stamps" list={V1.STAMPS as Opt[]} cur={stamp} pick={setStamp}
            paint={(t) => t[0] === "tanpa" ? "<b></b>" : `<b style="border:1.5px solid rgba(192,59,33,.8);border-radius:3px;font:700 7px var(--fm);letter-spacing:.08em;color:#C03B21;display:inline-flex;align-items:center;padding:0 3px">${t[1].split(" ")[0].slice(0, 8)}</b>`}
          />

          <OptRow
            id="stickers" list={V1.STICKERS as Opt[]} cur={sticker} pick={setSticker}
            paint={(t) => {
              const g = KIND_ICON[t[0]] || "";
              let st = "";
              if (t[0] === "bintang" || t[0] === "petir") st = "color:#E8A013;border:0;font-size:18px";
              if (t[0] === "hati") st = "color:#C03B21;border:0;font-size:18px";
              if (t[0] === "cap") st = "border-radius:50%;border-color:rgba(192,59,33,.85)";
              if (t[0] === "segel") st = "border-radius:50%;border:0;background:radial-gradient(circle at 35% 30%,#D94A35,#8E1F10);color:#FFEADC;font-size:12px";
              if (t[0] === "daun") st = "color:#3E6B35;border:0;font-size:18px";
              if (t[0] === "panah") st = "color:#C03B21;border:0;font-size:18px";
              if (t[0] === "jangkar") st = "color:#2C5E9E;border:0;font-size:18px";
              if (t[0] === "matahari") st = "color:#E8890C;border:0;font-size:18px";
              return `<b style="${st}">${g}</b>`;
            }}
          />

          <button className="advToggle" type="button" onClick={() => setAdv(!adv)}>
            {adv ? "▾ Sembunyikan lanjutan" : "▸ Opsi lanjutan"}
          </button>

          {adv && (
            <>
              {kind === "note" && (
                <OptRow
                  id="pins" list={V1.PINS as Opt[]} cur={pin} pick={setPin}
                  paint={(t) => `<b style="border-radius:50%;background:radial-gradient(circle at 32% 30%,${PIN_HEX[t[0]][0]},${PIN_HEX[t[0]][1]})"></b>`}
                />
              )}
              {kind === "note" && (
                <OptRow
                  id="pinpos" list={V1.PINS_POS as Opt[]} cur={pinPos} pick={setPinPos}
                  paint={(t) => t[0] === "tengah"
                    ? `<b><i style="display:block;width:4px;height:4px;border-radius:50%;background:#C03B21;margin:6px auto 0"></i></b>`
                    : `<b><i style="display:block;width:4px;height:4px;border-radius:50%;background:#C03B21;margin:6px 2px 0"></i></b>`}
                />
              )}
              {ALIGN_KINDS.includes(kind) && (
                <OptRow
                  id="aligns" list={V1.ALIGNS as Opt[]} cur={align} pick={setAlign}
                  paint={(t) => `<b style="justify-content:${t[0] === "kiri" ? "flex-start" : t[0] === "tengah" ? "center" : "flex-end"}"><i style="display:block;width:12px;height:2px;background:rgba(34,29,21,.6)"></i></b>`}
                />
              )}
              <OptRow
                id="sps" list={V1.SPS as Opt[]} cur={sp} pick={setSp}
                paint={(t) => `<b style="position:relative"><i style="position:absolute;top:1px;${t[0] === "tr" ? "right:2px" : "left:2px"};font-style:normal;font-size:10px;color:#C03B21">★</i></b>`}
              />
              <OptRow
                id="shadows" list={V1.SHADOWS as Opt[]} cur={shadow} pick={setShadow}
                paint={(t) => `<b style="position:relative"><i style="position:absolute;left:3px;top:3px;width:10px;height:10px;background:#FFFDF7;border:1px solid rgba(34,29,21,.4);box-shadow:${t[0] === "lembut" ? "1px 1px 0 rgba(24,20,16,.4)" : t[0] === "tegas" ? "3px 3px 0 rgba(24,20,16,.85)" : "5px 5px 0 rgba(24,20,16,.25)"}"></i></b>`}
              />
              <OptRow
                id="sgs" list={V1.SGS as Opt[]} cur={sg} pick={setSg}
                paint={(t) => `<b style="color:#C03B21;font-size:${t[0] === "kecil" ? 9 : t[0] === "besar" ? 16 : 12}px">★</b>`}
              />
              {HL_KINDS.includes(kind) && (
                <OptRow
                  id="highlights" list={V1.HIGHLIGHTS as Opt[]} cur={highlight} pick={setHighlight}
                  paint={(t) => t[0] === "tanpa" ? "<b></b>" : `<b style="background:linear-gradient(180deg,transparent 42%,${HL_HEX[t[0]]} 42%);border-color:rgba(34,29,21,.3)"></b>`}
                />
              )}
              {TAPE_KINDS.includes(kind) && (
                <OptRow
                  id="tapePos" list={V1.TAPE_POS as Opt[]} cur={tapePos} pick={setTapePos}
                />
              )}
            </>
          )}

          {kind === "polaroid" && (
            <div className="field">
              <input type="file" ref={fileRef} accept="image/*" onChange={handleImageUpload} />
              {!image && (
                <button type="button" className="shape" onClick={() => fileRef.current?.click()}>
                  <b>▣</b><span>Pilih foto</span>
                </button>
              )}
              {image && (
                <button type="button" className="shape" onClick={() => setImage(null)}>
                  <b>×</b><span>Hapus foto</span>
                </button>
              )}
            </div>
          )}

          {showText && (
            <div className="field">
              <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={240} placeholder="Tulis sesuatu..." />
            </div>
          )}

          {showName && (
            <div className="field">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kamu (boleh kosong)" maxLength={40} />
            </div>
          )}

          <div className="row">
            <button type="button" className="btn ghost" onClick={onCancel}>Batal</button>
            <button type="button" className="btn" style={{ background: "transparent", color: "var(--ink)", border: "1px solid rgba(34,29,21,.24)" }} onClick={surprise}>⚄ Kejutan</button>
            <button type="button" className="btn grow" onClick={handleSave}>{initial ? "Simpan" : "Tempel di sini"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
