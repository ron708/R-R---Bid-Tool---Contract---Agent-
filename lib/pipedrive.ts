/**
 * Pipedrive REST API client.
 * Each contractor stores their own API key in ContractorIntegration.pipedriveApiKey.
 */

import { prisma } from "@/lib/prisma";

const BASE = "https://api.pipedrive.com/v1";

async function pipedriveRequest(apiKey: string, method: string, path: string, body?: object) {
  const url = `${BASE}${path}?api_token=${apiKey}`;
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Pipedrive ${method} ${path} → ${res.status}`);
  return res.json();
}

async function findOrCreatePerson(
  apiKey: string,
  firstName: string,
  lastName: string,
  email?: string | null,
  phone?: string | null
): Promise<string> {
  const name = `${firstName} ${lastName}`;
  const search = await pipedriveRequest(apiKey, "GET", `/persons/search?term=${encodeURIComponent(name)}&fields=name`);
  if (search.data?.items?.length) return search.data.items[0].item.id;

  const created = await pipedriveRequest(apiKey, "POST", "/persons", {
    name,
    ...(email ? { email: [{ value: email, primary: true }] } : {}),
    ...(phone ? { phone: [{ value: phone, primary: true }] } : {}),
  });
  return created.data.id;
}

export async function triggerPipedriveNewDeal(bidId: string, contractorId: string) {
  const integration = await prisma.contractorIntegration.findUnique({ where: { contractorId } });
  if (!integration?.pipedriveApiKey) return;

  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: { customer: true },
  });
  if (!bid) return;

  const personId = await findOrCreatePerson(
    integration.pipedriveApiKey,
    bid.customer.firstName,
    bid.customer.lastName,
    bid.customer.email,
    bid.customer.phone
  );

  const dealPayload: Record<string, unknown> = {
    title: `${bid.customer.firstName} ${bid.customer.lastName} — ${bid.customer.siteAddress} (${bid.bidNumber})`,
    person_id: personId,
    value: bid.total ?? 0,
    currency: "USD",
    status: "open",
  };
  if (integration.pipedrivePipelineId) dealPayload.pipeline_id = parseInt(integration.pipedrivePipelineId);
  if (integration.pipedriveStageId) dealPayload.stage_id = parseInt(integration.pipedriveStageId);

  const deal = await pipedriveRequest(integration.pipedriveApiKey, "POST", "/deals", dealPayload);

  await prisma.bid.update({
    where: { id: bidId },
    data: {
      pipedriveDealId: String(deal.data.id),
      customer: { update: { pipedrivePersonId: String(personId) } },
    },
  });
}
