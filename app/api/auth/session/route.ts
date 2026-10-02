import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase";

const SESSION_COOKIE_NAME = "fb-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 14; // 14 hari (detik)
const SESSION_EXPIRES_MS = SESSION_MAX_AGE * 1000;

/**
 * POST — buat session cookie dari ID token.
 * Dipanggil setelah login client-side (email/password atau Google OAuth)
 * dengan mengirim `{ idToken }` dari Firebase JS SDK.
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "idToken required" }, { status: 400 });
    }

    // Verifikasi ID token + pastikan user terdaftar di collection `users`.
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const userDoc = await getAdminDb()
      .collection("users")
      .doc(decoded.uid)
      .get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "Akun belum terdaftar. Hubungi admin OSIS untuk persetujuan." },
        { status: 403 }
      );
    }

    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_MS,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch (err) {
    console.error("[/api/auth/session POST] error:", err);
    return NextResponse.json({ error: "Gagal membuat session" }, { status: 401 });
  }
}

/**
 * GET — cek session aktif.
 * Verifikasi session cookie + lookup data user di collection `users`.
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    const decoded = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true
    );
    const userDoc = await getAdminDb()
      .collection("users")
      .doc(decoded.uid)
      .get();
    const userData = userDoc.data();

    if (
      !userData ||
      userData.status === "pending" ||
      userData.status === "rejected"
    ) {
      return NextResponse.json({ user: null, status: userData?.status || null });
    }

    return NextResponse.json({
      user: {
        id: userDoc.id,
        name: userData.name || null,
        email: userData.email || null,
        role: userData.role || "member",
        status: userData.status || "approved",
        avatar_url: userData.avatar_url || null,
      },
    });
  } catch (err) {
    console.error("[/api/auth/session GET] error:", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}