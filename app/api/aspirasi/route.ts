import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { generateKodeTiketUnik } from "@/lib/utils";
import { kirimEmail } from "@/lib/resend";

// CORS headers — allow static HTML landing to fetch this API from same domain
// or different origin (jaga-jaga kalau static dipisah host ke Cloudflare Pages dll)
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { isi, kategori, email_siswa } = body;

    if (!isi || isi.trim() === "") {
      return NextResponse.json(
        { error: "Isi aspirasi tidak boleh kosong" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const supabase = createServiceClient();

    const kode_tiket = generateKodeTiketUnik();

    let status_email: "terkirim" | "gagal" | "tidak_ada" = "tidak_ada";

    const { data: aspirasi, error: insertError } = await supabase
      .from("aspirasi")
      .insert({
        kode_tiket,
        isi: isi.trim(),
        kategori: kategori || null,
        email_siswa: email_siswa || null,
        status_email: "tidak_ada",
        status: "menunggu",
      })
      .select()
      .single();

    if (insertError) {
      console.error("[DEBUG] insertError:", JSON.stringify(insertError, null, 2));
      return NextResponse.json(
        { error: "Gagal menyimpan aspirasi" },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    if (email_siswa && email_siswa.trim() !== "") {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const html = `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; padding: 32px 16px; background: #49769f; border-radius: 20px 20px 0 0;">
            <p style="color: #7bbde8; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0;">OSIS · Humas</p>
            <h1 style="color: white; font-size: 20px; font-weight: 500; margin: 8px 0 0;">Aspirasi Terkirim</h1>
          </div>
          <div style="text-align: center; padding: 32px 16px; background: #f4f9fc; border-radius: 0 0 20px 20px; border: 1px solid #c8dde8; border-top: none;">
            <p style="color: #6ea2b3; font-size: 13px; margin: 0 0 16px;">Kode tiket aspirasimu:</p>
            <div style="font-size: 28px; font-weight: 500; color: #49769f; letter-spacing: 4px; margin: 0 0 16px; font-family: monospace;">${kode_tiket}</div>
            <p style="color: #6ea2b3; font-size: 12px; margin: 0 0 20px;">Simpan kode ini untuk memantau status aspirasimu</p>
            <a href="${appUrl}/cek-aspirasi?kode=${kode_tiket}" style="display: inline-block; background: #7bbde8; color: white; text-decoration: none; padding: 12px 24px; border-radius: 14px; font-size: 14px; font-weight: 500;">Cek Status Aspirasi →</a>
          </div>
        </div>
      `;

      const berhasil = await kirimEmail(
        email_siswa.trim(),
        `Kode Tiket Aspirasi OSIS — ${kode_tiket}`,
        html
      );

      status_email = berhasil ? "terkirim" : "gagal";

      await supabase
        .from("aspirasi")
        .update({ status_email })
        .eq("id", aspirasi.id);
    }

    return NextResponse.json(
      { kode_tiket, status: aspirasi.status, status_email },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
