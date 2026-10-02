import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase";

interface AuthResult {
  user: {
    id: string;
    email: string | undefined;
  } | null;
  error: NextResponse | null;
}

/**
 * Verifikasi autentikasi dari request.
 * Sumber session: Authorization header (Bearer) atau cookie `fb-session`.
 * Mengembalikan user ID & email atau error response.
 */
export async function verifyAuth(request: Request): Promise<AuthResult> {
  // Coba ambil session cookie dari Authorization header dulu, lalu cookie biasa
  const authHeader = request.headers.get("authorization");
  let sessionCookie: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    sessionCookie = authHeader.replace("Bearer ", "");
  }

  // Kalau tidak ada auth header, parse dari cookie header manual
  if (!sessionCookie) {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce(
        (acc, cookie) => {
          const [key, val] = cookie.trim().split("=");
          if (key && val) acc[key.trim()] = val.trim();
          return acc;
        },
        {} as Record<string, string>
      );
      sessionCookie = cookies["fb-session"] || null;
    }
  }

  if (!sessionCookie) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    };
  }

  try {
    const decoded = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true
    );
    return { error: null, user: { id: decoded.uid, email: decoded.email } };
  } catch {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    };
  }
}

/**
 * Verifikasi auth + cek status & role user di collection `users`.
 * Optional filter role (`'admin'` / `'member'`).
 */
export async function verifyAuthDashboard(
  request: Request,
  allowedRoles?: ("admin" | "member")[]
): Promise<AuthResult & { role?: string; status?: string }> {
  const result = await verifyAuth(request);
  if (result.error) return result;

  const userDoc = await getAdminDb()
    .collection("users")
    .doc(result.user!.id)
    .get();
  const userData = userDoc.data();

  if (!userData) {
    return {
      error: NextResponse.json({ error: "User not found" }, { status: 401 }),
      user: null,
    };
  }

  if (userData.status === "pending" || userData.status === "rejected") {
    return {
      error: NextResponse.json({ error: "Akses ditolak" }, { status: 403 }),
      user: null,
    };
  }

  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      user: null,
    };
  }

  return { ...result, role: userData.role, status: userData.status };
}