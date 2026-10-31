"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { getClientDb } from "@/lib/firebase-client";
import { useAuth } from "@/lib/aksara/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import AuthGate from "@/components/aksara/AuthGate";

function KirimInner() {
  const { user, student } = useAuth();
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [msg, setMsg] = useState("");
  const [anon, setAnon] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [resi, setResi] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!msg.trim() || !to.trim()) return;
    setSending(true);
    try {
      const db = getClientDb();
      const rcv = to.trim();
      const snd = anon ? "Anonim" : (from.trim() || student?.nama || "Tanpa nama");
      await addDoc(collection(db, "letters"), {
        to: rcv,
        from: snd,
        fromUid: anon ? null : user?.uid,
        isi: msg.trim(),
        anonim: anon,
        createdAt: serverTimestamp(),
      });
      setResi(`AKS-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
      setSent(true);
    } catch (err) {
      console.error("send failed", err);
    } finally {
      setSending(false);
    }
  }

  function handleAgain() {
    setTo("");
    setFrom("");
    setMsg("");
    setAnon(false);
    setSent(false);
    setResi("");
  }

  return (
    <div>
      <main className="max-w-[520px] mx-auto px-4 py-6">
        {/* Cap pos */}
        <div className="flex items-center gap-4 mb-4">
          <svg className="w-[80px] h-[80px] flex-none" viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <path id="c" d="M60,60 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" />
            </defs>
            <circle cx="60" cy="60" r="58" fill="none" stroke="#c23b22" strokeWidth="2" />
            <circle cx="60" cy="60" r="31" fill="none" stroke="#c23b22" strokeWidth="0.8" />
            <g>
              <text fontFamily="Space Mono,monospace" fontSize="9" fontWeight="700" fill="#c23b22">
                <textPath href="#c" textLength="262" lengthAdjust="spacing">
                  AKSARA POST · KANTOR POS REDAKSI ·
                </textPath>
              </text>
            </g>
            <text x="60" y="58" textAnchor="middle" fontFamily="Fraunces,serif" fontWeight="700" fontSize="20" fill="#c23b22">
              {new Date().getDate()}
            </text>
            <text x="60" y="72" textAnchor="middle" fontFamily="Space Mono,monospace" fontWeight="700" fontSize="9" fill="#c23b22" letterSpacing="2">
              {["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"][new Date().getMonth()]}
            </text>
          </svg>
          <div>
            <h1 className="font-[var(--font-caveat)] font-bold text-[clamp(2.4rem,10vw,3.2rem)] leading-[0.85] -rotate-3 origin-left">
              Tulis suratmu...
            </h1>
            <p className="text-[10px] tracking-[2px] text-[#221D15]/55 uppercase mt-2">
              Pos kilat redaksi · sampai hari ini juga
            </p>
          </div>
        </div>

        {/* Verse */}
        <div className="text-center my-2">
          <div className="flex items-center gap-3 text-[#9c7a2e] text-[17px]">
            <span className="flex-1 h-px bg-gradient-to-r from-transparent to-[#9c7a2e]/80" />
            ❦
            <span className="flex-1 h-px bg-gradient-to-l from-transparent to-[#9c7a2e]/80" />
          </div>
          <p className="font-[var(--font-spectral)] italic font-semibold text-[19px] text-[#5b4a2e] mt-2 min-h-[50px] px-2.5 transition-opacity">
            Surat adalah rindu yang belajar berjalan.
          </p>
        </div>

        {/* Form */}
        {!sent ? (
          <form onSubmit={handleSend}>
            <div className="relative mt-2 min-h-[368px]">
              {/* Paper */}
              <div className="relative z-[1] rotate-[-0.5deg] transition-transform focus-within:rotate-0 focus-within:-translate-y-[3px]">
                <div
                  className="relative px-5 py-3.5 bg-[#f3e8cd] shadow-[inset_0_0_46px_rgba(150,110,50,0.3)]"
                  style={{
                    clipPath:
                      "polygon(0 1.5%,3% 0,8% 1.2%,15% 0,24% 1.4%,33% .2%,45% 1.3%,57% 0,68% 1.2%,79% .1%,90% 1.3%,100% 0,99.3% 12%,100% 25%,99.2% 40%,100% 55%,99.4% 70%,100% 85%,99.3% 100%,90% 99.2%,78% 100%,66% 99.1%,52% 100%,40% 99.2%,27% 100%,14% 99.3%,0 100%,.7% 85%,0 70%,.8% 55%,0 40%,.6% 25%,0 12%)",
                    backgroundImage:
                      "radial-gradient(circle at 12% 20%,rgba(160,110,40,.18),transparent 9%),radial-gradient(circle at 88% 70%,rgba(160,110,40,.15),transparent 12%),radial-gradient(circle at 66% 6%,rgba(150,100,40,.13),transparent 8%),repeating-linear-gradient(to bottom,transparent 0 33px,rgba(120,95,50,.2) 33px 34px)",
                  }}
                >
                  <div className="flex justify-between items-center h-[34px] font-[var(--font-ibm-plex-mono)] text-[9.5px] tracking-[2px] text-[#221D15]/60 px-0 pt-1.5">
                    <span>❦ AKSARA POST</span>
                    <span className="italic text-[11px]">
                      {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-end gap-2.5 h-[34px]">
                    <label className="font-[var(--font-caveat)] text-[22px] text-[#27334d] leading-[34px] whitespace-nowrap">
                      Teruntuk
                    </label>
                    <input
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="nama penerima..."
                      maxLength={40}
                      autoComplete="off"
                      className="flex-1 bg-transparent border-0 outline-none font-[var(--font-caveat)] text-[22px] text-[#27334d] leading-[34px] h-[34px]"
                    />
                  </div>
                  <textarea
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Tulis suratmu di sini..."
                    maxLength={600}
                    className="block w-full h-[204px] resize-none bg-transparent border-0 outline-none font-[var(--font-spectral)] italic font-semibold text-[23px] leading-[34px] text-[#27334d] indent-[1.6em]"
                  />
                  <div className="flex justify-end font-[var(--font-spectral)] italic font-semibold text-[20px] text-[#27334d] items-center h-[34px]">
                    Salam hangat,
                  </div>
                  <div className="flex justify-end items-end gap-2.5 h-[34px]">
                    <span className="font-[var(--font-caveat)] text-[#27334d] leading-[34px]">—&nbsp;</span>
                    <input
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="namamu..."
                      maxLength={40}
                      autoComplete="off"
                      disabled={anon}
                      className="bg-transparent border-0 outline-none font-[var(--font-caveat)] text-[22px] text-[#27334d] leading-[34px] h-[34px] text-right w-[68%] disabled:opacity-35"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3.5 text-[10px] tracking-[1px] text-[#221D15]/55">
              <span>{msg.length} / 600</span>
              <label className="flex items-center gap-2 font-[var(--font-fraunces)] italic font-normal text-[15px] text-[#221D15] cursor-pointer">
                <button
                  type="button"
                  role="switch"
                  aria-checked={anon}
                  onClick={() => setAnon(!anon)}
                  className={`w-[50px] h-[28px] rounded-full relative transition-colors ${anon ? "bg-[#221D15]" : "bg-[#cfc3a3]"} shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]`}
                >
                  <span
                    className={`absolute top-[3px] left-[3px] w-[22px] h-[22px] rounded-full bg-[#fffdf6] shadow-[0_2px_3px_rgba(0,0,0,0.25)] transition-transform ${anon ? "translate-x-[22px]" : ""}`}
                  />
                </button>
                Anonim
              </label>
            </div>

            <div className="grid grid-cols-[auto_1fr] gap-3 mt-6">
              <Link
                href="/aksara"
                className="h-[56px] rounded-[10px] border-[1.5px] border-[#221D15]/35 bg-[rgba(255,252,242,0.5)] flex items-center justify-center font-[var(--font-fraunces)] text-[18px] font-bold text-[#221D15] no-underline"
              >
                Papan
              </Link>
              <button
                type="submit"
                disabled={sending}
                className="h-[56px] rounded-[10px] bg-[#C03B21] text-white font-[var(--font-fraunces)] text-[18px] font-bold shadow-[0_5px_0_#8e2513,0_14px_22px_-10px_rgba(194,59,34,0.6)] disabled:opacity-60"
              >
                {sending ? "Mengirim..." : "Tempel Perangko & Kirim"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 border-[1.5px] dashed border-[#221D15]/35 rounded-[12px] p-6 text-center">
            <h3 className="font-[var(--font-caveat)] text-[46px] leading-none">Surat meluncur!</h3>
            <p className="text-[11px] tracking-[2px] text-[#221D15]/55 mt-2 mb-4">
              RESI {resi}
            </p>
            <button
              onClick={handleAgain}
              className="px-5 py-3 rounded-full bg-[#221D15] text-[#F2ECDE] font-[var(--font-fraunces)] font-bold text-[1rem]"
            >
              Tulis lagi
            </button>
          </div>
        )}

        <p className="text-center text-[10px] tracking-[3px] text-[#221D15]/45 mt-7 uppercase">
          AKSARA · KANTOR POS REDAKSI
        </p>
      </main>
    </div>
  );
}

export default function KirimPage() {
  return (
    <AuthGate requireVerified>
      <KirimInner />
    </AuthGate>
  );
}
