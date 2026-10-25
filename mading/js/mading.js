const LOGIN_KEY = "mading_digital_user";
const NOTES_KEY = "mading_digital_notes_v4";

/* ---- ukuran papan & sebaran ---- */
const CANVAS_W = 2400;
const CANVAS_H = 1600;
const COLS = 7;
const ROWS = 5;
const CELL_W = 298;
const CELL_H = 284;
const ORIGIN_X = 78;
const ORIGIN_Y = 96;

const KINDS = ["sticky", "card", "paper"];
const HAND_FONTS = [
  "'Caveat','Patrick Hand',cursive",
  "'Kalam','Caveat',cursive",
  "'Patrick Hand',cursive"
];
const STICKY_COLORS = ["#F7E9A0", "#F3E7C4", "#E9EFD9", "#F6E3E8", "#E3EAF2", "#F7EAD8"];

const canvas = document.getElementById("mading-canvas");
const wrap = document.querySelector(".mading-canvas-wrap");
const addBtn = document.getElementById("add-note-btn");
const loginBtn = document.getElementById("login-btn");
const userChip = document.getElementById("user-chip");
const userName = document.getElementById("user-name");
const userNis = document.getElementById("user-nis");
const rulesBtn = document.getElementById("rules-btn");

const noteModal = document.getElementById("note-modal");
const closeModal = document.getElementById("close-modal");
const cancelNote = document.getElementById("cancel-note");
const noteForm = document.getElementById("note-form");
const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const colorPicker = document.getElementById("color-picker");
const rulesModal = document.getElementById("rules-modal");
const closeRules = document.getElementById("close-rules");
const okRules = document.getElementById("ok-rules");

let selectedColor = "#F7E9A0";

function isMobile() {
  return window.matchMedia("(max-width: 768px)").matches;
}

const storedUser = localStorage.getItem(LOGIN_KEY);
let currentUser = null;

if (storedUser) {
  currentUser = JSON.parse(storedUser);
  userChip.hidden = false;
  userName.textContent = currentUser.nama;
  userNis.textContent = currentUser.nis;
  loginBtn.hidden = true;
} else {
  userChip.hidden = true;
  loginBtn.hidden = false;
}

loginBtn.addEventListener("click", () => {
  window.location.href = "login.html";
});

addBtn.addEventListener("click", () => {
  if (!currentUser) {
    alert("Kamu harus login dulu pakai NIS buat bisa tempel di mading ya.");
    window.location.href = "login.html";
    return;
  }
  noteModal.hidden = false;
  noteText.focus();
});

closeModal.addEventListener("click", closeNoteModal);
cancelNote.addEventListener("click", closeNoteModal);
closeRules.addEventListener("click", closeRulesModal);
okRules.addEventListener("click", closeRulesModal);
rulesBtn.addEventListener("click", () => {
  rulesModal.hidden = false;
});

noteModal.addEventListener("click", (e) => {
  if (e.target === noteModal) closeNoteModal();
});

rulesModal.addEventListener("click", (e) => {
  if (e.target === rulesModal) closeRulesModal();
});

colorPicker.addEventListener("click", (e) => {
  const btn = e.target.closest(".color-swatch");
  if (!btn) return;
  document.querySelectorAll(".color-swatch").forEach((sw) => sw.classList.remove("active"));
  btn.classList.add("active");
  selectedColor = btn.dataset.color;
});

noteText.addEventListener("input", () => {
  charCount.textContent = noteText.value.length;
});

noteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  const text = noteText.value.trim();
  if (!text) return;

  const id = "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const kind = KINDS[Math.abs(hash(id)) % KINDS.length];

  const noteData = {
    id,
    authorNis: currentUser.nis,
    authorName: currentUser.nama,
    authorKelas: currentUser.kelas,
    text,
    color: selectedColor,
    kind,
    status: "approved",
    reports: [],
    reportCount: 0,
    createdAt: Date.now()
  };

  saveNotes(loadNotes());
  closeNoteModal();
  noteForm.reset();
  charCount.textContent = "0";
  document.querySelectorAll(".color-swatch").forEach((sw, idx) => {
    sw.classList.toggle("active", idx === 0);
  });
  selectedColor = "#F7E9A0";

  if (isMobile()) {
    const spot = scatterSpot(noteData.id, loadNotes().length);
    noteData.posX = spot.x;
    noteData.posY = spot.y;
    noteData.rot = spot.rot;
    const notes = loadNotes();
    notes.unshift(noteData);
    saveNotes(notes);
    renderBoard();
  } else {
    enterPlacementMode(noteData);
  }
});

function closeNoteModal() {
  noteModal.hidden = true;
}

function closeRulesModal() {
  rulesModal.hidden = true;
}

/* ---- util acak yang stabil (id yang sama selalu dapat posisi sama) ---- */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pseudo(seed, salt) {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/* sebaran: grid longgar + jitter + rotasi, biar berantakan tapi nggak tumpuk */
function scatterSpot(id, index) {
  const seed = hash(id);
  const slot = index % (COLS * ROWS);
  const col = slot % COLS;
  const row = Math.floor(slot / COLS);

  const jx = (pseudo(seed, 1) - 0.5) * 14;
  const jy = (pseudo(seed, 2) - 0.5) * 16;
  const rot = (pseudo(seed, 3) - 0.5) * 3.2;

  return {
    x: Math.round(ORIGIN_X + col * CELL_W + jx),
    y: Math.round(ORIGIN_Y + row * CELL_H + jy),
    rot: Math.round(rot * 10) / 10
  };
}

function loadNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return getSeedNotes();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return getSeedNotes();
    return hydrate(parsed);
  } catch (err) {
    return getSeedNotes();
  }
}

/* data lama (sebelum board baru) belum punya kind/rot -> lengkapi */
function hydrate(notes) {
  let changed = false;
  const used = notes.map((n, i) => ({ n, i }));
  const out = notes.map((note, index) => {
    if (note.kind && typeof note.rot === "number") return note;
    const spot = scatterSpot(note.id || "x" + index, index);
    changed = true;
    return Object.assign({}, note, {
      kind: note.kind || KINDS[Math.abs(hash(note.id || "x" + index)) % KINDS.length],
      posX: typeof note.posX === "number" ? note.posX : spot.x,
      posY: typeof note.posY === "number" ? note.posY : spot.y,
      rot: typeof note.rot === "number" ? note.rot : spot.rot
    });
  });
  if (changed) saveNotes(out);
  return out;
}

function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function getSeedNotes() {
  const seed = [
    {
      id: "seed-1",
      authorNis: "00000",
      authorName: "Humas OSIS",
      authorKelas: "OSIS",
      text: "Selamat datang di papan bersama.\nTempel apresiasi, doa, atau kata semangat buat warga sekolah.",
      color: "#F7E9A0",
      kind: "paper",
      posX: 110,
      posY: 80,
      rot: -2.4,
      status: "approved",
      reports: [],
      reportCount: 0,
      createdAt: Date.now() - 1000000
    },
    {
      id: "seed-2",
      authorNis: "00000",
      authorName: "Humas OSIS",
      authorKelas: "OSIS",
      text: "Papan ini milik kita semua.\nJaga kata-katanya, jaga perasaannya.",
      color: "#FBF7EC",
      kind: "card",
      posX: 450,
      posY: 130,
      rot: 1.6,
      status: "approved",
      reports: [],
      reportCount: 0,
      createdAt: Date.now() - 900000
    },
    {
      id: "seed-3",
      authorNis: "12346",
      authorName: "Bima Saputra",
      authorKelas: "XI IPA 2",
      text: "Semangat UAS semua!! jangan lupa tidur yang cukup ya",
      color: "#E9EFD9",
      kind: "sticky",
      posX: 790,
      posY: 70,
      rot: 2.8,
      status: "approved",
      reports: [],
      reportCount: 0,
      createdAt: Date.now() - 700000
    },
    {
      id: "seed-4",
      authorNis: "12347",
      authorName: "Citra Dewi",
      authorKelas: "XI IPS 1",
      text: "makasih buat tim paduan suara, kemarin keren banget",
      color: "#F6E3E8",
      kind: "sticky",
      posX: 1080,
      posY: 250,
      rot: -2.6,
      status: "approved",
      reports: [],
      reportCount: 0,
      createdAt: Date.now() - 600000
    },
    {
      id: "seed-5",
      authorNis: "12348",
      authorName: "Dimas Pratama",
      authorKelas: "XI IPS 2",
      text: "ada yang mau ikut futsal sore? lapangan sekolah jam 4",
      color: "#E3EAF2",
      kind: "card",
      posX: 230,
      posY: 420,
      rot: -1.2,
      status: "approved",
      reports: [],
      reportCount: 0,
      createdAt: Date.now() - 500000
    }
  ];
  saveNotes(seed);
  return seed;
}

