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

  const pricing = await prisma.defaultPricingConfig.findUnique({ where: { id: "default" } });
  return NextResponse.json(pricing ?? {});
}

export async function PATCH(req: NextRequest) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const pricing = await prisma.defaultPricingConfig.upsert({
    where: { id: "default" },
    update: body,
    create: { id: "default", ...body },
  });

  return NextResponse.json(pricing);
}
