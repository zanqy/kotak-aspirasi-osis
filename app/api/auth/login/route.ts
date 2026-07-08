import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    if (!data.session) {
      return NextResponse.json(
        { error: "Gagal mendapatkan session" },
        { status: 500 }
      );
    }

    // Set secure httpOnly cookies via Set-Cookie headers
    const response = NextResponse.json({ success: true });

    response.headers.append(
      "Set-Cookie",
      `sb-access-token=${data.session.access_token}; Path=/; Max-Age=3600; SameSite=Lax; HttpOnly${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`
    );
    response.headers.append(
      "Set-Cookie",
      `sb-refresh-token=${data.session.refresh_token}; Path=/; Max-Age=3600; SameSite=Lax; HttpOnly${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`
    );
    response.headers.append(
      "Set-Cookie",
      `sb-user-id=${data.session.user.id}; Path=/; Max-Age=3600; SameSite=Lax; HttpOnly${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`
    );

    return response;
  } catch {
    return NextResponse.json(
      { error: "Gagal terhubung ke server" },
      { status: 500 }
    );
  }
}