/* ---- hiasan papan: coretan tangan biar nggak terlalu rapi ---- */
const DOODLES = [
  { type: "star", x: 1900, y: 180, rot: 8, size: 46, opacity: 0.24 },
  { type: "arrow", x: 120, y: 900, rot: -12, size: 120, opacity: 0.2 },
  { type: "cross", x: 2150, y: 780, rot: 22, size: 40, opacity: 0.22 },
  { type: "star", x: 760, y: 1080, rot: -14, size: 34, opacity: 0.2 },
  { type: "arrow", x: 1680, y: 1180, rot: 168, size: 110, opacity: 0.18 },
  { type: "cross", x: 420, y: 1320, rot: -6, size: 32, opacity: 0.2 },
  { type: "squiggle", x: 1450, y: 100, rot: 3, size: 150, opacity: 0.18 },
  { type: "star", x: 2260, y: 1330, rot: -20, size: 38, opacity: 0.22 }
];

const SVG_PATHS = {
  star: '<path d="M23 2 L28 17 L44 18 L32 28 L36 44 L23 34 L10 44 L14 28 L2 18 L18 17 Z"/>',
  cross: '<path d="M8 8 L32 32 M32 8 L8 32"/>',
  arrow: '<path d="M4 60 C 26 22, 62 12, 96 16"/><path d="M78 6 L97 16 L80 30"/>',
  squiggle: '<path d="M2 18 C 16 2, 30 34, 44 18 C 58 2, 72 34, 86 18 C 100 2, 114 34, 128 18"/>'
};

function renderDoodles() {
  DOODLES.forEach((d, i) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "board-doodle");
    svg.setAttribute("viewBox", "0 0 100 70");
    svg.setAttribute("aria-hidden", "true");
    svg.style.left = d.x + "px";
    svg.style.top = d.y + "px";
    svg.style.width = d.size + "px";
    svg.style.transform = `rotate(${d.rot}deg)`;
    svg.style.opacity = String(d.opacity);
    svg.innerHTML = `<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${SVG_PATHS[d.type]}</g>`;
    canvas.appendChild(svg);
  });
}

function renderKicker() {
  const kicker = document.createElement("div");
  kicker.className = "board-kicker";
  kicker.textContent = "PAPAN BERSAMA — MMXXV";
  canvas.appendChild(kicker);

  const note = document.createElement("div");
  note.className = "board-note";
  note.textContent = "tempel apa saja yang layak dibaca orang lain";
  canvas.appendChild(note);
}

