/**
 * Adobe Acrobat Sign REST API v6 wrapper.
 * Uses a single shared Solarponics OAuth token stored in SolarponicsConfig.
 * Docs: https://secure.na4.adobesign.com/public/docs/restapi/v6
 */

import { prisma } from "@/lib/prisma";

async function getAccessToken(): Promise<{ token: string; baseUri: string }> {
  const config = await prisma.solarponicsConfig.findUnique({ where: { id: "singleton" } });
  if (!config?.adobeSignAccessToken) throw new Error("Adobe Sign not configured. Admin must complete OAuth setup.");
  return {
    token: config.adobeSignAccessToken,
    baseUri: process.env.ADOBE_SIGN_BASE_URI ?? "https://api.na2.adobesign.com/",
  };
}

async function adobeRequest(method: string, path: string, body?: object, contentType = "application/json") {
  const { token, baseUri } = await getAccessToken();
  const url = `${baseUri}api/rest/v6${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": contentType } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Adobe Sign ${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

export async function uploadTransientDocument(pdfBuffer: Buffer, filename: string): Promise<string> {
  const { token, baseUri } = await getAccessToken();
  const url = `${baseUri}api/rest/v6/transientDocuments`;

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" });
  formData.append("File-Name", filename);
  formData.append("File", blob, filename);
  formData.append("Mime-Type", "application/pdf");

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error(`Adobe Sign upload failed: ${res.status}`);
  const data = await res.json();
  return data.transientDocumentId;
}

export async function createAgreement(params: {
  transientDocumentId: string;
  agreementName: string;
  customerEmail: string;
  customerName: string;
  message?: string;
}): Promise<{ agreementId: string; signingUrl?: string }> {
  const data = await adobeRequest("POST", "/agreements", {
    fileInfos: [{ transientDocumentId: params.transientDocumentId }],
    name: params.agreementName,
    participantSetsInfo: [
      {
        memberInfos: [{ email: params.customerEmail, name: params.customerName }],
        order: 1,
        role: "SIGNER",
      },
    ],
    signatureType: "ESIGN",
    state: "IN_PROCESS",
    message: params.message ?? "Please review and sign your solar R&R proposal from Solarponics Inc.",
  });

  return { agreementId: data.id };
}

export async function getAgreementStatus(agreementId: string): Promise<string> {
  const data = await adobeRequest("GET", `/agreements/${agreementId}`);
  return data.status;
}

// OAuth URL builder — redirect admin to this to authorize
export function buildOAuthUrl(): string {
  const clientId = process.env.ADOBE_SIGN_CLIENT_ID!;
  const redirectUri = encodeURIComponent(process.env.ADOBE_SIGN_REDIRECT_URI!);
  return `https://secure.na2.adobesign.com/public/oauth/v2?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=agreement_send+agreement_read+user_read`;
}

export async function exchangeCodeForToken(code: string) {
  const res = await fetch("https://api.na2.adobesign.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.ADOBE_SIGN_CLIENT_ID!,
      client_secret: process.env.ADOBE_SIGN_CLIENT_SECRET!,
      redirect_uri: process.env.ADOBE_SIGN_REDIRECT_URI!,
      code,
    }),
  });
  if (!res.ok) throw new Error(`Adobe Sign token exchange failed: ${res.status}`);
  const data = await res.json();

  await prisma.solarponicsConfig.update({
    where: { id: "singleton" },
    data: {
      adobeSignAccessToken: data.access_token,
      adobeSignRefreshToken: data.refresh_token,
      adobeSignTokenExpiry: new Date(Date.now() + data.expires_in * 1000),
    },
  });
}
