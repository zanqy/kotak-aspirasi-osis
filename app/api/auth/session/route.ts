import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("sb-access-token")?.value;
    const userId = request.cookies.get("sb-user-id")?.value;

    if (!accessToken || !userId) {
      return NextResponse.json({ user: null });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user || user.id !== userId) {
      return NextResponse.json({ user: null });
    }

    // Get user data from users table
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userData } = await serviceClient
      .from("users")
      .select("id, name, email, role, status, avatar_url")
      .eq("id", userId)
      .single();

    if (!userData || userData.status === "pending" || userData.status === "rejected") {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: userData });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}