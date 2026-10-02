import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase";
import { verifyAuthDashboard } from "@/lib/auth-api";
import { firestoreTimestampToISO } from "@/lib/utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify authentication - only admin can access
  const auth = await verifyAuthDashboard(request, ["admin"]);
  if (auth.error) return auth.error;

  try {
    const db = getAdminDb();
    const body = await request.json();
    const { status } = body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    await db.collection("users").doc(params.id).update({
      status,
      updated_at: new Date(),
    });

    const updated = await db.collection("users").doc(params.id).get();
    const ud = updated.data()!;
    return NextResponse.json({
      id: updated.id,
      ...ud,
      created_at: firestoreTimestampToISO(ud.created_at),
      updated_at: firestoreTimestampToISO(ud.updated_at),
    });
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
    const db = getAdminDb();

    await db.collection("users").doc(params.id).delete();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}