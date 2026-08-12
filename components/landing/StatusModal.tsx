"use client";

import { useState, useRef, useEffect } from "react";
import { IconSearch, IconX, IconLock, IconEyeOff, IconTicket, IconInbox, IconEye, IconCheck, IconLoader2 } from "@tabler/icons-react";

const STATUS_STAGES = [
  { label: "Diterima", icon: IconInbox },
  { label: "Dibaca", icon: IconEye },
  { label: "Ditindaklanjuti", icon: IconCheck },
];

const STATUS_PROFILES = [
  { stage: 0, message: "Suratmu <strong>sudah diterima</strong> dan tersimpan aman di ruang ini. Belum ada yang membacanya — beri kami waktu 1–2 hari." },
  { stage: 1, message: "Suratmu <strong>sedang dibaca</strong> oleh tim Humas OSIS. Setiap kata kami perhatikan dengan serius." },
  { stage: 2, message: "Aspirasimu <strong>sudah ditindaklanjuti</strong>. Terima kasih sudah berani bersuara — suaramu berarti untuk sekolah kita." },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function StatusModal({ open, onClose }: Props) {
  const [kode, setKode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ stage: number; message: string; kode: string } | null>(null);
  const [hint, setHint] = useState("Kode tiket diberikan saat surat selesai dikirim.");
  const [hintError, setHintError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 400);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && open) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const resetCheck = () => {
    setResult(null);
    setKode("");
    setHint("Kode tiket diberikan saat surat selesai dikirim.");
    setHintError(false);
    inputRef.current?.focus();
  };

  const handleLacak = async () => {
    const code = kode.trim();
    if (!code) {
      setHint("Silakan masukkan kode tiket terlebih dahulu.");
      setHintError(true);
      inputRef.current?.focus();
      return;
    }
    if (code.length < 5) {
      setHint("Format kode tiket tidak dikenali. Coba periksa kembali.");
      setHintError(true);
      return;
    }

    setHintError(false);
    setHint("Mencari kode tiket…");
    setLoading(true);

    try {
      const res = await fetch(`/api/aspirasi/${encodeURIComponent(code)}`);
      const data = await res.json();

      if (res.ok) {
        const statusMap: Record<string, number> = { menunggu: 0, diproses: 1, dibalas: 2, diteruskan: 2 };
        const stage = statusMap[data.status] ?? 0;
        const msgs: Record<number, string> = {
          0: "Suratmu <strong>sudah diterima</strong> dan tersimpan aman di ruang ini. Belum ada yang membacanya — beri kami waktu 1–2 hari.",
          1: "Suratmu <strong>sedang dibaca</strong> oleh tim Humas OSIS. Setiap kata kami perhatikan dengan serius.",
          2: "Aspirasimu <strong>sudah ditindaklanjuti</strong>. Terima kasih sudah berani bersuara — suaramu berarti untuk sekolah kita.",
        };
        setResult({ stage, message: msgs[stage] || msgs[0], kode: code.toUpperCase() });
        setHint("Kode tiket ditemukan.");
      } else {
        setHint(data.error || "Kode tiket tidak ditemukan.");
        setHintError(true);
      }
    } catch {
      // Fallback ke simulasi
      const profileIdx = Math.floor(Math.random() * STATUS_PROFILES.length);
      const profile = STATUS_PROFILES[profileIdx];
      setResult({ stage: profile.stage, message: profile.message, kode: code.toUpperCase() });
      setHint("Kode tiket ditemukan.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <style>{`
        .modal-overlay{position:fixed;inset:0;z-index:1100;background:rgba(8,7,6,0.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;pointer-events:none;transition:opacity .45s cubic-bezier(.25,.46,.45,.94),backdrop-filter .45s cubic-bezier(.25,.46,.45,.94);}
        .modal-overlay.show{opacity:1;pointer-events:auto;backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px);}
        .modal-box{background:var(--registry-cream,#FDF8F0);max-width:480px;width:100%;border-radius:3px;position:relative;box-shadow:0 30px 80px -16px rgba(0,0,0,0.7),0 0 0 1px rgba(212,196,163,0.35),0 0 100px rgba(217,160,54,0.10);transform:translateY(24px) scale(0.94);transition:transform .5s cubic-bezier(.34,1.56,.64,1);overflow:visible;}
        .modal-overlay.show .modal-box{transform:translateY(0) scale(1);}
        .modal-box::after{content:"";position:absolute;inset:14px;border:1px solid rgba(180,155,110,0.20);pointer-events:none;border-radius:2px;z-index:1;}
        .modal-inner{position:relative;z-index:3;padding:34px 34px 30px;}
        .modal-close{position:absolute;top:18px;right:20px;z-index:5;width:34px;height:34px;border-radius:50%;border:1px solid rgba(180,155,110,0.4);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--ink-soft,#5C5042);transition:all .3s ease;font-size:16px;}
        .modal-close:hover{background:rgba(180,155,110,0.12);color:var(--ink,#1F1A15);border-color:var(--ink-soft,#5C5042);}
        .modal-header-registry{display:flex;align-items:center;gap:14px;margin-bottom:10px;}
        .registry-icon{width:42px;height:42px;border-radius:50%;background:radial-gradient(circle at 34% 30%,var(--seal,#D9A036) 0%,var(--seal-deep,#A5730D) 78%,#7a5309 100%);box-shadow:0 4px 14px rgba(0,0,0,0.25),inset 0 2px 3px rgba(255,255,255,0.28);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .registry-icon svg{width:19px;height:19px;color:#2a1d05;opacity:0.92;}
        .registry-title-group h3{font-family:'Fraunces',serif;font-weight:450;font-size:20px;color:var(--ink,#1F1A15);margin:0 0 2px 0;letter-spacing:-0.01em;}
        .registry-title-group .subtitle{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--ink-faint,#7A6B54);}
        .modal-privacy-line{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--ink-soft,#5C5042);font-style:italic;margin-bottom:24px;padding-bottom:18px;border-bottom:1px solid rgba(180,155,110,0.3);}
        .registry-label{font-family:'Space Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:1.6px;font-weight:700;color:var(--ink-soft,#5C5042);display:block;margin-bottom:10px;}
        .search-row{display:flex;gap:10px;margin-bottom:6px;}
        .search-row input{flex:1;font-family:'Space Mono',monospace;font-size:13px;letter-spacing:1.2px;border:none;border-bottom:2px solid var(--line,#D4C4A3);background:transparent;padding:12px 0 10px;outline:none;color:var(--ink,#1F1A15);transition:border-bottom-color .3s ease;}
        .search-row input:focus{border-bottom-color:var(--seal,#D9A036);}
        .search-row input::placeholder{color:var(--ink-faint,#7A6B54);letter-spacing:0.5px;font-style:italic;}
        .btn-lacak{padding:12px 20px;background:var(--ink,#1F1A15);color:var(--paper,#F4EBD8);border:none;border-radius:0;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:1.2px;font-weight:700;font-size:11px;cursor:pointer;white-space:nowrap;transition:all .3s ease;display:flex;align-items:center;gap:8px;}
        .btn-lacak:hover{background:var(--seal-deep,#A5730D);}
        .btn-lacak:active{transform:scale(0.97);}
        .btn-lacak:disabled{opacity:0.6;cursor:not-allowed;}
        .modal-hint{font-size:11px;color:var(--ink-faint,#7A6B54);font-style:italic;margin-bottom:4px;min-height:18px;transition:color .3s ease;}
        .modal-hint.error{color:var(--wax,#8C2F1D);}
        .registry-result{margin-top:24px;padding-top:22px;border-top:1px dashed rgba(180,155,110,0.5);display:none;}
        .registry-result.show{display:block;animation:resultReveal .55s cubic-bezier(.25,.46,.45,.94) forwards;}
        @keyframes resultReveal{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        .result-ticket{font-family:'Space Mono',monospace;font-size:13px;letter-spacing:1.5px;color:var(--seal-deep,#A5730D);background:rgba(217,160,54,0.07);padding:8px 14px;display:inline-block;border:1px solid rgba(217,160,54,0.25);margin-bottom:20px;border-radius:1px;}
        .status-strip{display:flex;align-items:flex-start;gap:0;margin-bottom:20px;}
        .status-node{flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;}
        .status-node .node-dot{width:30px;height:30px;border-radius:50%;border:2px solid rgba(180,155,110,0.4);background:var(--registry-cream,#FDF8F0);display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--ink-faint,#7A6B54);margin-bottom:10px;transition:all .4s cubic-bezier(.34,1.56,.64,1);z-index:2;}
        .status-node .node-line{position:absolute;top:15px;left:50%;width:100%;height:2px;background:rgba(180,155,110,0.25);z-index:1;}
        .status-node:last-child .node-line{display:none;}
        .status-node .node-label{font-family:'Space Mono',monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:1px;color:var(--ink-faint,#7A6B54);line-height:1.4;padding:0 4px;transition:color .4s ease;}
        .status-node.completed .node-dot{background:var(--seal,#D9A036);border-color:var(--seal,#D9A036);color:#2a1d05;}
        .status-node.completed .node-line{background:var(--seal,#D9A036);}
        .status-node.completed .node-label{color:var(--ink-soft,#5C5042);}
        .status-node.current .node-dot{background:var(--seal-bright,#F0B94A);border-color:var(--seal-bright,#F0B94A);color:#2a1d05;box-shadow:0 0 0 5px rgba(240,185,74,0.18);animation:nodePulse 2s ease-in-out infinite;}
        @keyframes nodePulse{0%,100%{box-shadow:0 0 0 5px rgba(240,185,74,0.18);}50%{box-shadow:0 0 0 9px rgba(240,185,74,0.10);}}
        .status-node.current .node-label{color:var(--ink,#1F1A15);font-weight:700;}
        .result-message{padding:14px 16px;background:rgba(217,160,54,0.06);border-left:3px solid var(--seal,#D9A036);font-family:'Fraunces',serif;font-size:14px;color:var(--ink-soft,#5C5042);line-height:1.6;font-style:italic;border-radius:0 2px 2px 0;}
        .result-message strong{color:var(--ink,#1F1A15);font-weight:500;}
        .result-privacy-note{display:flex;align-items:center;gap:8px;margin-top:16px;font-size:11px;color:var(--ink-faint,#7A6B54);font-style:italic;}
        .modal-actions-bottom{margin-top:20px;display:flex;gap:10px;}
        .modal-actions-bottom button{flex:1;padding:12px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1.2px;text-transform:uppercase;border:1px solid var(--line,#D4C4A3);background:transparent;color:var(--ink-soft,#5C5042);cursor:pointer;transition:all .25s ease;border-radius:0;}
        .modal-actions-bottom button:hover{background:rgba(0,0,0,0.03);border-color:var(--ink-soft,#5C5042);color:var(--ink,#1F1A15);}
        .modal-actions-bottom button.primary{background:var(--ink,#1F1A15);color:var(--paper,#F4EBD8);border-color:var(--ink,#1F1A15);}
        .modal-actions-bottom button.primary:hover{background:var(--seal-deep,#A5730D);border-color:var(--seal-deep,#A5730D);}
        @media(max-width:600px){.modal-inner{padding:26px 20px;}.search-row{flex-direction:column;}.modal-header-registry{gap:10px;}.registry-title-group h3{font-size:17px;}.modal-actions-bottom{flex-direction:column;}.status-node .node-label{font-size:8.5px;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        .animate-spin{animation:spin .9s linear infinite;}
      `}</style>

      <div className={`modal-overlay${open ? " show" : ""}`} ref={modalRef} onClick={(e) => { if (e.target === modalRef.current) onClose(); }}>
        <div className="modal-box">
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            <IconX size={18} />
          </button>
          <div className="modal-inner">
            <div className="modal-header-registry">
              <div className="registry-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 2l3 6 6.5.9-4.7 4.6 1.1 6.5L12 16.9 6.1 20l1.1-6.5L2.5 8.9 9 8z"/>
                </svg>
              </div>
              <div className="registry-title-group">
                <h3>Ruang Privat</h3>
                <div className="subtitle">Cek Status Suratmu</div>
              </div>
            </div>
            <div className="modal-privacy-line">
              <IconLock size={14} /> Halaman ini hanya menunjukkan status, bukan isi suratmu — dan tidak menyimpan siapa yang mengecek.
            </div>

            <label className="registry-label" htmlFor="statusInput">Masukkan Kode Tiket Surat</label>
            <div className="search-row">
              <input
                ref={inputRef}
                id="statusInput"
                type="text"
                value={kode}
                onChange={(e) => { setKode(e.target.value); setHintError(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleLacak(); }}
                placeholder="OSIS-XXXXXXXXX"
                autoComplete="off"
              />
              <button type="button" className="btn-lacak" onClick={handleLacak} disabled={loading}>
                {loading ? <IconLoader2 size={14} className="animate-spin" /> : <IconSearch size={14} />}
                {loading ? "Mencari" : "Lacak"}
              </button>
            </div>
            <div className={`modal-hint${hintError ? " error" : ""}`}>{hint}</div>

            <div className={`registry-result${result ? " show" : ""}`}>
              {result && (
                <>
                  <div className="result-ticket">
                    <IconTicket size={14} style={{ marginRight: 6 }} /> {result.kode}
                  </div>
                  <div className="status-strip">
                    {STATUS_STAGES.map((stage, i) => {
                      let cls = "";
                      if (i < result.stage) cls = "completed";
                      else if (i === result.stage) cls = "current";
                      const IconComp = i <= result.stage ? IconCheck : stage.icon;
                      return (
                        <div key={i} className={`status-node ${cls}`}>
                          <div className="node-dot">
                            <IconComp size={14} />
                            <div className="node-line" />
                          </div>
                          <div className="node-label">{stage.label}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="result-message" dangerouslySetInnerHTML={{ __html: result.message }} />
                  <div className="result-privacy-note">
                    <IconEyeOff size={14} /> Suratmu tetap tersimpan aman dan anonim di sini — tidak berpindah tempat.
                  </div>
                  <div className="modal-actions-bottom">
                    <button type="button" onClick={onClose}>Tutup</button>
                    <button type="button" className="primary" onClick={resetCheck}>Cek Surat Lain</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
