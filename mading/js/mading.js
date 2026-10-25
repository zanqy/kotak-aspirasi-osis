const LOGIN_KEY = "mading_digital_user";
const NOTES_KEY = "mading_digital_notes";

/* ---- ukuran papan & sebaran ---- */
const CANVAS_W = 2400;
const CANVAS_H = 1600;
const COLS = 7;
const ROWS = 5;
const CELL_W = 310;
const CELL_H = 292;
const ORIGIN_X = 78;
const ORIGIN_Y = 96;

const KINDS = ["sticky", "card", "paper"];
const STICKY_COLORS = ["#F7E9A0", "#F3E7C4", "#E9EFD9", "#F6E3E8", "#E3EAF2", "#F7EAD8"];

const canvas = document.getElementById("mading-canvas");
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

  const notes = loadNotes();
  const id = "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const spot = scatterSpot(id, notes.length);
  const kind = KINDS[Math.abs(hash(id)) % KINDS.length];

  notes.push({
    id,
    authorNis: currentUser.nis,
    authorName: currentUser.nama,
    authorKelas: currentUser.kelas,
    text,
    color: selectedColor,
    kind,
    posX: spot.x,
    posY: spot.y,
    rot: spot.rot,
    status: "approved",
    reports: [],
    reportCount: 0,
    createdAt: Date.now()
  });

  saveNotes(notes);
  closeNoteModal();
  noteForm.reset();
  charCount.textContent = "0";
  document.querySelectorAll(".color-swatch").forEach((sw, idx) => {
    sw.classList.toggle("active", idx === 0);
  });
  selectedColor = "#F7E9A0";
  renderBoard();
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

  const jx = (pseudo(seed, 1) - 0.5) * 34;
  const jy = (pseudo(seed, 2) - 0.5) * 40;
  const rot = (pseudo(seed, 3) - 0.5) * 8.4;

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
      posX: 150,
      posY: 130,
      rot: -2.6,
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
      posX: 560,
      posY: 250,
      rot: 1.8,
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
      posX: 960,
      posY: 160,
      rot: 3.4,
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
      posX: 1320,
      posY: 400,
      rot: -3.1,
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
      posX: 300,
      posY: 620,
      rot: -1.4,
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
    el.style.left = (note.posX || 100) + "px";
    el.style.top = (note.posY || 100) + "px";
    el.style.setProperty("--rot", (typeof note.rot === "number" ? note.rot : 0) + "deg");
    el.style.zIndex = String(10 + (i % 7));
    el.dataset.id = note.id;

    if (kind === "sticky") {
      el.style.background = `linear-gradient(180deg, rgba(255,255,255,.45), rgba(255,255,255,0) 62%), ${note.color || "#F7E9A0"}`;
    } else if (kind === "card") {
      el.style.background = note.color && note.color !== "#FBF7EC"
        ? `repeating-linear-gradient(180deg, transparent 0 27px, rgba(34,29,21,.13) 27px 28px), ${note.color}`
        : undefined;
    } else {
      el.style.background = `linear-gradient(168deg, rgba(255,255,255,.3), rgba(34,29,21,.05)), ${note.color || "#F3E7C4"}`;
    }

    /* selotip atau paku */
    const fix = document.createElement("span");
    if (kind === "card") {
      fix.className = "note-pin";
    } else {
      fix.className = "note-tape";
      fix.style.transform = `translateX(-50%) rotate(${(pseudo(seed, 7) - 0.5) * 8}deg)`;
    }
    el.appendChild(fix);

    /* stempel OSIS buat note resmi */
    if (note.authorNis === "00000") {
      const stamp = document.createElement("span");
      stamp.className = "note-stamp";
      stamp.textContent = "DARI OSIS";
      el.appendChild(stamp);
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

renderBoard();
