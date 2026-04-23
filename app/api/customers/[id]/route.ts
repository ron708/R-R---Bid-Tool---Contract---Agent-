import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user.contractorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customer = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!customer || customer.contractorId !== session.user.contractorId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(customer);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user.contractorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customer = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!customer || customer.contractorId !== session.user.contractorId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { firstName, lastName, email, phone, siteAddress, siteCity, siteState, siteZip } = body;

  if (!firstName || !lastName || !siteAddress) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const updated = await prisma.customer.update({
    where: { id: params.id },
    data: {
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      siteAddress,
      siteCity: siteCity || null,
      siteState: siteState || null,
      siteZip: siteZip || null,
    },
  });

  return NextResponse.json(updated);
}
