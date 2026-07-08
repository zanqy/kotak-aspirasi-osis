import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect API dashboard routes
  if (path.startsWith("/api/dashboard/")) {
    const accessToken = request.cookies.get("sb-access-token")?.value;
    const userId = request.cookies.get("sb-user-id")?.value;

    if (!accessToken || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user status in database
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userData } = await serviceClient
      .from("users")
      .select("status, role")
      .eq("id", userId)
      .single();

    if (!userData || userData.status !== "approved") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    return NextResponse.next();
  }

  // Protect dashboard page routes
  if (path.startsWith("/dashboard") && path !== "/dashboard/login") {
    const accessToken = request.cookies.get("sb-access-token")?.value;
    const userId = request.cookies.get("sb-user-id")?.value;

    if (!accessToken || !userId) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/login";
      return NextResponse.redirect(url);
    }

    // Verify the token is valid
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user || user.id !== userId) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/login";
      return NextResponse.redirect(url);
    }

    // Check user status in database
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userData } = await serviceClient
      .from("users")
      .select("status, role")
      .eq("id", userId)
      .single();

    if (!userData || userData.status === "pending") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/login";
      url.searchParams.set("status", "pending");
      return NextResponse.redirect(url);
    }

    if (userData.status === "rejected") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/login";
      url.searchParams.set("status", "rejected");
      return NextResponse.redirect(url);
    }

    if (path.startsWith("/dashboard/anggota") && userData.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};

//asadaedca