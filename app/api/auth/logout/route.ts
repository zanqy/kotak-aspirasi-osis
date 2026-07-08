import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear cookies by setting them to empty with max-age=0
  response.headers.append(
    "Set-Cookie",
    `sb-access-token=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly`
  );
  response.headers.append(
    "Set-Cookie",
    `sb-refresh-token=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly`
  );
  response.headers.append(
    "Set-Cookie",
    `sb-user-id=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly`
  );

  return response;
}