import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil.",
  });

  // Clear authentication cookies
  response.cookies.delete("aura_session_role");
  response.cookies.delete("aura_session_user_id");

  return response;
}
