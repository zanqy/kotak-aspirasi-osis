import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyAuthDashboard } from "@/lib/auth-api";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify authentication
  const auth = await verifyAuthDashboard(_request);
  if (auth.error) return auth.error;

  try {
    const supabase = createServiceClient();

    const { data: aspirasi, error } = await supabase
      .from("aspirasi")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !aspirasi) {
      return NextResponse.json(
        { error: "Aspirasi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get pesan with user name
    const { data: pesan } = await supabase
      .from("pesan")
      .select("*, users(name)")
      .eq("aspirasi_id", aspirasi.id)
      .order("created_at", { ascending: true });

    const pesanWithName = (pesan || []).map(
      (p: { id: string; aspirasi_id: string; isi: string; pengirim: string; user_id: string | null; created_at: string; users: { name: string } | null }) => ({
      id: p.id,
      aspirasi_id: p.aspirasi_id,
      isi: p.isi,
      pengirim: p.pengirim,
      user_id: p.user_id,
      created_at: p.created_at,
      user_name: p.users?.name || null,
    }));

    // Get user name for ditangani_oleh
    let penanganNama = null;
    if (aspirasi.ditangani_oleh) {
      const { data: userData } = await supabase
        .from("users")
        .select("name")
        .eq("id", aspirasi.ditangani_oleh)
        .single();
      penanganNama = userData?.name || null;
    }

    // Jangan kirim email_siswa
    const aspirasiData = { ...aspirasi };
    delete aspirasiData.email_siswa;

    return NextResponse.json({
      aspirasi: { ...aspirasiData, penangan_nama: penanganNama },
      pesan: pesanWithName,
    });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify authentication
  const auth = await verifyAuthDashboard(request);
  if (auth.error) return auth.error;

  try {
    const supabase = createServiceClient();
    const body = await request.json();
    const { status, kategori, diteruskan_ke, ditangani_oleh } = body;

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (kategori !== undefined) updateData.kategori = kategori;
    if (diteruskan_ke !== undefined) updateData.diteruskan_ke = diteruskan_ke;
    if (ditangani_oleh !== undefined) updateData.ditangani_oleh = ditangani_oleh;

    const { data: aspirasi, error } = await supabase
      .from("aspirasi")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Gagal update aspirasi" },
        { status: 500 }
      );
    }

    return NextResponse.json(aspirasi);
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}