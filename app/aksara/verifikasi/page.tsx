import { redirect } from "next/navigation";

/**
 * Verifikasi NISN ditunda — nanti setelah data dari sekolah ada.
 * Untuk sekarang yang ditanya cuma nama.
 */
export default function VerifikasiPage() {
  redirect("/aksara/kenalan");
}
