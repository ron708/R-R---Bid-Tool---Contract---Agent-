import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { ProposalDocument } from "@/components/proposal-pdf/proposal-document";
import { sendProposalEmail } from "@/lib/email";
import React, { type ReactElement } from "react";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.contractorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bidId } = await req.json();

  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: { customer: true, contractor: true, lineItems: { orderBy: { sortOrder: "asc" } } },
  });

  if (!bid || bid.contractorId !== session.user.contractorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!bid.customer.email) {
    return NextResponse.json({ error: "Customer has no email address" }, { status: 400 });
  }

  const config = await prisma.solarponicsConfig.findUnique({ where: { id: "singleton" } });
  if (!config) return NextResponse.json({ error: "Config missing" }, { status: 500 });

  const pdfBuffer = await renderToBuffer(
    React.createElement(ProposalDocument, { bid, config }) as ReactElement<DocumentProps>
  );

  await sendProposalEmail({
    to: bid.customer.email,
    customerName: `${bid.customer.firstName} ${bid.customer.lastName}`,
    contractorName: bid.contractor.name,
    bidNumber: bid.bidNumber,
    pdfBuffer: Buffer.from(pdfBuffer),
  });

  return NextResponse.json({ ok: true });
}
