import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Ron@Solarponics.com";
const APP_URL = process.env.NEXTAUTH_URL ?? "https://solarponics.com";

export async function sendProposalEmail(params: {
  to: string;
  customerName: string;
  contractorName: string;
  bidNumber: string;
  pdfBuffer: Buffer;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
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

export async function sendPartnerInviteEmail(params: {
  to: string;
  companyName: string;
  password: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Welcome to Solarponics — Your Partner Portal Access`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">

        <div style="background: #1E3A5F; padding: 28px 32px; border-radius: 6px 6px 0 0;">
          <h1 style="margin: 0; color: #5CAD2F; font-size: 22px; letter-spacing: -0.5px;">Solarponics Inc.</h1>
          <p style="margin: 4px 0 0; color: rgba(255,255,255,0.7); font-size: 13px;">R&amp;R Bid Tool — Partner Portal</p>
        </div>

        <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 6px 6px;">
          <h2 style="margin: 0 0 8px; font-size: 18px;">Welcome, ${params.companyName}!</h2>
          <p style="color: #6b7280; margin: 0 0 24px;">
            Your Strategic Partner account has been created on the Solarponics R&amp;R Bid Tool.
            Use the credentials below to sign in and start submitting bids.
          </p>

          <div style="background: #f3f4f6; border-radius: 6px; padding: 20px 24px; margin-bottom: 24px;">
            <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Login URL</p>
            <a href="${APP_URL}/login" style="color: #1E3A5F; font-weight: 600; font-size: 15px; text-decoration: none;">${APP_URL}/login</a>

            <div style="border-top: 1px solid #e5e7eb; margin: 16px 0;"></div>

            <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Username</p>
            <p style="margin: 0 0 16px; font-size: 15px; font-weight: 600;">${params.to}</p>

            <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Temporary Password</p>
            <p style="margin: 0; font-size: 15px; font-weight: 600; font-family: monospace; letter-spacing: 0.05em;">${params.password}</p>
          </div>

          <p style="color: #6b7280; font-size: 13px; margin: 0 0 24px;">
            For security, please update your password after your first login via <strong>Settings</strong>.
          </p>

          <a href="${APP_URL}/login"
             style="display: inline-block; background: #5CAD2F; color: white; text-decoration: none;
                    font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 6px;">
            Sign In to the Portal →
          </a>

          <p style="margin: 32px 0 0; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 20px;">
            Solarponics Inc. &nbsp;|&nbsp; CSLB #391670 &nbsp;|&nbsp; (805) 466-5595 &nbsp;|&nbsp;
            <a href="mailto:Ron@Solarponics.com" style="color: #9ca3af;">Ron@Solarponics.com</a>
          </p>
        </div>

      </div>
    `,
  });
}
