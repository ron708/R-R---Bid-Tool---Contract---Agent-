import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteBidPhoto } from "@/lib/storage";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user.contractorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const photo = await prisma.bidPhoto.findUnique({ where: { id: params.id }, include: { bid: true } });
  if (!photo || photo.bid.contractorId !== session.user.contractorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await deleteBidPhoto(photo.storagePath);
  await prisma.bidPhoto.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
