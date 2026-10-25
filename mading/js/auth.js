const STUDENT_LIST = [
  { nis: "12345", nama: "Aulia Rahma", kelas: "XI IPA 1" },
  { nis: "12346", nama: "Bima Saputra", kelas: "XI IPA 2" },
  { nis: "12347", nama: "Citra Dewi", kelas: "XI IPS 1" },
  { nis: "12348", nama: "Dimas Pratama", kelas: "XI IPS 2" },
  { nis: "12349", nama: "Eka Putri", kelas: "X MIPA 1" }
];

const LOGIN_KEY = "mading_digital_user";

const form = document.getElementById("login-form");
const input = document.getElementById("nis-input");
const errorEl = document.getElementById("login-error");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const nis = input.value.trim();

  if (!/^[0-9]+$/.test(nis)) {
    showError("NIS harus berupa angka ya.");
    return;
  }

  const found = STUDENT_LIST.find((s) => s.nis === nis);

  if (!found) {
    showError("NIS tidak ditemukan di daftar siswa. Coba cek lagi ya.");
    return;
  }

  const user = {
    nis: found.nis,
    nama: found.nama,
    kelas: found.kelas,
    role: "siswa",
    loginAt: Date.now()
  };

  localStorage.setItem(LOGIN_KEY, JSON.stringify(user));
  window.location.href = "index.html";
});

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
}

if (localStorage.getItem(LOGIN_KEY)) {
  // Sudah login, langsung ke papan
  window.location.href = "index.html";
}
