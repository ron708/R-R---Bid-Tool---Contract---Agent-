import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.contractorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { firstName, lastName, email, phone, siteAddress, siteCity, siteState, siteZip } = body;

  if (!firstName || !lastName || !siteAddress) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const customer = await prisma.customer.create({
    data: {
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      siteAddress,
      siteCity: siteCity || null,
      siteState: siteState || null,
      siteZip: siteZip || null,
      contractorId: session.user.contractorId,
    },
  });

  return NextResponse.json(customer);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.contractorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customers = await prisma.customer.findMany({
    where: { contractorId: session.user.contractorId },
    orderBy: { firstName: "asc" },
  });

  return NextResponse.json(customers);
}
