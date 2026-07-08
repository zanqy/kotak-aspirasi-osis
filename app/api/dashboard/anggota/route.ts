import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyAuthDashboard } from "@/lib/auth-api";

export async function GET(request: Request) {
  // Verify authentication - only admin can access
  const auth = await verifyAuthDashboard(request, ["admin"]);
  if (auth.error) return auth.error;

  try {
    const supabase = createServiceClient();

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Gagal mengambil data anggota" },
        { status: 500 }
      );
    }

    return NextResponse.json(users || []);
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}