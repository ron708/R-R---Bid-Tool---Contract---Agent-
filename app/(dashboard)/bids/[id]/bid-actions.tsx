"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Send, FileDown, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  bid: {
    id: string;
    status: string;
    bidNumber: string;
    contractorName: string;
    customer: { email: string | null; firstName: string; lastName: string };
  };
}

export function BidActions({ bid }: Props) {
  const router = useRouter();
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingSign, setLoadingSign] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  async function downloadPdf() {
    setLoadingPdf(true);
    try {
      const res = await fetch(`/api/proposals/${bid.id}/pdf`);
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Solarponics-Proposal-${bid.bidNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Error", description: "Could not generate PDF.", variant: "destructive" });
    } finally {
      setLoadingPdf(false);
    }
  }

  async function sendForSignature() {
    if (!bid.customer.email) {
      toast({ title: "No email", description: "Customer has no email address on file.", variant: "destructive" });
      return;
    }
    setLoadingSign(true);
    try {
      const res = await fetch(`/api/adobe-sign/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidId: bid.id }),
      });
      if (!res.ok) throw new Error("Failed to send for signature");
      toast({ title: "Sent for signature", description: `Agreement sent to ${bid.customer.email}` });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoadingSign(false);
    }
  }

  async function emailProposal() {
    if (!bid.customer.email) {
      toast({ title: "No email", description: "Customer has no email address on file.", variant: "destructive" });
      return;
    }
    setLoadingEmail(true);
    try {
      const res = await fetch(`/api/email/proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidId: bid.id }),
      });
      if (!res.ok) throw new Error("Failed to send email");
      toast({ title: "Email sent", description: `Proposal emailed to ${bid.customer.email}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoadingEmail(false);
    }
  }

  const isSigned = bid.status === "SIGNED" || bid.status === "COMPLETE";

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={downloadPdf} disabled={loadingPdf}>
        {loadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        Download PDF
      </Button>

      {!isSigned && bid.status !== "SENT" && (
        <Button variant="solar" onClick={sendForSignature} disabled={loadingSign}>
          {loadingSign ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send for Signature (Adobe Sign)
        </Button>
      )}

      <Button variant="outline" onClick={emailProposal} disabled={loadingEmail}>
        {loadingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        Email Proposal
      </Button>
    </div>
  );
}
