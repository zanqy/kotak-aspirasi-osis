/**
 * Konversi Firestore Timestamp (server & client SDK) ke ISO string.
 * Dipakai supaya response API & payload realtime konsisten dengan
 * format `created_at` / `updated_at` yang lama (ISO 8601).
 */
export function firestoreTimestampToISO(value: unknown): string {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return String(value);
}

/**
 * Generate kode tiket unik berbasis timestamp + random suffix.
 *
 * Resiko tabrakan: timestamp 36^4 = 1.679.616 slot per detik,
 * random 36^2 = 1.296 slot → ~2.1M kombinasi/detik. Untuk traffic
 * sekolah cukup aman, tapi tetap ada peluang duplicate. Pakai
 * `generateUniqueKodeTiket` di API route supaya retry otomatis.
 */
const MAX_RETRY = 5;

export function generateKodeTiketUnik(): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.floor(Math.random() * 1296) // 36^2
    .toString(36)
    .toUpperCase()
    .padStart(2, "0");
  return `ASP-${ts}${rand}`;
}

/**
 * Generate kode tiket + retry kalau ternyata duplicate di DB.
 * `existsCheck` = async (kode) => boolean. True kalau kode sudah dipakai.
 */
export async function generateUniqueKodeTiket(
  existsCheck: (kode: string) => Promise<boolean>
): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
    const kode = generateKodeTiketUnik();
    const exists = await existsCheck(kode);
    if (!exists) return kode;
  }
  // Fallback: append attempt counter supaya tetap unik walau probabilitas
  // collision 5x berturut-turut sangat kecil (≈ 1/(2.1M)^5).
  return `ASP-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .toUpperCase()
    .slice(2, 6)}`;
}

export function formatWaktu(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;

  return then.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getInisial(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

/**
 * Cek mode animasi dari sessionStorage.
 * Return 'full' untuk first visit, 'quick' untuk navigasi.
 */
export function getAnimationMode(): "full" | "quick" {
  if (typeof window === "undefined") return "full";
  const visited = sessionStorage.getItem("hasVisited");
  return visited === "true" ? "quick" : "full";
}
