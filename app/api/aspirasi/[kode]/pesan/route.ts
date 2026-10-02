import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase";
import { firestoreTimestampToISO } from "@/lib/utils";

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

    const db = getAdminDb();
    const kode = params.kode.toUpperCase();

    const snap = await db
      .collection("aspirasi")
      .where("kode_tiket", "==", kode)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json(
        { error: "Kode tiket tidak ditemukan" },
        { status: 404 }
      );
    }

    const aspirasiId = snap.docs[0].id;

    const pesanRef = await db
      .collection("aspirasi")
      .doc(aspirasiId)
      .collection("pesan")
      .add({
        aspirasi_id: aspirasiId,
        isi: isi.trim(),
        pengirim: "siswa",
        user_id: null,
        created_at: new Date(),
      });

    const pesanData = (await pesanRef.get()).data()!;

    return NextResponse.json({
      id: pesanRef.id,
      ...pesanData,
      created_at: firestoreTimestampToISO(pesanData.created_at),
    });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}