import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback`,
      },
    });

    if (error || !data.url) {
      return NextResponse.json(
        { error: "Gagal login dengan Google" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.url });
  } catch {
    return NextResponse.json(
      { error: "Gagal terhubung ke server" },
      { status: 500 }
    );
  }
}