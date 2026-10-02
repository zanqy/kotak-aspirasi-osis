import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase";
import { firestoreTimestampToISO } from "@/lib/utils";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { kode: string } }
) {
  try {
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
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const doc = snap.docs[0];
    const data = doc.data();
    const aspirasi = {
      id: doc.id,
      ...data,
      created_at: firestoreTimestampToISO(data.created_at),
      updated_at: firestoreTimestampToISO(data.updated_at),
    };

    const pesanSnap = await db
      .collection("aspirasi")
      .doc(doc.id)
      .collection("pesan")
      .orderBy("created_at", "asc")
      .get();

    const pesan = pesanSnap.docs.map((p) => {
      const pd = p.data();
      return {
        id: p.id,
        ...pd,
        created_at: firestoreTimestampToISO(pd.created_at),
      };
    });

    // Jangan sertakan email_siswa di response
    const aspirasiData: Record<string, unknown> = { ...aspirasi };
    delete aspirasiData.email_siswa;

    const response = NextResponse.json(
      {
        aspirasi: aspirasiData,
        pesan: pesan || [],
      },
      { headers: CORS_HEADERS }
    );

    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
