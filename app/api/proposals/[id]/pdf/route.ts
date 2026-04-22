import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { ProposalDocument } from "@/components/proposal-pdf/proposal-document";
import React, { type ReactElement } from "react";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bid = await prisma.bid.findUnique({
    where: { id: params.id },
    include: { customer: true, contractor: true, lineItems: { orderBy: { sortOrder: "asc" } } },
  });

  if (!bid) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Allow partner who owns bid OR Solarponics admin
  if (session.user.role !== "SOLARPONICS_ADMIN" && bid.contractorId !== session.user.contractorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const config = await prisma.solarponicsConfig.findUnique({ where: { id: "singleton" } });
  if (!config) return NextResponse.json({ error: "Config missing" }, { status: 500 });

  const buffer = await renderToBuffer(
    React.createElement(ProposalDocument, { bid, config }) as ReactElement<DocumentProps>
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Solarponics-Proposal-${bid.bidNumber}.pdf"`,
    },
  });
}
