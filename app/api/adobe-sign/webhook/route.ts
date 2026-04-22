import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Adobe Sign sends event.type + agreement.id
  const agreementId = body?.agreement?.id ?? body?.agreementId;
  const eventType = body?.event ?? body?.type;

  if (!agreementId) return NextResponse.json({ ok: true });

  if (eventType === "AGREEMENT_ALL_SIGNED" || eventType === "ESIGNED") {
    await prisma.bid.updateMany({
      where: { adobeSignAgreementId: agreementId },
      data: { status: "SIGNED", signedAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
