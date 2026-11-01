"use client";

/**
 * Kemunculan bertahap: tiap blok halaman naik + memudar satu-satu,
 * bukan jebret sekaligus. Bungkus blok, kasih jeda (ms).
 * Elemen di dalamnya tidak tersentuh (transform milik sendiri aman).
 * CSS ikut di sini supaya mandiri (tidak campur aduk dengan globals.css).
 */
const RV_CSS = `
@keyframes aks-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.rv { opacity: 0; animation: aks-rise .85s cubic-bezier(.2,.7,.3,1) forwards; }
@media (prefers-reduced-motion: reduce) { .rv { animation: none; opacity: 1; } }
`;

let rvMounted = false;

export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  if (typeof document !== "undefined" && !rvMounted) {
    rvMounted = true;
    const el = document.createElement("style");
    el.setAttribute("data-aksara-reveal", "");
    el.textContent = RV_CSS;
    document.head.appendChild(el);
  }
  return (
    <div className={`rv ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
