import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase";
import { verifyAuthDashboard } from "@/lib/auth-api";
import { firestoreTimestampToISO } from "@/lib/utils";
import type { Query } from "firebase-admin/firestore";

interface AspirasiRow {
  id: string;
  kode_tiket: string;
  isi: string;
  kategori: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  // Verify authentication
  const auth = await verifyAuthDashboard(request);
  if (auth.error) return auth.error;

  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query: Query = db
      .collection("aspirasi")
      .orderBy("created_at", "desc");

    if (status) {
      query = query.where("status", "==", status);
    }

    const snap = await query.get();
    let data: AspirasiRow[] = snap.docs.map((d) => {
      const raw = d.data();
      return {
        id: d.id,
        kode_tiket: raw.kode_tiket,
        isi: raw.isi,
        kategori: raw.kategori ?? null,
        status: raw.status,
        created_at: firestoreTimestampToISO(raw.created_at),
        updated_at: firestoreTimestampToISO(raw.updated_at),
      };
    });

    // Firestore tidak punya substring search (ilike) — filter in-memory.
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (a) =>
          a.kode_tiket.toLowerCase().includes(q) ||
          a.isi.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ data: data || [], total: data.length });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}