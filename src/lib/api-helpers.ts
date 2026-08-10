import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    return { userId: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { userId: session.user.id, error: null };
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
