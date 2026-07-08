import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

interface AuthResult {
  user: {
    id: string;
    email: string | undefined;
  } | null;
  error: NextResponse | null;
}

export async function verifyAuth(request: Request): Promise<AuthResult> {
  // Try to get token from Authorization header first, then cookies
  const authHeader = request.headers.get("authorization");
  let accessToken: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    accessToken = authHeader.replace("Bearer ", "");
  }

  // If no auth header, try to parse from cookie header manually
  // (since NextRequest cookies API isn't available for plain Request)
  if (!accessToken) {
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
      accessToken = cookies["sb-access-token"] || null;
    }
  }

  if (!accessToken) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };
  }

  return { error: null, user: { id: user.id, email: user.email } };
}

export async function verifyAuthDashboard(
  request: Request,
  allowedRoles?: ("admin" | "member")[]
): Promise<AuthResult & { role?: string; status?: string }> {
  const result = await verifyAuth(request);
  if (result.error) return result;

  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: userData } = await serviceClient
    .from("users")
    .select("role, status")
    .eq("id", result.user!.id)
    .single();

  if (!userData) {
    return { error: NextResponse.json({ error: "User not found" }, { status: 401 }), user: null };
  }

  if (userData.status === "pending" || userData.status === "rejected") {
    return { error: NextResponse.json({ error: "Akses ditolak" }, { status: 403 }), user: null };
  }

  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null };
  }

  return { ...result, role: userData.role, status: userData.status };
}