import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user.contractorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const integration = await prisma.contractorIntegration.findUnique({
    where: { contractorId: session.user.contractorId },
  });

  return NextResponse.json(integration ?? {});
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.contractorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const integration = await prisma.contractorIntegration.upsert({
    where: { contractorId: session.user.contractorId },
    update: {
      pipedriveApiKey: body.pipedriveApiKey || null,
      pipedrivePipelineId: body.pipedrivePipelineId || null,
      pipedriveStageId: body.pipedriveStageId || null,
    },
    create: {
      contractorId: session.user.contractorId,
      pipedriveApiKey: body.pipedriveApiKey || null,
      pipedrivePipelineId: body.pipedrivePipelineId || null,
      pipedriveStageId: body.pipedriveStageId || null,
    },
  });

  return NextResponse.json(integration);
}
