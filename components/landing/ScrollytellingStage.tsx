"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./ScrollytellingStage.module.css";

const T = {
  bgDeep: "#080706", bgSpot: "#1c1712", bgSpot2: "#120f0b",
  paper: "#F4EBD8", paperDeep: "#E2D4B7", paperDark: "#C9B78F",
  card: "#FCF9F2", ink: "#1F1A15", inkSoft: "#5C5042", inkFaint: "#7A6B54",
  seal: "#D9A036", sealBright: "#F0B94A", sealGlow: "rgba(217, 160, 54, 0.28)",
  sealDeep: "#A5730D", wax: "#8C2F1D", waxDeep: "#5E1D11",
  waxGlow: "rgba(140, 47, 29, 0.35)", line: "#D4C4A3",
} as const;

const SCENES = [
  { eyebrow: "Sebelum kamu bicara", line1: "Ada yang kamu simpan sendiri —", line2: "ditulis, lalu ", em: "tidak pernah dikirim." },
  { eyebrow: "Ternyata bukan cuma kamu", line1: "Banyak yang juga ", em: "menyimpan sesuatu", line2: " — ada yang gampang dibilang, ada yang belum." },
  { eyebrow: "Sekarang, siap dikirim", line1: "Kali ini, ", em: "kirim saja.", line2: "Tidak perlu nama." },
  { eyebrow: "Suratmu terbuka di sini", line1: "Tulis apa pun yang mau kamu sampaikan.", em: "", line2: "" },
];

const WHISPERS = [
  { text: "kantin penuh pas istirahat", cut: false },
  { text: "kadang pengen cerita, tapi—", cut: true },
  { text: "wifi lab sering mati", cut: false },
  { text: "sebenernya ada yang ngeganjel dari—", cut: true },
  { text: "jadwal ulangan numpuk", cut: false },
  { text: "nggak semua yang keliatan baik-baik aja—", cut: true },
  { text: "mading udah lama gitu-gitu aja", cut: false },
  { text: "udah lama pengen bilang ini, cuma—", cut: true },
  { text: "toilet lantai 2 kurang bersih", cut: false },
  { text: "kalau boleh jujur, aku—", cut: true },
  { text: "pengen ada lomba futsal", cut: false },
  { text: "capek juga sebenernya, tapi—", cut: true },
  { text: "kelas kepanasan pas siang", cut: false },
  { text: "susah jelasinnya, pokoknya—", cut: true },
];

const WHISPER_POS = [
  { top: "15%", left: "5%", z: -20, blur: 2 }, { top: "35%", left: "25%", z: 10, blur: 0 },
  { top: "65%", left: "8%", z: -40, blur: 3 }, { top: "55%", left: "70%", z: 20, blur: 0 },
  { top: "12%", left: "85%", z: -10, blur: 1 }, { top: "45%", left: "35%", z: 30, blur: 0 },
  { top: "78%", left: "75%", z: -30, blur: 2 }, { top: "25%", left: "65%", z: 5, blur: 0 },
  { top: "40%", left: "88%", z: -15, blur: 1 }, { top: "60%", left: "45%", z: 25, blur: 0 },
  { top: "48%", left: "2%", z: -25, blur: 2 }, { top: "28%", left: "78%", z: 15, blur: 0 },
  { top: "85%", left: "35%", z: -5, blur: 1 }, { top: "18%", left: "55%", z: 35, blur: 0 },
];

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function easeOutQuad(x: number) { return 1 - (1 - x) * (1 - x); }
function easeOutCubic(x: number) { return 1 - Math.pow(1 - x, 3); }

interface Props {
  onSceneChange?: (scene: number) => void;
  onProgress?: (p: number) => void;
  onFormVisible?: (visible: boolean) => void;
  onFormStagger?: (fp: number) => void;
  formWrapperRef?: React.RefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
}

