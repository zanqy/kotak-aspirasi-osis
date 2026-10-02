import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase";
import { generateUniqueKodeTiket } from "@/lib/utils";
import { kirimEmail } from "@/lib/resend";
import { env } from "@/lib/env";
import { getCorsHeaders, handleCorsOptions } from "@/lib/cors";

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

export async function POST(request: NextRequest) {
  const cors = getCorsHeaders(request);
  try {
    const body = await request.json();
    const { isi, kategori, email_siswa } = body;

    if (!isi || isi.trim() === "") {
      return NextResponse.json(
        { error: "Isi aspirasi tidak boleh kosong" },
        { status: 400, headers: cors }
      );
    }

    // Validasi format email (opsional, tapi kalau diisi harus valid).
    if (
      email_siswa &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email_siswa).trim())
    ) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400, headers: cors }
      );
    }

    const db = getAdminDb();
    const aspirasiRef = db.collection("aspirasi");

    // Generate kode tiket + retry kalau duplicate (race condition aman).
    const kode_tiket = await generateUniqueKodeTiket(async (kode) => {
      const snap = await aspirasiRef
        .where("kode_tiket", "==", kode)
        .limit(1)
        .get();
      return !snap.empty;
    });

    let status_email: "terkirim" | "gagal" | "tidak_ada" = "tidak_ada";

    const docRef = await aspirasiRef.add({
      kode_tiket,
      isi: String(isi).trim(),
      kategori: kategori || null,
      email_siswa: email_siswa || null,
      status_email: "tidak_ada",
      status: "menunggu",
      diteruskan_ke: null,
      ditangani_oleh: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (email_siswa && String(email_siswa).trim() !== "") {
      const appUrl = env.NEXT_PUBLIC_APP_URL;
      const safeKode = String(kode_tiket).replace(/[^\w-]/g, "");
      const html = [
        '<div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">',
        '<div style="text-align: center; padding: 32px 16px; background: #49769f; border-radius: 20px 20px 0 0;">',
        '<p style="color: #7bbde8; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0;">OSIS · Humas</p>',
        '<h1 style="color: white; font-size: 20px; font-weight: 500; margin: 8px 0 0;">Aspirasi Terkirim</h1>',
        "</div>",
        '<div style="text-align: center; padding: 32px 16px; background: #f4f9fc; border-radius: 0 0 20px 20px; border: 1px solid #c8dde8; border-top: none;">',
        '<p style="color: #6ea2b3; font-size: 13px; margin: 0 0 16px;">Kode tiket aspirasimu:</p>',
        `<div style="font-size: 28px; font-weight: 500; color: #49769f; letter-spacing: 4px; margin: 0 0 16px; font-family: monospace;">${safeKode}</div>`,
        '<p style="color: #6ea2b3; font-size: 12px; margin: 0 0 20px;">Simpan kode ini untuk memantau status aspirasimu</p>',
        `<a href="${appUrl}/cek-aspirasi?kode=${safeKode}" style="display: inline-block; background: #7bbde8; color: white; text-decoration: none; padding: 12px 24px; border-radius: 14px; font-size: 14px; font-weight: 500;">Cek Status Aspirasi &rarr;</a>`,
        "</div>",
        "</div>",
      ].join("");

      const berhasil = await kirimEmail(
        String(email_siswa).trim(),
        `Kode Tiket Aspirasi OSIS - ${safeKode}`,
        html
      );

      status_email = berhasil ? "terkirim" : "gagal";

      await aspirasiRef.doc(docRef.id).update({ status_email });
    }

    return NextResponse.json(
      { kode_tiket, status: "menunggu", status_email },
      { headers: cors }
    );
  } catch (err) {
    console.error("[POST /api/aspirasi] error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500, headers: cors }
    );
  }
}
