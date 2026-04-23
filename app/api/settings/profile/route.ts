import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user.contractorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contractor = await prisma.contractor.findUnique({
    where: { id: session.user.contractorId },
    select: { name: true, phone: true, email: true, address: true, city: true, state: true, zip: true, licenseNumber: true },
  });

  return NextResponse.json(contractor ?? {});
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.contractorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const contractor = await prisma.contractor.update({
    where: { id: session.user.contractorId },
    data: {
      name: body.name || undefined,
      phone: body.phone || undefined,
      email: body.email || undefined,
    },
  });

  return NextResponse.json(contractor);
}
