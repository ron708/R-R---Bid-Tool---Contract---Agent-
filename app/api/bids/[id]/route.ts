import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bid = await prisma.bid.findUnique({ where: { id: params.id } });
  if (!bid) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.role === "SOLARPONICS_ADMIN";
  if (!isAdmin && bid.contractorId !== session.user.contractorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(bid);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bid = await prisma.bid.findUnique({ where: { id: params.id } });
  if (!bid) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.role === "SOLARPONICS_ADMIN";
  if (!isAdmin && bid.contractorId !== session.user.contractorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // Only allow updating descriptive/scope inputs — never pricing fields
  const updated = await prisma.bid.update({
    where: { id: params.id },
    data: {
      panelCount:      body.panelCount      != null ? parseInt(body.panelCount) : undefined,
      panelBrand:      body.panelBrand      ?? undefined,
      panelModel:      body.panelModel      ?? undefined,
      systemSizeKw:    body.systemSizeKw    ? parseFloat(body.systemSizeKw) : undefined,
      inverterType:    body.inverterType    ?? undefined,
      inverterBrand:   body.inverterBrand   ?? undefined,
      roofType:        body.roofType        ?? undefined,
      flatRoofMaterial: body.flatRoofMaterial ?? undefined,
      pitchCategory:   body.pitchCategory   ?? undefined,
      stories:         body.stories         != null ? parseInt(body.stories) : undefined,
      railLinearFt:    body.railLinearFt    ? parseFloat(body.railLinearFt) : undefined,
      attachmentType:  body.attachmentType  ?? undefined,
      attachmentCount: body.attachmentCount ? parseInt(body.attachmentCount) : undefined,
      workScope:       body.workScope       ?? undefined,
      notes:           body.notes           ?? undefined,
    },
  });

  return NextResponse.json(updated);
}
