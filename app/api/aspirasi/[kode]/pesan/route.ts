import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: { kode: string } }
) {
  try {
    const body = await request.json();
    const { isi } = body;

    if (!isi || isi.trim() === "") {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const kode = params.kode.toUpperCase();

    const { data: aspirasi, error: aspirasiError } = await supabase
      .from("aspirasi")
      .select("id")
      .eq("kode_tiket", kode)
      .single();

    if (aspirasiError || !aspirasi) {
      return NextResponse.json(
        { error: "Kode tiket tidak ditemukan" },
        { status: 404 }
      );
    }

    const { data: pesan, error } = await supabase
      .from("pesan")
      .insert({
        aspirasi_id: aspirasi.id,
        isi: isi.trim(),
        pengirim: "siswa",
        user_id: null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Gagal mengirim pesan" },
        { status: 500 }
      );
    }

    return NextResponse.json(pesan);
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}