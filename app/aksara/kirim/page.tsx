"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { getClientDb } from "@/lib/firebase-client";
import { useAuth } from "@/lib/aksara/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import AuthGate from "@/components/aksara/AuthGate";
import Reveal from "@/components/aksara/Reveal";

const VERSES = [
  "Ada kata yang hanya berani pulang lewat tulisan.",
  "Surat adalah rindu yang belajar berjalan.",
  "Tinta mengering, perasaan tidak.",
  "Tulis saja. Alamat akan menemukan jalannya.",
  "Setiap amplop menyimpan satu keberanian kecil.",
];
const CF_COLORS = ["#c23b22", "#2c5d8a", "#f6e2a0", "#b03a6a", "#2a2119"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];

function KirimInner() {
  const { user, student } = useAuth();
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [msg, setMsg] = useState("");
  const [anon, setAnon] = useState(false);
  const [sending, setSending] = useState(false);

  // ---- mesin amplop (cerminan aksara/kirim.html) ----
  const [send, setSend] = useState(false);
  const [inn, setInn] = useState(false);
  const [shut, setShut] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [flip, setFlip] = useState(false);
  const [stamped, setStamped] = useState(false);
  const [gone, setGone] = useState(false);
  const [ovOn, setOvOn] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [envTo, setEnvTo] = useState("Seseorang");
  const [envFrom, setEnvFrom] = useState("Seseorang");
  const [resi, setResi] = useState("");
  const [confetti, setConfetti] = useState<any[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ---- quotes berganti ----
  const [vi, setVi] = useState(0);
  const [vOp, setVOp] = useState(1);
  useEffect(() => {
    const id = setInterval(() => {
      setVOp(0);
      timers.current.push(setTimeout(() => {
        setVi((v) => (v + 1) % VERSES.length);
        setVOp(1);
      }, 700));
    }, 6500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const now = new Date();
  const stD = now.getDate();
  const stM = MONTHS[now.getMonth()];
  const pmD = `${stD} ${stM} ${String(now.getFullYear()).slice(2)}`;
  const headDate = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  function later(fn: () => void, ms: number) {
    timers.current.push(setTimeout(fn, ms));
  }

  function fireConfetti() {
    const parts = Array.from({ length: 40 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      left: Math.random() * 100,
      bg: CF_COLORS[i % CF_COLORS.length],
      dur: 1.6 + Math.random() * 1.4,
      delay: Math.random() * 0.4,
    }));
    setConfetti(parts);
    later(() => setConfetti([]), 3500);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (sending || send) return;
    if (!msg.trim()) {
      setShakeKey((k) => k + 1);
      return;
    }
    const rcv = to.trim() || "Seseorang";
    const snd = anon ? "— tanpa nama —" : (from.trim() || student?.nama || "Seseorang");
    setEnvTo(rcv);
    setEnvFrom(snd);
    setSending(true);
    setSend(true);
    later(() => setInn(true), 700);
    later(() => setShut(true), 1900);
    later(() => setSealed(true), 2600);
    later(() => setFlip(true), 3200);
    later(() => setStamped(true), 4200);
    later(async () => {
      setGone(true);
      fireConfetti();
      try {
        await addDoc(collection(getClientDb(), "letters"), {
          to: rcv,
          from: anon ? "Anonim" : (from.trim() || student?.nama || "Tanpa nama"),
          fromUid: anon ? null : user?.uid,
          isi: msg.trim(),
          anonim: anon,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("send failed", err);
      } finally {
        setSending(false);
      }
      setResi(`AKS-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
    }, 5000);
    later(() => setOvOn(true), 5900);
  }

  function handleAgain() {
    setOvOn(false);
    later(() => {
      setSend(false); setInn(false); setShut(false);
      setSealed(false); setFlip(false); setStamped(false); setGone(false);
      setTo(""); setFrom(""); setMsg(""); setAnon(false); setResi("");
    }, 400);
  }

  const stageCls = ["stage", send && "send", inn && "in", sealed && "sealed", gone && "gone"]
    .filter(Boolean).join(" ");
  const envCls = ["env", flip && "flip", stamped && "stamped"].filter(Boolean).join(" ");

  return (
    <div className="aksara-kirim">
      <div className="kirim-bg" aria-hidden="true" />
      <div className="kirim-bgword" aria-hidden="true">Aksara</div>
      <div className="kirim-glow" aria-hidden="true" />
      <main className="max-w-[520px] mx-auto px-4 py-6" style={{ position: "relative", zIndex: 1 }}>
        {/* Cap pos */}
        <Reveal><div className="flex items-center gap-3.5 mb-3.5">
          <svg className="stamp" viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <path id="c" d="M60,60 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" />
            </defs>
            <circle cx="60" cy="60" r="58" fill="none" stroke="#c23b22" strokeWidth="2" />
            <circle cx="60" cy="60" r="31" fill="none" stroke="#c23b22" strokeWidth="0.8" />
            <g className="ring">
              <text fontFamily="Space Mono,monospace" fontSize="9" fontWeight="700" fill="#c23b22">
                <textPath href="#c" textLength="262" lengthAdjust="spacing">
                  AKSARA POST · KANTOR POS REDAKSI ·
                </textPath>
              </text>
            </g>
            <text x="60" y="58" textAnchor="middle" fontFamily="Fraunces,serif" fontWeight="700" fontSize="20" fill="#c23b22">
              {stD}
            </text>
            <text x="60" y="72" textAnchor="middle" fontFamily="Space Mono,monospace" fontWeight="700" fontSize="9" fill="#c23b22" letterSpacing="2">
              {stM}
            </text>
          </svg>
          <div>
            <h1>Tulis suratmu...</h1>
            <p className="sub">Pos kilat redaksi · sampai hari ini juga</p>
          </div>
        </div></Reveal>

        {/* Verse */}
        <Reveal delay={90}><div className="verse">
          <div className="orn">❦</div>
          <p className="verse-q" style={{ opacity: vOp }}>{VERSES[vi]}</p>
        </div></Reveal>

        {/* Form */}
        <Reveal delay={170}>
        <div className={stageCls}>
          <div className={`sheet${shakeKey ? " shake" : ""}`} key={shakeKey || "s"}>
            <div className="paper">
              <div className="row head"><span>❦ AKSARA POST</span><span>{headDate}</span></div>
              <div className="row">
                <label htmlFor="k-to">Teruntuk</label>
                <input id="k-to" value={to} onChange={(e) => setTo(e.target.value)}
                  maxLength={40} autoComplete="off" placeholder="nama penerima..." />
              </div>
              <textarea value={msg} onChange={(e) => setMsg(e.target.value)}
                maxLength={600} placeholder="Tulis suratmu di sini..." />
              <div className="row sal">Salam hangat,</div>
              <div className="row sign">
                <span>—&nbsp;</span>
                <input value={from} onChange={(e) => setFrom(e.target.value)}
                  maxLength={40} autoComplete="off" placeholder={anon ? "tanpa nama" : "namamu..."}
                  disabled={anon} style={anon ? { opacity: 0.35 } : undefined} />
              </div>
            </div>
          </div>

          <div className="envw" aria-hidden="true"><div className={envCls}>
            <div className="fb">
              <div className="back" />
              <div className={`flap${shut ? " shut" : ""}`} />
              <div className="fold"><span>Teruntuk {envTo},</span></div>
              <div className="pocket" />
              <div className="seal">A</div>
            </div>
            <div className="ff"><div className="in">
              <div className="snd">DARI<b>{envFrom}</b></div>
              <svg className="fst" viewBox="0 0 60 72" aria-hidden="true">
                <rect x="3" y="3" width="54" height="66" fill="#2c5d8a" />
                <rect x="9" y="9" width="42" height="54" fill="none" stroke="rgba(255,255,255,.7)" />
                <text x="30" y="40" textAnchor="middle" fontSize="24" fill="#fff">✉</text>
                <text x="30" y="56" textAnchor="middle" fontFamily="Space Mono,monospace" fontSize="6.5" letterSpacing="1.5" fill="#fff">AKSARA</text>
                <rect x="3" y="3" width="54" height="66" fill="none" stroke="#f1e6cb" strokeWidth="5" strokeDasharray="0 8" strokeLinecap="round" />
              </svg>
              <svg className="pm" viewBox="0 0 150 60" aria-hidden="true">
                <g fill="none" stroke="#3b3a52" strokeWidth="1.6">
                  <circle cx="112" cy="30" r="26" /><circle cx="112" cy="30" r="21" strokeWidth=".8" />
                  <path d="M0 14q10-6 20 0t20 0t20 0t20 0M0 26q10-6 20 0t20 0t20 0t20 0M0 38q10-6 20 0t20 0t20 0t20 0M0 50q10-6 20 0t20 0t20 0t20 0" />
                </g>
                <text x="112" y="28" textAnchor="middle" fontFamily="Special Elite,monospace" fontSize="8" fill="#3b3a52">AKSARA</text>
                <text x="112" y="40" textAnchor="middle" fontFamily="Special Elite,monospace" fontSize="7.5" fill="#3b3a52">{pmD}</text>
              </svg>
              <div className="rcp">KEPADA YTH.<b>{envTo === "Seseorang" ? "—" : envTo}</b><span>c/o Kantor Pos Redaksi AKSARA</span></div>
              <div className="pa">VIA UDARA · PAR AVION</div>
            </div></div>
          </div></div>
        </div>

        <form onSubmit={handleSend}>
          <div className="under">
            <span>{msg.length} / 600</span>
            <label className="switch">
              <button type="button" role="switch" aria-checked={anon}
                aria-label="Kirim anonim" onClick={() => setAnon(!anon)} />
              Anonim
            </label>
          </div>
          <div className="actions">
            <Link className="btn btn-ghost" href="/aksara/mading/umum">Papan</Link>
            <button className="btn btn-send" type="submit" disabled={sending}>
              {sending ? "Mengirim..." : "Tempel Perangko & Kirim"}
            </button>
          </div>
        </form>
        </Reveal>
        <Reveal delay={250}><p className="foot">AKSARA · KANTOR POS REDAKSI</p></Reveal>
      </main>

      <div className={`overlay${ovOn ? " on" : ""}`} aria-live="polite">
        <div className="card">
          <h3>Surat meluncur!</h3>
          <p>RESI {resi}</p>
          <button type="button" onClick={handleAgain}>Tulis lagi</button>
        </div>
      </div>
      {confetti.map((c) => (
        <i key={c.id} className="cf" style={{
          left: `${c.left}vw`, background: c.bg,
          animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s`,
        }} />
      ))}
    </div>
  );
}

export default function KirimPage() {
  return (
    <AuthGate>
      <KirimInner />
    </AuthGate>
  );
}
