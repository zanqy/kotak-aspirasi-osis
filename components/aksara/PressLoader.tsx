"use client";

/**
 * Animasi loading mesin cetak koran — dari aksara/loading.html demo 03.
 * Kertas mulai kosong, huruf muncul pas balok mengetuk, terhapus pas diketuk lagi.
 */
export default function PressLoader({ label = "Memuat papan…" }: { label?: string }) {
  return (
    <div className="aksara-v1">
      <div className="pressScene" role="status" aria-label={label}>
        <div className="pressFade">
          <div className="typeRow" aria-hidden="true">
            <b>A</b><b>K</b><b>S</b><b>A</b><b>R</b><b className="dot">.</b>
          </div>
          <div className="burst" aria-hidden="true">
            <i style={{ "--dx": "-16px", left: 55, background: "var(--red)", animationDelay: ".15s" } as React.CSSProperties} />
            <i style={{ "--dx": "-9px", left: 89, background: "var(--ink)", animationDelay: ".35s" } as React.CSSProperties} />
            <i style={{ "--dx": "-3px", left: 123, background: "var(--red)", animationDelay: ".55s" } as React.CSSProperties} />
            <i style={{ "--dx": "3px", left: 157, background: "var(--ink)", animationDelay: ".8s" } as React.CSSProperties} />
            <i style={{ "--dx": "9px", left: 191, background: "var(--red)", animationDelay: "1.05s" } as React.CSSProperties} />
            <i style={{ "--dx": "16px", left: 225, background: "var(--ink)", animationDelay: "1.35s" } as React.CSSProperties} />
          </div>
          <div className="paperFeed" aria-hidden="true">
            <div className="inkLine">
              <span>A</span><span>K</span><span>S</span><span>A</span><span>R</span><span>.</span>
            </div>
            <div className="edisi">EDISI 231</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, display: "grid", placeItems: "center" }}>
          <div className="roller" />
        </div>
        <div className="pressHint" style={{ position: "absolute", left: 0, right: 0, bottom: 2, textAlign: "center" }}>
          {label}
        </div>
      </div>
    </div>
  );
}
