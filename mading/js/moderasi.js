const LOGIN_KEY = "mading_digital_user";
const NOTES_KEY = "mading_digital_notes";

const tabs = document.querySelectorAll(".tab-btn");
const list = document.getElementById("moderasi-list");
const emptyState = document.getElementById("empty-state");
const countReported = document.getElementById("count-reported");
const countAll = document.getElementById("count-all");
const countHidden = document.getElementById("count-hidden");
const template = document.getElementById("mod-item-template");

let activeTab = "reported";

tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeTab = btn.dataset.tab;
    render();
  });
});

function loadNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function render() {
  const notes = loadNotes();
  countAll.textContent = notes.length;
  countHidden.textContent = notes.filter((n) => n.status === "hidden").length;
  countReported.textContent = notes.filter((n) => n.status !== "hidden" && n.reportCount >= 1).length;

  let filtered = [];
  if (activeTab === "reported") {
    filtered = notes.filter((n) => n.status !== "hidden" && n.reportCount >= 1);
  } else if (activeTab === "hidden") {
    filtered = notes.filter((n) => n.status === "hidden");
  } else {
    filtered = notes;
  }

  list.innerHTML = "";
  if (filtered.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  filtered
    .slice()
    .sort((a, b) => (b.reportCount || 0) - (a.reportCount || 0) || b.createdAt - a.createdAt)
    .forEach((note) => {
      const node = template.content.cloneNode(true);
      const item = node.querySelector(".mod-item");
      const statusBadge = node.querySelector('[data-role="status"]');
      const author = node.querySelector('[data-role="author"]');
      const time = node.querySelector('[data-role="time"]');
      const reportCountEl = node.querySelector('[data-role="report-count"]');
      const preview = node.querySelector('[data-role="preview"]');
      const reasonsWrap = node.querySelector('[data-role="reasons-wrap"]');
      const reasons = node.querySelector('[data-role="reasons"]');

      statusBadge.dataset.state = note.status === "hidden" ? "hidden" : note.reportCount >= 1 ? "reported" : "approved";
      statusBadge.textContent = note.status === "hidden" ? "Disembunyikan" : note.reportCount >= 1 ? "Perlu Ditinjau" : "Tampil";

      author.textContent = `${note.authorName} (${note.authorKelas}) • NIS ${note.authorNis}`;
      time.textContent = formatDate(note.createdAt);
      reportCountEl.textContent = note.reportCount || 0;
      preview.textContent = note.text;
      preview.style.background = note.color;

      if (note.reports && note.reports.length > 0) {
        reasonsWrap.hidden = false;
        reasons.innerHTML = "";
        note.reports.slice().reverse().forEach((r) => {
          const li = document.createElement("li");
          li.textContent = `"${r.reason}" - dilaporkan NIS ${r.reporterNis} (${formatDate(r.createdAt)})`;
          reasons.appendChild(li);
        });
      }

      node.querySelector('[data-action="view"]').addEventListener("click", () => {
        window.open("index.html", "_blank");
      });
      node.querySelector('[data-action="approve"]').addEventListener("click", () => {
        updateStatus(note.id, "approved");
      });
      node.querySelector('[data-action="hide"]').addEventListener("click", () => {
        updateStatus(note.id, "hidden");
      });
      node.querySelector('[data-action="delete"]').addEventListener("click", () => {
        deleteNote(note.id);
      });

      list.appendChild(item);
    });
}

function updateStatus(noteId, status) {
  const notes = loadNotes();
  const idx = notes.findIndex((n) => n.id === noteId);
  if (idx === -1) return;
  notes[idx].status = status;
  saveNotes(notes);
  render();
}

function deleteNote(noteId) {
  if (!confirm("Yakin mau hapus postingan ini secara permanen? Tindakan ini nggak bisa dibatalkan.")) return;
  const notes = loadNotes().filter((n) => n.id !== noteId);
  saveNotes(notes);
  render();
}

render();
