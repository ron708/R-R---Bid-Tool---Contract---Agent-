import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBidNumber } from "@/lib/utils";
import { triggerPipedriveNewDeal } from "@/lib/pipedrive";
import type { PricingResult } from "@/lib/pricing-engine";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.contractorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const pricing: PricingResult = body.pricing;

  const bid = await prisma.bid.create({
    data: {
      bidNumber: generateBidNumber(),
      contractorId: session.user.contractorId,
      customerId: body.customerId,
      panelCount: parseInt(body.panelCount) || 0,
      panelBrand: body.panelBrand || null,
      panelModel: body.panelModel || null,
      systemSizeKw: parseFloat(body.systemSizeKw) || null,
      inverterType: body.inverterType || null,
      inverterBrand: body.inverterBrand || null,
      roofType: body.roofType || null,
      flatRoofMaterial: body.flatRoofMaterial || null,
      pitchCategory: body.pitchCategory || null,
      stories: parseInt(body.stories) || 1,
      railLinearFt: parseFloat(body.railLinearFt) || null,
      attachmentType: body.attachmentType || null,
      attachmentCount: parseInt(body.attachmentCount) || null,
      workScope: body.workScope || "FULL_RR",
      notes: body.notes || null,
      // Cost inputs
      partsEstimate: parseFloat(body.partsEstimate) || 0,
      morePartsEstimate: 0,
      crewCount: parseInt(body.crewCount) || 2,
      crewDays: parseFloat(body.crewDays) || 1,
      milesFromJob: parseFloat(body.milesFromJob) || 0,
      commissionAmount: 400,
      subContractorCost: parseFloat(body.subContractorCost) || 0,
      rackCost: parseFloat(body.rackCost) || 0,
      permitFeeAmount: parseFloat(body.permitFeeAmount) || 0,
      saveTheDeal: body.saveTheDeal === true,
      // Pricing outputs
      subtotal: pricing.subtotal,
      total: pricing.total,
      grossProfit: pricing.grossProfit,
      depositAmount: pricing.depositAmount,
      finalPayment: pricing.finalPayment,
      lineItems: {
        create: pricing.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          total: item.total,
          sortOrder: item.sortOrder,
          internal: item.internal ?? false,
        })),
      },
    },
    include: { customer: true, lineItems: true },
  });

  // Fire Pipedrive async (don't block response)
  triggerPipedriveNewDeal(bid.id, session.user.contractorId).catch(console.error);

  return NextResponse.json(bid);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.contractorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bids = await prisma.bid.findMany({
    where: { contractorId: session.user.contractorId },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bids);
}
