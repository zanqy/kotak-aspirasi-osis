import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase";
import { verifyAuthDashboard } from "@/lib/auth-api";
import { firestoreTimestampToISO } from "@/lib/utils";

export async function GET(request: Request) {
  // Verify authentication - only admin can access
  const auth = await verifyAuthDashboard(request, ["admin"]);
  if (auth.error) return auth.error;

  try {
    const db = getAdminDb();

    const snap = await db
      .collection("users")
      .orderBy("created_at", "desc")
      .get();

    const users = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        created_at: firestoreTimestampToISO(data.created_at),
        updated_at: firestoreTimestampToISO(data.updated_at),
      };
    });

    return NextResponse.json(users || []);
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}