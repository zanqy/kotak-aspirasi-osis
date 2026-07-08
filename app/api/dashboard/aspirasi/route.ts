import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyAuthDashboard } from "@/lib/auth-api";

export async function GET(request: NextRequest) {
  // Verify authentication
  const auth = await verifyAuthDashboard(request);
  if (auth.error) return auth.error;

  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = supabase
      .from("aspirasi")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(
        `kode_tiket.ilike.%${search}%,isi.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Gagal mengambil data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [], total: count || 0 });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}