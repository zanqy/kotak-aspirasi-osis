import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: { kode: string } }
) {
  try {
    const supabase = createServiceClient();
    const kode = params.kode.toUpperCase();

    const { data: aspirasi, error } = await supabase
      .from("aspirasi")
      .select("*")
      .eq("kode_tiket", kode)
      .single();

    if (error || !aspirasi) {
      return NextResponse.json(
        { error: "Kode tiket tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get pesan
    const { data: pesan } = await supabase
      .from("pesan")
      .select("*")
      .eq("aspirasi_id", aspirasi.id)
      .order("created_at", { ascending: true });

    // Jangan sertakan email_siswa di response
    const aspirasiData = { ...aspirasi };
    delete aspirasiData.email_siswa;

    const response = NextResponse.json({
      aspirasi: aspirasiData,
      pesan: pesan || [],
    });

    // Prevent caching so data is always fresh
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}