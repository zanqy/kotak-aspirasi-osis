import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase";
import { verifyAuthDashboard } from "@/lib/auth-api";
import { firestoreTimestampToISO } from "@/lib/utils";

interface AspirasiDetail {
  id: string;
  kode_tiket: string;
  isi: string;
  kategori: string | null;
  status: string;
  diteruskan_ke: string | null;
  ditangani_oleh: string | null;
  created_at: string;
  updated_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify authentication
  const auth = await verifyAuthDashboard(_request);
  if (auth.error) return auth.error;

  try {
    const db = getAdminDb();
    const aspirasiDoc = await db.collection("aspirasi").doc(params.id).get();

    if (!aspirasiDoc.exists) {
      return NextResponse.json(
        { error: "Aspirasi tidak ditemukan" },
        { status: 404 }
      );
    }

    const raw = aspirasiDoc.data()!;
    const aspirasi: AspirasiDetail = {
      id: aspirasiDoc.id,
      kode_tiket: raw.kode_tiket,
      isi: raw.isi,
      kategori: raw.kategori ?? null,
      status: raw.status,
      diteruskan_ke: raw.diteruskan_ke ?? null,
      ditangani_oleh: raw.ditangani_oleh ?? null,
      created_at: firestoreTimestampToISO(raw.created_at),
      updated_at: firestoreTimestampToISO(raw.updated_at),
    };

    // Get pesan + user name
    const pesanSnap = await db
      .collection("aspirasi")
      .doc(params.id)
      .collection("pesan")
      .orderBy("created_at", "asc")
      .get();

    const pesanWithName = await Promise.all(
      pesanSnap.docs.map(async (p) => {
        const pd = p.data();
        let user_name: string | null = null;
        if (pd.user_id) {
          const userDoc = await db.collection("users").doc(pd.user_id).get();
          user_name = userDoc.data()?.name || null;
        }
        return {
          id: p.id,
          aspirasi_id: pd.aspirasi_id,
          isi: pd.isi,
          pengirim: pd.pengirim,
          user_id: pd.user_id || null,
          created_at: firestoreTimestampToISO(pd.created_at),
          user_name,
        };
      })
    );

    // Get user name untuk ditangani_oleh
    let penanganNama = null;
    if (aspirasi.ditangani_oleh) {
      const userDoc = await db
        .collection("users")
        .doc(aspirasi.ditangani_oleh)
        .get();
      penanganNama = userDoc.data()?.name || null;
    }

    return NextResponse.json({
      aspirasi: { ...aspirasi, penangan_nama: penanganNama },
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
    const db = getAdminDb();
    const body = await request.json();
    const { status, kategori, diteruskan_ke, ditangani_oleh } = body;

    const updateData: Record<string, unknown> = { updated_at: new Date() };
    if (status) updateData.status = status;
    if (kategori !== undefined) updateData.kategori = kategori;
    if (diteruskan_ke !== undefined) updateData.diteruskan_ke = diteruskan_ke;
    if (ditangani_oleh !== undefined) updateData.ditangani_oleh = ditangani_oleh;

    await db.collection("aspirasi").doc(params.id).update(updateData);

    const updated = await db.collection("aspirasi").doc(params.id).get();
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