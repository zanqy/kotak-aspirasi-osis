import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/dashboard/login?error=no_code", request.url)
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(
      new URL("/dashboard/login?error=auth_failed", request.url)
    );
  }

  // Set cookies via Set-Cookie headers
  const redirectUrl = new URL("/dashboard", request.url);
  const response = NextResponse.redirect(redirectUrl);

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
}