export default function ScrollytellingStage({ onSceneChange, onProgress, onFormVisible, onFormStagger, formWrapperRef: extRef, children }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const storyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const envFlapRef = useRef<HTMLDivElement>(null);
  const waxSealRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const progressLabelRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const motesLayerRef = useRef<HTMLDivElement>(null);
  const whisperLayerRef = useRef<HTMLDivElement>(null);
  const internalFormRef = useRef<HTMLDivElement>(null);
  const formWrapperRef = extRef || internalFormRef;
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [currentScene, setCurrentScene] = useState(0);
  const [isTouch, setIsTouch] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorVis, setCursorVis] = useState(false);
  const [ringPos, setRingPos] = useState({ x: 0, y: 0 });
  const [autoPlaying, setAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const tiltRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const lastP = useRef(0);
  const scrollGate = useRef(false);
  const motesData = useRef<{ el: HTMLDivElement; phase: number; speed: number; amp: number; driftX: number }[]>([]);
  const motesT = useRef(0);
  const motesRaf = useRef(0);
  const wDrift = useRef<{ ampY: number; ampX: number; speedY: number; speedX: number; phase: number; rot: number }[]>([]);
  const wVis = useRef<number[]>(WHISPERS.map(() => 0));
  const wBaseY = useRef<number[]>(WHISPERS.map(() => 14));
  const wClock = useRef(0);
  const wRaf = useRef(0);
  const cRaf = useRef(0);
  const tRaf = useRef(0);
  const aRaf = useRef(0);
  const aEnabled = useRef(true);
  const mPause = useRef(false);
  const uPaused = useRef(false);
  const resumeT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFt = useRef<number | null>(null);
  const isSync = useRef(false);
  const obsRef = useRef<IntersectionObserver | null>(null);
  const secVis = useRef(true);
  const AUTO_SPEED = 2.4;
  const RESUME_DELAY = 2000;

  useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none), (pointer: coarse)").matches);
    const cb = () => setIsMobile(window.innerWidth <= 768);
    cb(); window.addEventListener("resize", cb);
    return () => window.removeEventListener("resize", cb);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const el = stageRef.current; if (!el) return;
    obsRef.current = new IntersectionObserver(([e]) => { secVis.current = e.isIntersecting; }, { threshold: 0.1 });
    obsRef.current.observe(el);
    return () => obsRef.current?.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (isTouch || reducedMotion) return;
    let rx = 0, ry = 0, tx = 0, ty = 0, run = true;
    const mv = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; setCursorPos({ x: tx, y: ty }); setCursorVis(true); };
    const lp = () => {
      if (!run) return;
      if (Math.abs(tx - rx) < 0.3 && Math.abs(ty - ry) < 0.3) { cRaf.current = requestAnimationFrame(lp); return; }
      rx += (tx - rx) * 0.16; ry += (ty - ry) * 0.16;
      setRingPos({ x: rx, y: ry });
      cRaf.current = requestAnimationFrame(lp);
    };
    window.addEventListener("pointermove", mv, { passive: true });
    cRaf.current = requestAnimationFrame(lp);
    return () => { run = false; window.removeEventListener("pointermove", mv); cancelAnimationFrame(cRaf.current); };
  }, [isTouch, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const layer = motesLayerRef.current; if (!layer) return;
    const n = isMobile ? 8 : 16;
    const arr: typeof motesData.current = [];
    for (let i = 0; i < n; i++) {
      const el = document.createElement("div");
      const s = 1 + Math.random() * 2;
      el.style.cssText = `position:absolute;width:${s}px;height:${s}px;border-radius:50%;background:rgba(217,160,54,0.5);filter:blur(0.4px);will-change:transform,opacity;left:${(Math.random()*100).toFixed(1)}%;top:${(Math.random()*100).toFixed(1)}%;opacity:${(0.15+Math.random()*0.35).toFixed(2)}`;
      layer.appendChild(el);
      arr.push({ el, phase: Math.random() * Math.PI * 2, speed: 0.15 + Math.random() * 0.25, amp: 10 + Math.random() * 22, driftX: (Math.random() - 0.5) * 14 });
    }
    motesData.current = arr;
    let run = true;
    const tick = () => {
      if (!run) return;
      if (!secVis.current) { motesRaf.current = requestAnimationFrame(tick); return; }
      motesT.current += 0.016; const t = motesT.current;
      for (const m of arr) m.el.style.transform = `translate(${(Math.cos(t*m.speed*0.7+m.phase)*m.driftX).toFixed(1)}px,${(Math.sin(t*m.speed+m.phase)*m.amp).toFixed(1)}px)`;
      motesRaf.current = requestAnimationFrame(tick);
    };
    motesRaf.current = requestAnimationFrame(tick);
    return () => { run = false; cancelAnimationFrame(motesRaf.current); arr.forEach(m => m.el.remove()); };
  }, [reducedMotion, isMobile]);

  useEffect(() => {
    if (reducedMotion) return;
    const layer = whisperLayerRef.current; if (!layer) return;
    const drift: typeof wDrift.current = [];
    const els: HTMLDivElement[] = [];
    WHISPERS.forEach((w, i) => {
      const el = document.createElement("div");
      const pos = WHISPER_POS[i % WHISPER_POS.length];
      el.textContent = w.text;
      el.style.cssText = `position:absolute;font-family:'Fraunces',serif;font-style:italic;font-size:clamp(14px,1.5vw,18px);white-space:nowrap;opacity:0;z-index:2;will-change:transform,opacity,filter;pointer-events:none;text-shadow:0 4px 14px rgba(0,0,0,0.55);top:${pos.top};left:${pos.left};filter:blur(${pos.blur}px);color:${w.cut?"rgba(240,185,74,0.65)":"rgba(244,235,216,0.25)"};${w.cut?"-webkit-mask-image:linear-gradient(90deg,#000 0%,#000 40%,transparent 90%);mask-image:linear-gradient(90deg,#000 0%,#000 40%,transparent 90%);":""}`;
      el.dataset.z = String(pos.z);
      layer.appendChild(el); els.push(el);
      drift.push(w.cut ? { ampY: 8+((i*3)%10), ampX: 4+((i*2)%6), speedY: 0.2+(i%4)*0.05, speedX: 0.15+(i%3)*0.06, phase: i*1.5, rot: (i%2===0?1:-1)*(0.5+(i%2)) } : { ampY: 15+((i*7)%20), ampX: 8+((i*5)%12), speedY: 0.4+(i%4)*0.1, speedX: 0.3+(i%3)*0.12, phase: i*1.5, rot: (i%2===0?1:-1)*(1+(i%3)) });
    });
    wDrift.current = drift;
    let run = true;
    const tick = () => {
      if (!run) return;
      if (!secVis.current) { wRaf.current = requestAnimationFrame(tick); return; }
      wClock.current += 1; const t = wClock.current * 0.016;
      for (let i = 0; i < els.length; i++) {
        const v = wVis.current[i] || 0;
        if (v <= 0.001) { els[i].style.opacity = "0"; continue; }
        els[i].style.opacity = (v * 0.65).toFixed(3);
        if (reducedMotion) { els[i].style.transform = "translate3d(0,0,0)"; continue; }
        const d = drift[i];
        els[i].style.transform = `translate3d(${(Math.cos(t*d.speedX+d.phase)*d.ampX).toFixed(1)}px,${((wBaseY.current[i]||0)+Math.sin(t*d.speedY+d.phase)*d.ampY).toFixed(1)}px,${els[i].dataset.z||"0"}px) rotate(${(Math.sin(t*d.speedY*0.5+d.phase)*d.rot).toFixed(1)}deg)`;
      }
      wRaf.current = requestAnimationFrame(tick);
    };
    wRaf.current = requestAnimationFrame(tick);
    return () => { run = false; cancelAnimationFrame(wRaf.current); els.forEach(e => e.remove()); };
  }, [reducedMotion]);

  const storyBottomY = useCallback(() => {
    const s = storyRef.current; if (!s) return 0;
    return s.getBoundingClientRect().height - window.innerHeight;
  }, []);

  const updateScroll = useCallback(() => {
    const story = storyRef.current; if (!story) return;
    const paper = paperRef.current;
    const envFlap = envFlapRef.current;
    const waxSeal = waxSealRef.current;
    const pf = progressFillRef.current;
    const pl = progressLabelRef.current;
    const sh = scrollHintRef.current;
    const caps = capRefs.current;
    const fw = formWrapperRef.current;

    const rect = story.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const scrolled = clamp(-rect.top, 0, total);
    const p = total > 0 ? scrolled / total : 0;
    lastP.current = p;

    if (pf) pf.style.height = `${p * 100}%`;
    const si = Math.min(3, Math.floor(p * 4));
    if (pl) pl.textContent = `0${si + 1} / 04`;

    caps.forEach((cap, i) => {
      if (!cap) return;
      const segS = i * 0.25, segE = segS + 0.25;
      cap.classList.toggle(styles.active, p >= segS - 0.05 && p < segE - 0.02);
    });
    if (sh) sh.style.opacity = p < 0.03 ? "1" : "0";

    let w: number, h: number, rz: number, rx: number, ry: number, sc: number, fr: number, op: number, ws: number;

    if (p < 0.25) {
      const t1 = easeOutQuad(p / 0.25);
      w = lerp(160, 220, t1); h = lerp(200, 280, t1); rz = lerp(-8, -2, t1); rx = lerp(30, 10, t1); ry = lerp(-15, -5, t1);
      sc = 1; fr = -180; op = lerp(0.5, 1, t1 * 2); ws = 0;
      wVis.current = WHISPERS.map(() => 0);
    } else if (p < 0.5) {
      const t2 = (p - 0.25) / 0.25;
      w = lerp(220, 280, t2); h = lerp(280, 320, t2); rz = lerp(-2, 2, t2); rx = lerp(10, 5, t2); ry = lerp(-5, 5, t2);
      sc = 1; fr = -180; op = 1; ws = 0;
      for (let i = 0; i < WHISPERS.length; i++) {
        const st = (i % 14) * 0.02;
        const lt = clamp((t2 - st) / 0.5, 0, 1);
        wVis.current[i] = Math.sin(lt * Math.PI);
        wBaseY.current[i] = lerp(20, -15, lt);
      }
    } else if (p < 0.75) {
      const t3 = easeOutCubic((p - 0.5) / 0.25);
      w = lerp(280, 240, t3); h = lerp(320, 200, t3); rz = lerp(2, 0, t3); rx = lerp(5, 0, t3); ry = lerp(5, 0, t3);
      sc = 1; fr = lerp(-180, 0, t3); op = 1; ws = t3 > 0.82 ? clamp((t3 - 0.82) / 0.18, 0, 1) : 0;
      wVis.current = WHISPERS.map(() => 1 - t3);
    } else {
      const t4 = (p - 0.75) / 0.25;
      w = 240; h = 200; rz = 0; rx = lerp(0, -10, t4); ry = 0;
      sc = lerp(1, 1.2, t4); fr = 0; op = lerp(1, 0, clamp((t4 - 0.4) / 0.4, 0, 1)); ws = 1;
      wVis.current = WHISPERS.map(() => 0);
    }

    const tilt = tiltRef.current;
    tilt.x += (tilt.tx - tilt.x) * 0.06;
    tilt.y += (tilt.ty - tilt.y) * 0.06;
    const tf = p < 0.5 ? 1 - p * 1.4 : 0;

    if (paper) {
      paper.style.width = `${w}px`; paper.style.height = `${h}px`;
      paper.style.transform = `scale(${sc}) rotateX(${rx + tilt.x * clamp(tf, 0, 1)}deg) rotateY(${ry + tilt.y * clamp(tf, 0, 1)}deg) rotateZ(${rz}deg)`;
      paper.style.opacity = String(op);
    }
    if (envFlap) envFlap.style.transform = `rotateX(${fr}deg)`;
    if (waxSeal) { if (ws > 0.5) { waxSeal.classList.add(styles.pressed); waxSeal.classList.add("pressed"); } else { waxSeal.classList.remove(styles.pressed); waxSeal.classList.remove("pressed"); } }

    const fp = clamp((p - 0.72) / (1.0 - 0.72), 0, 1);
    if (fw) {
      if (fp > 0.02) { fw.classList.add(styles.visible); fw.classList.add("visible"); } else { fw.classList.remove(styles.visible, styles.ready); fw.classList.remove("visible", "ready"); }
      if (fp > 0.08) { fw.classList.add(styles.ready); fw.classList.add("ready"); } else { fw.classList.remove(styles.ready); fw.classList.remove("ready"); }
    }
    onFormVisible?.(fp > 0.02);
    onFormStagger?.(fp);
    onProgress?.(p);

    const ns = Math.min(3, Math.floor(p * 4));
    if (ns !== currentScene) { setCurrentScene(ns); onSceneChange?.(ns); }
  }, [currentScene, onSceneChange, onProgress, onFormVisible, onFormStagger, formWrapperRef]);

  useEffect(() => {
    const cb = () => {
      if (scrollGate.current) return;
      scrollGate.current = true;
      requestAnimationFrame(() => { updateScroll(); scrollGate.current = false; });
    };
    window.addEventListener("scroll", cb, { passive: true });
    window.addEventListener("resize", updateScroll);
    updateScroll();
    return () => { window.removeEventListener("scroll", cb); window.removeEventListener("resize", updateScroll); };
  }, [updateScroll]);

  useEffect(() => {
    const mv = (e: PointerEvent) => {
      tiltRef.current.ty = ((e.clientX / window.innerWidth) - 0.5) * 10;
      tiltRef.current.tx = ((e.clientY / window.innerHeight) - 0.5) * -8;
    };
    window.addEventListener("pointermove", mv, { passive: true });
    return () => window.removeEventListener("pointermove", mv);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let run = true;
    const tick = () => {
      if (!run) return;
      const t = tiltRef.current;
      if (Math.abs(t.tx - t.x) < 0.02 && Math.abs(t.ty - t.y) < 0.02) { tRaf.current = requestAnimationFrame(tick); return; }
      updateScroll();
      tRaf.current = requestAnimationFrame(tick);
    };
    tRaf.current = requestAnimationFrame(tick);
    return () => { run = false; cancelAnimationFrame(tRaf.current); };
  }, [reducedMotion, updateScroll]);

  const pauseAuto = useCallback(() => {
    if (!aEnabled.current) return;
    mPause.current = true;
    if (resumeT.current) clearTimeout(resumeT.current);
    resumeT.current = setTimeout(() => { mPause.current = false; if (!uPaused.current) setAutoPlaying(true); }, RESUME_DELAY);
  }, []);

  useEffect(() => {
    const wh = () => { pauseAuto(); setAutoPlaying(false); };
    const kd = (e: KeyboardEvent) => { if (["ArrowDown","ArrowUp","PageDown","PageUp"," ","Spacebar","Home","End"].includes(e.key)) { pauseAuto(); setAutoPlaying(false); } };
    window.addEventListener("wheel", wh, { passive: true });
    window.addEventListener("touchstart", wh, { passive: true });
    window.addEventListener("keydown", kd);
    return () => { window.removeEventListener("wheel", wh); window.removeEventListener("touchstart", wh); window.removeEventListener("keydown", kd); };
  }, [pauseAuto]);

  useEffect(() => {
    let run = true; lastFt.current = null;
    const tick = (now: number) => {
      if (!run) return;
      if (lastFt.current === null) lastFt.current = now;
      const dt = now - lastFt.current; lastFt.current = now;
      if (aEnabled.current && !mPause.current) {
        const bot = storyBottomY();
        if (window.scrollY < bot - 1) {
          const step = AUTO_SPEED * (dt / 16.6);
          isSync.current = true;
          window.scrollTo(0, Math.min(window.scrollY + step, bot));
          isSync.current = false;
          updateScroll();
        } else { aEnabled.current = false; setAutoPlaying(false); }
      }
      aRaf.current = requestAnimationFrame(tick);
    };
    aRaf.current = requestAnimationFrame(tick);
    return () => { run = false; cancelAnimationFrame(aRaf.current); };
  }, [storyBottomY, updateScroll]);

  const toggleAuto = useCallback(() => {
    if (uPaused.current || mPause.current) {
      uPaused.current = false; mPause.current = false;
      if (resumeT.current) clearTimeout(resumeT.current);
      if (window.scrollY < storyBottomY() - 1) aEnabled.current = true;
      setAutoPlaying(true);
    } else {
      uPaused.current = true; mPause.current = true;
      if (resumeT.current) clearTimeout(resumeT.current);
      setAutoPlaying(false);
    }
  }, [storyBottomY]);

  // ======================== RENDER ========================
  return (
    <>
      <div className={styles.noiseOverlay} aria-hidden="true" />
      <div className={styles.bgGlow} aria-hidden="true" />

      {!isTouch && (
        <>
          <div className={styles.cursorDot} style={{ transform: `translate(${cursorPos.x}px,${cursorPos.y}px) translate(-50%,-50%)`, opacity: cursorVis ? 1 : 0 }} />
          <div className={styles.cursorRing} style={{ transform: `translate(${ringPos.x}px,${ringPos.y}px) translate(-50%,-50%)`, opacity: cursorVis ? 1 : 0 }} />
        </>
      )}

      <nav className={styles.navFloat}>
        <div className={styles.navBrand}>
          <div className={styles.navDot} />
          <div className={styles.navName}>OSIS Humas</div>
        </div>
        <div className={styles.navProgressLabel} ref={progressLabelRef}>01 / 04</div>
      </nav>

      <div className={styles.progressRail}><div className={styles.progressFill} ref={progressFillRef} /></div>

      <button type="button" className={`${styles.autoscrollToggle}${autoPlaying ? ` ${styles.playing}` : ""}`} onClick={toggleAuto} aria-pressed={autoPlaying}>
        <span className={styles.ring} aria-hidden="true" />
        <i className={`ti ti-player-${autoPlaying ? "pause" : "play"}-filled`} aria-hidden="true" />
        <span className={styles.srLabel}>{autoPlaying ? "Jeda gulir otomatis" : "Lanjutkan gulir otomatis"}</span>
      </button>

      <section className={styles.story} ref={storyRef}>
        <div className={styles.stage} ref={stageRef}>
          <div className={styles.stageMotes} ref={motesLayerRef} />

          {SCENES.map((scene, i) => (
            <div key={i} className={styles.sceneCaption} ref={el => { capRefs.current[i] = el; }}>
              <div className={styles.eyebrow}>{scene.eyebrow}</div>
              <h2>
                {scene.line1}{scene.line1 && scene.em ? " " : ""}{scene.em ? <em>{scene.em}</em> : ""}{scene.line2 ? <><br />{scene.line2}</> : ""}
              </h2>
            </div>
          ))}

          <div ref={whisperLayerRef} />

          <div className={styles.paperObject} ref={paperRef}>
            <div className={styles.shadowCast} />
            <div className={styles.envFlap} ref={envFlapRef} />
            <div className={styles.waxSeal} ref={waxSealRef}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#f4ebd8" strokeWidth="1.3" width="18" height="18">
                <path d="M12 3l2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.6 5-.7z"/>
              </svg>
            </div>
            <div className={styles.sheet}>
              <div className={styles.foldTr} />
              <div className={styles.inkLines}>
                <div className={styles.rl} style={{ width: "62%" }} />
                <div className={styles.rl} style={{ width: "80%" }} />
                <div className={styles.rl} style={{ width: "45%" }} />
                <div className={`${styles.rl} ${styles.accent}`} />
              </div>
            </div>
          </div>

          <div className={`${styles.formCardWrapper} form-card-wrapper`} ref={formWrapperRef as React.RefObject<HTMLDivElement>}>
            {children}
          </div>

          <div className={styles.scrollHint} ref={scrollHintRef}>
            <span>Scroll perlahan</span>
            <div className={styles.chevron} />
          </div>
        </div>
      </section>
    </>
  );
}
