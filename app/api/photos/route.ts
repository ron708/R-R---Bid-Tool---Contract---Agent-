import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadBidPhoto } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.contractorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const bidId = formData.get("bidId") as string | null;

  if (!file || !bidId) return NextResponse.json({ error: "Missing file or bidId" }, { status: 400 });

  // Verify bid belongs to this contractor
  const bid = await prisma.bid.findUnique({ where: { id: bidId } });
  if (!bid || bid.contractorId !== session.user.contractorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { storagePath, publicUrl } = await uploadBidPhoto(session.user.contractorId, bidId, file);

  const photo = await prisma.bidPhoto.create({
    data: { bidId, storagePath, publicUrl },
  });

  return NextResponse.json(photo);
}
