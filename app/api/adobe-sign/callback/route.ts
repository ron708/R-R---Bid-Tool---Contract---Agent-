import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/adobe-sign";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  try {
    await exchangeCodeForToken(code);
    return NextResponse.redirect(new URL("/admin/branding?adobeSign=connected", req.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/admin/branding?adobeSign=error&msg=${encodeURIComponent(err.message)}`, req.url));
  }
}
