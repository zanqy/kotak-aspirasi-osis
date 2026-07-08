import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyAuthDashboard } from "@/lib/auth-api";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify authentication - only admin can access
  const auth = await verifyAuthDashboard(request, ["admin"]);
  if (auth.error) return auth.error;

  try {
    const supabase = createServiceClient();
    const body = await request.json();
    const { status } = body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Gagal update anggota" },
        { status: 500 }
      );
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify authentication - only admin can access
  const auth = await verifyAuthDashboard(request, ["admin"]);
  if (auth.error) return auth.error;

  try {
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json(
        { error: "Gagal menghapus anggota" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}