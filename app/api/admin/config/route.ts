import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "SOLARPONICS_ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const config = await prisma.solarponicsConfig.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(config ?? {});
}

export async function PATCH(req: NextRequest) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const allowed = ["companyName", "licenseNumber", "address", "city", "state", "zip", "phone", "email", "website", "termsConditions"];
  const data: Record<string, string> = {};
  allowed.forEach((k) => { if (body[k] !== undefined) data[k] = body[k]; });

  const config = await prisma.solarponicsConfig.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  return NextResponse.json(config);
}
