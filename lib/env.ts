/**
 * Validated environment variables.
 * Panggil `env.X` (bukan `process.env.X` langsung) supaya typo/kosong-nya ketauan
 * saat startup, bukan saat request pertama user kena 500 di tengah jalan.
 */

function required(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Pastikan sudah di-set di .env.local atau platform deployment.`
    );
  }
  return value;
}

function optional(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value.trim() !== "" ? value : fallback;
}

export const env = {
  // Public (client + server)
  NEXT_PUBLIC_FIREBASE_API_KEY: required("NEXT_PUBLIC_FIREBASE_API_KEY"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: required("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  NEXT_PUBLIC_APP_URL: optional(
    "NEXT_PUBLIC_APP_URL",
    "http://localhost:3000"
  ),

  // Server-only (jangan pernah dipake di client component!)
  FIREBASE_PROJECT_ID: required("FIREBASE_PROJECT_ID"),
  FIREBASE_CLIENT_EMAIL: required("FIREBASE_CLIENT_EMAIL"),
  FIREBASE_PRIVATE_KEY: required("FIREBASE_PRIVATE_KEY"),
  RESEND_API_KEY: required("RESEND_API_KEY"),
  RESEND_FROM_EMAIL: required("RESEND_FROM_EMAIL"),

  // Computed
  get isSCOLE() {
    return process.env.NODE_ENV === "production";
  },

  /**
   * Whitelist origin yang boleh hit API publik /api/aspirasi.
   * Dipisah koma di env kalau butuh lebih dari satu (mis. staging + prod).
   */
  get allowedOrigins(): string[] {
    const raw = optional("ALLOWED_ORIGINS", "");
    const defaults = [this.NEXT_PUBLIC_APP_URL];
    if (!raw) return defaults;
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  },
} as const;