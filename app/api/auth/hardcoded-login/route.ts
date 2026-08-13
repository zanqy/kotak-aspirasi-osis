import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  response.headers.append(
    "Set-Cookie",
    `sb-hardcoded-admin=true; Path=/; Max-Age=86400; SameSite=Lax${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`
  );
  
  return response;
}
