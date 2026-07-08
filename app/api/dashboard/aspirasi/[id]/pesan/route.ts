import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { kirimEmail } from "@/lib/resend";
import { verifyAuthDashboard } from "@/lib/auth-api";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify authentication
  const auth = await verifyAuthDashboard(request);
  if (auth.error) return auth.error;

  try {
    const supabase = createServiceClient();
    const body = await request.json();
    const { isi } = body;

    if (!isi || isi.trim() === "") {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    const userId = auth.user!.id;

    // Insert pesan
    const { data: pesan, error } = await supabase
      .from("pesan")
      .insert({
        aspirasi_id: params.id,
        isi: isi.trim(),
        pengirim: "humas",
        user_id: userId,
      })
      .select("*, users(name)")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Gagal mengirim pesan" },
        { status: 500 }
      );
    }

    // Update status aspirasi ke dibalas jika belum
    const { data: aspirasi } = await supabase
      .from("aspirasi")
      .select("status, email_siswa, status_email, kode_tiket")
      .eq("id", params.id)
      .single();

    if (aspirasi && (aspirasi.status === "menunggu" || aspirasi.status === "diproses")) {
      await supabase
        .from("aspirasi")
        .update({ status: "dibalas", updated_at: new Date().toISOString() })
        .eq("id", params.id);
    }

    // Kirim email notifikasi ke siswa jika email ada
    if (aspirasi?.email_siswa && aspirasi.status_email === "terkirim") {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const html = `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; padding: 32px 16px; background: #49769f; border-radius: 20px 20px 0 0;">
            <h1 style="color: white; font-size: 20px; font-weight: 500; margin: 0;">Balasan Baru</h1>
          </div>
          <div style="text-align: center; padding: 32px 16px; background: #f4f9fc; border-radius: 0 0 20px 20px; border: 1px solid #c8dde8; border-top: none;">
            <p style="color: #6ea2b3; font-size: 13px; margin: 0 0 16px;">Humas OSIS telah membalas aspirasimu dengan kode tiket:</p>
            <div style="font-size: 28px; font-weight: 500; color: #49769f; letter-spacing: 4px; margin: 0 0 20px; font-family: monospace;">${aspirasi.kode_tiket}</div>
            <a href="${appUrl}/cek-aspirasi?kode=${aspirasi.kode_tiket}" style="display: inline-block; background: #7bbde8; color: white; text-decoration: none; padding: 12px 24px; border-radius: 14px; font-size: 14px; font-weight: 500;">Lihat Balasan →</a>
          </div>
        </div>
      `;

      const berhasil = await kirimEmail(
        aspirasi.email_siswa,
        `Balasan Baru — Aspirasi ${aspirasi.kode_tiket}`,
        html
      );

      await supabase.from("notifikasi").insert({
        aspirasi_id: params.id,
        tipe: "balasan",
        tujuan: aspirasi.email_siswa,
        status_kirim: berhasil ? "sukses" : "gagal",
      });
    }

    // Insert aktivitas
    await supabase.from("aktivitas").insert({
      user_id: userId,
      aksi: "Mengirim balasan",
      aspirasi_id: params.id,
      keterangan: isi.trim().substring(0, 200),
    });

    const pesanData = pesan as {
      id: string;
      aspirasi_id: string;
      isi: string;
      pengirim: string;
      user_id: string | null;
      created_at: string;
      users: { name: string } | null;
    };

    const result = {
      id: pesanData.id,
      aspirasi_id: pesanData.aspirasi_id,
      isi: pesanData.isi,
      pengirim: pesanData.pengirim,
      user_id: pesanData.user_id,
      created_at: pesanData.created_at,
      user_name: pesanData.users?.name || null,
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}