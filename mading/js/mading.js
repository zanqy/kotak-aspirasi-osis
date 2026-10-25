const LOGIN_KEY = "mading_digital_user";
const NOTES_KEY = "mading_digital_notes";

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

let selectedColor = "#fff3b0";

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
  const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
  const posX = 200 + Math.random() * (1800 - 200);
  const posY = 200 + Math.random() * (900 - 200);

  notes.push({
    id,
    authorNis: currentUser.nis,
    authorName: currentUser.nama,
    authorKelas: currentUser.kelas,
    text,
    color: selectedColor,
    posX: Math.round(posX),
    posY: Math.round(posY),
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
  selectedColor = "#fff3b0";
  renderNotes();
});

function closeNoteModal() {
  noteModal.hidden = true;
}

function closeRulesModal() {
  rulesModal.hidden = true;
}

function loadNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : getSeedNotes();
  } catch (err) {
    return getSeedNotes();
  }
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
      text: "Selamat datang di Mading Digital OSIS!\nTempel apresiasi, kata semangat, atau ide positif ya!",
      color: "#fff3b0",
      posX: 400,
      posY: 300,
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
      text: "Jaga mading ini tetap ramah buat semua warga sekolah 💚",
      color: "#d8f3dc",
      posX: 900,
      posY: 500,
      status: "approved",
      reports: [],
      reportCount: 0,
      createdAt: Date.now() - 800000
    }
  ];
  saveNotes(seed);
  return seed;
}

function renderNotes() {
  canvas.innerHTML = "";
  const notes = loadNotes().filter((n) => n.status !== "hidden");
  notes.forEach((note) => {
    const el = document.createElement("article");
    el.className = "sticky-note";
    el.style.left = note.posX + "px";
    el.style.top = note.posY + "px";
    el.style.background = note.color;
    el.dataset.id = note.id;

    const header = document.createElement("div");
    header.className = "sticky-note-header";
    const meta = document.createElement("span");
    meta.textContent = `${note.authorKelas} • ${note.authorName}`;
    header.appendChild(meta);

    const text = document.createElement("div");
    text.className = "sticky-note-text";
    text.textContent = note.text;

    const footer = document.createElement("div");
    footer.className = "sticky-note-footer";
    const report = document.createElement("button");
    report.className = "report-btn";
    report.innerHTML = '<i class="ti ti-flag"></i> Laporkan';
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

    el.appendChild(header);
    el.appendChild(text);
    el.appendChild(footer);
    canvas.appendChild(el);
  });
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
  renderNotes();
}

renderNotes();