function renderBoard() {
  canvas.innerHTML = "";
  renderKicker();
  renderDoodles();

  const notes = loadNotes()
    .filter((n) => n.status !== "hidden")
    .slice()
    .sort((a, b) => a.createdAt - b.createdAt);

  notes.forEach((note, i) => {
    const seed = hash(note.id);
    const kind = note.kind || "sticky";
    const el = document.createElement("article");
    el.className = `note note--${kind}`;
    el.style.transform = `rotate(var(--rot,0deg))`;
    el.style.left = (note.posX || 100) + "px";
    el.style.top = (note.posY || 100) + "px";
    el.style.setProperty("--rot", (typeof note.rot === "number" ? note.rot : 0) + "deg");
    el.style.zIndex = String(10 + (i % 6));
    el.dataset.id = note.id;

    /* variasi tulisan tangan: font, ukuran, kemiringan, warna tinta */
    el.style.setProperty("--fs", (0.92 + pseudo(seed, 13) * 0.2).toFixed(3));
    el.style.setProperty("--tr", ((pseudo(seed, 14) - 0.5) * 2.2).toFixed(2) + "deg");
    el.style.setProperty("--sticky", note.color || "#F7E9A0");
    el.style.setProperty(
      "--rad",
      "2px"
    );
    if (kind === "sticky") {
      el.style.fontFamily = HAND_FONTS[Math.abs(seed >> 3) % HAND_FONTS.length];
    } else if (kind !== "card") {
      el.style.fontFamily = HAND_FONTS[Math.abs(seed >> 3) % HAND_FONTS.length];
    }
    el.style.setProperty("--shA", (0.16 + pseudo(seed, 20) * 0.12).toFixed(3));
    el.style.setProperty("--shB", (0.28 + pseudo(seed, 21) * 0.14).toFixed(3));
    el.style.setProperty("--shC", (0.46 + pseudo(seed, 22) * 0.16).toFixed(3));
    const ink = 34 + Math.round(pseudo(seed, 15) * 18);
    el.style.color = `rgb(${ink + 9}, ${ink}, ${Math.round(ink * 0.8)})`;

    /* variasi lebar biar nggak seragam */
    if (kind === "card") {
      el.style.width = "274px";
    } else if (kind === "sticky") {
      el.style.width = 196 + Math.round(pseudo(seed, 11) * 46) + "px";
    } else {
      el.style.width = 240 + Math.round(pseudo(seed, 12) * 24) + "px";
    }

    if (kind === "sticky") {
      el.style.background = [
        "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 30%)",
        "linear-gradient(0deg, rgba(120,92,52,.08) 0%, rgba(120,92,52,0) 14%)",
        `url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.09'/%3E%3C/svg%3E")`
      ].join(", ");
      el.style.backgroundColor = note.color || "#F7E9A0";
      el.style.backgroundBlendMode = "normal, multiply, multiply";
    } else if (kind === "card") {
      el.style.backgroundColor = note.color && note.color !== "#FBF7EC" ? note.color : "";
    } else {
      el.style.background = [
        "linear-gradient(168deg, rgba(255,255,255,.34), rgba(34,29,21,.06))",
        "linear-gradient(93deg, transparent 40%, rgba(255,255,255,.28) 41.5%, transparent 43%)",
        "linear-gradient(88deg, transparent 66%, rgba(120,92,52,.07) 67%, transparent 68.5%)",
        note.color || "#F3E7C4"
      ].join(", ");
    }

    /* selotip atau paku */
    const fix = document.createElement("span");
    if (kind === "card") {
      fix.className = "note-pin";
    } else if (kind === "paper") {
      fix.className = "note-tape";
      fix.style.transform = `translateX(-50%) rotate(${(pseudo(seed, 7) - 0.5) * 6}deg)`;
    } else {
      fix.className = "note-tape note-tape--postit";
      fix.style.transform = `translateX(-50%) rotate(${(pseudo(seed, 7) - 0.5) * 4}deg)`;
    }
    el.appendChild(fix);

    /* stempel OSIS buat note resmi */
    if (note.authorNis === "00000") {
      const stamp = document.createElement("span");
      stamp.className = "note-stamp";
      stamp.textContent = "DARI OSIS";
      el.appendChild(stamp);
      el.classList.add("note--stamped");
    }

    const header = document.createElement("div");
    header.className = "note-meta";
    header.textContent = `${note.authorKelas || "-"} · ${note.authorName || "Anonim"}`;
    el.appendChild(header);

    const body = document.createElement("div");
    body.className = "note-text";
    body.textContent = note.text;
    el.appendChild(body);

    const footer = document.createElement("div");
    footer.className = "note-foot";

    const time = document.createElement("span");
    time.className = "note-time";
    time.textContent = shortDate(note.createdAt);
    footer.appendChild(time);

    const report = document.createElement("button");
    report.className = "report-btn";
    report.type = "button";
    report.innerHTML = '<span aria-hidden="true">⚑</span> laporkan';
    report.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!currentUser) {
        alert("Harus login dulu buat bisa laporin ya.");
        window.location.href = "login.html";
        return;
      }
      reportNote(note.id);
    });
    footer.appendChild(report);

    el.appendChild(footer);
    canvas.appendChild(el);

    // ---- DRAG TO MOVE (hanya desktop) ----
    if (!isMobile()) {
      let dragging = false;
      let dragStartX = 0, dragStartY = 0;
      let dragStartLeft = 0, dragStartTop = 0;
      let pointerId = null;

      el.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".report-btn")) return;
        if (e.button !== 0 && e.pointerType === "mouse") return;
        dragging = true;
        pointerId = e.pointerId;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartLeft = parseFloat(el.style.left) || 0;
        dragStartTop = parseFloat(el.style.top) || 0;
        el.classList.add("is-dragging");
        try { el.setPointerCapture(e.pointerId); } catch (err) {}
        e.preventDefault();
      });

      el.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        let newLeft = dragStartLeft + dx;
        let newTop = dragStartTop + dy;
        newLeft = Math.max(0, Math.min(newLeft, CANVAS_W - el.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, CANVAS_H - el.offsetHeight));
        el.style.left = newLeft + "px";
        el.style.top = newTop + "px";
      });

      function endDrag(e) {
        if (!dragging) return;
        dragging = false;
        el.classList.remove("is-dragging");
        try { el.releasePointerCapture(pointerId); } catch (err) {}
        const notes = loadNotes();
        const idx = notes.findIndex((n) => n.id === note.id);
        if (idx !== -1) {
          notes[idx].posX = Math.round(parseFloat(el.style.left));
          notes[idx].posY = Math.round(parseFloat(el.style.top));
          saveNotes(notes);
        }
      }

      el.addEventListener("pointerup", endDrag);
      el.addEventListener("pointercancel", endDrag);
    }
  });

  if (notes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "board-empty";
    empty.textContent = "papan masih kosong — jadi yang pertama menempel";
    canvas.appendChild(empty);
  }
}

function shortDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

function reportNote(noteId) {
  const reason = prompt("Kenapa kamu laporin postingan ini? (SARA, bullying, ujaran kebencian, atau lainnya)");
  if (reason === null) return;
  const trimmed = reason.trim();
  if (!trimmed) {
    alert("Kasih alasan laporannya ya.");
    return;
  }
  const notes = loadNotes();
  const idx = notes.findIndex((n) => n.id === noteId);
  if (idx === -1) return;

  const already = notes[idx].reports.find((r) => r.reporterNis === currentUser.nis);
  if (already) {
    alert("Kamu udah pernah laporin postingan ini.");
    return;
  }

  notes[idx].reports.push({
    reporterNis: currentUser.nis,
    reason: trimmed,
    createdAt: Date.now()
  });
  notes[idx].reportCount = notes[idx].reports.length;
  if (notes[idx].reportCount >= 3) {
    notes[idx].status = "hidden";
  }
  saveNotes(notes);
  alert("Laporan kamu udah terkirim. Akan ditindaklanjuti oleh Humas/OSIS.");
  renderBoard();
}

/* ---- PLACEMENT MODE: pilih tempat sendiri ---- */
let placementActive = false;
let placementGhost = null;
let placementData = null;

function enterPlacementMode(noteData) {
  placementActive = true;
  placementData = noteData;
  placementGhost = document.createElement("article");
  placementGhost.className = `note note--${noteData.kind || "sticky"} note-ghost`;
  placementGhost.style.left = "100px";
  placementGhost.style.top = "100px";
  placementGhost.style.setProperty("--rot", "0deg");
  placementGhost.style.zIndex = "999";
  placementGhost.style.pointerEvents = "none";

  if (noteData.kind === "sticky") {
    placementGhost.style.background = `linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 30%), ${noteData.color || "#F7E9A0"}`;
    placementGhost.style.backgroundColor = noteData.color || "#F7E9A0";
    placementGhost.style.backgroundBlendMode = "normal, multiply";
  } else {
    placementGhost.style.backgroundColor = noteData.color || "#F3E7C4";
  }
  placementGhost.style.width = "240px";

  const meta = document.createElement("div");
  meta.className = "note-meta";
  meta.textContent = `${noteData.authorKelas || "-"} · ${noteData.authorName || "Anonim"}`;
  placementGhost.appendChild(meta);

  const body = document.createElement("div");
  body.className = "note-text";
  body.textContent = noteData.text;
  placementGhost.appendChild(body);

  canvas.appendChild(placementGhost);

  const banner = document.createElement("div");
  banner.className = "placement-banner";
  banner.id = "placement-banner";
  banner.innerHTML = '<span>🖱️ Klik di papan untuk menempelkan note kamu. <b>ESC</b> untuk batal.</span>';
  wrap.insertBefore(banner, wrap.firstChild);

  wrap.style.cursor = "crosshair";

  function onMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + wrap.scrollLeft;
    const y = e.clientY - rect.top + wrap.scrollTop;
    placementGhost.style.left = Math.max(0, Math.min(x - 120, CANVAS_W - 240)) + "px";
    placementGhost.style.top = Math.max(0, Math.min(y - 60, CANVAS_H - 200)) + "px";
  }

  function onDown(e) {
    if (e.target.closest(".placement-banner")) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + wrap.scrollLeft;
    const y = e.clientY - rect.top + wrap.scrollTop;
    const posX = Math.max(0, Math.min(Math.round(x - 120), CANVAS_W - 240));
    const posY = Math.max(0, Math.min(Math.round(y - 60), CANVAS_H - 200));

    const spot = scatterSpot(noteData.id, loadNotes().length);
    noteData.posX = posX;
    noteData.posY = posY;
    noteData.rot = spot.rot;

    const notes = loadNotes();
    notes.push(noteData);
    saveNotes(notes);

    cleanupPlacement();
    renderBoard();
  }

  function onKey(e) {
    if (e.key === "Escape") {
      const spot = scatterSpot(noteData.id, loadNotes().length);
      noteData.posX = spot.x;
      noteData.posY = spot.y;
      noteData.rot = spot.rot;
      const notes = loadNotes();
      notes.push(noteData);
      saveNotes(notes);
      cleanupPlacement();
      renderBoard();
    }
  }

  function cleanupPlacement() {
    placementActive = false;
    if (placementGhost) placementGhost.remove();
    placementGhost = null;
    placementData = null;
    const b = document.getElementById("placement-banner");
    if (b) b.remove();
    wrap.style.cursor = "";
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerdown", onDown);
    document.removeEventListener("keydown", onKey);
  }

  document.addEventListener("pointermove", onMove);
  document.addEventListener("pointerdown", onDown);
  document.addEventListener("keydown", onKey);
}

/* pusatkan pandangan ke area note saat pertama buka (desktop) */
function centerBoard() {
  if (isMobile()) return;
  const notes = [...canvas.querySelectorAll(".note")];
  if (!notes.length) return;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  notes.forEach((n) => {
    const l = parseFloat(n.style.left) || 0;
    const t = parseFloat(n.style.top) || 0;
    minX = Math.min(minX, l);
    minY = Math.min(minY, t);
    maxX = Math.max(maxX, l + n.offsetWidth);
    maxY = Math.max(maxY, t + n.offsetHeight);
  });
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  wrap.scrollLeft = Math.max(0, cx - wrap.clientWidth / 2);
  wrap.scrollTop = Math.max(0, cy - wrap.clientHeight / 2);
}

renderBoard();
requestAnimationFrame(centerBoard);
