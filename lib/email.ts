import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "noreply@solarponics.com";

export async function sendProposalEmail(params: {
  to: string;
  customerName: string;
  contractorName: string;
  bidNumber: string;
  pdfBuffer: Buffer;
}) {
  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Your Solar R&R Proposal — ${params.bidNumber} | Solarponics Inc.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1E3A5F;">Solarponics Inc. — Solar R&R Proposal</h2>
        <p>Dear ${params.customerName},</p>
        <p>
          Your roofing contractor <strong>${params.contractorName}</strong> has partnered with
          Solarponics Inc. to prepare a solar panel remove &amp; replace (R&amp;R) proposal for your property.
        </p>
        <p>Please find your proposal (${params.bidNumber}) attached to this email.</p>
        <p>
          If you have any questions, please contact Solarponics Inc. directly or reach out to your
          roofing partner.
        </p>
        <p style="margin-top: 32px; color: #6b7280; font-size: 12px;">
          Solarponics Inc. | Licensed Solar Contractor
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `Solarponics-Proposal-${params.bidNumber}.pdf`,
        content: params.pdfBuffer,
      },
    ],
  });
}
