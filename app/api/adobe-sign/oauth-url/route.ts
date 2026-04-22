import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildOAuthUrl } from "@/lib/adobe-sign";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "SOLARPONICS_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ url: buildOAuthUrl() });
}
