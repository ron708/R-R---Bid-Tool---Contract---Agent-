"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { StepCustomer } from "./step-customer";
import { StepSystem } from "./step-system";
import { StepRoofScope } from "./step-roof-scope";
import { StepReview } from "./step-review";
import { calculateBid, type PricingInputs } from "@/lib/pricing-engine";
import type { DefaultPricingConfig } from "@prisma/client";
import { cn } from "@/lib/utils";

export interface BidFormData {
  // Step 1: Customer
  customerId: string;
  // Step 2: System
  panelCount: number;
  panelBrand: string;
  panelModel: string;
  systemSizeKw: string;
  inverterType: string;
  inverterBrand: string;
  // Step 3: Roof & Scope
  roofType: string;
  pitchCategory: string;
  stories: number;
  railLinearFt: string;
  attachmentType: string;
  attachmentCount: string;
  workScope: string;
  includePermit: boolean;
  includeInspection: boolean;
  notes: string;
}

const STEPS = ["Customer", "System", "Roof & Scope", "Review"];

interface Props {
  customers: { id: string; firstName: string; lastName: string; siteAddress: string; siteCity: string | null; email: string | null; phone: string | null }[];
  defaultRates: DefaultPricingConfig | null;
}

const defaultForm: BidFormData = {
  customerId: "",
  panelCount: 0,
  panelBrand: "",
  panelModel: "",
  systemSizeKw: "",
  inverterType: "",
  inverterBrand: "",
  roofType: "",
  pitchCategory: "LOW",
  stories: 1,
  railLinearFt: "",
  attachmentType: "",
  attachmentCount: "",
  workScope: "FULL_RR",
  includePermit: false,
  includeInspection: false,
  notes: "",
};

export function BidFormWizard({ customers, defaultRates }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BidFormData>(defaultForm);
  const [saving, setSaving] = useState(false);

  const update = (patch: Partial<BidFormData>) => setForm((f) => ({ ...f, ...patch }));

  const rates = defaultRates ?? {
    panelRemoval: 35, railRemovalPerFt: 2.5, attachmentRemoval: 8,
    panelInstall: 45, railInstallPerFt: 3.5, attachmentInstall: 12,
    pitchAdderMedium: 5, pitchAdderSteep: 15, storyAdder: 8,
    permitFee: 350, inspectionFee: 150, laborRatePerHour: 85, travelFlatFee: 0,
  };

  const pricingInputs: PricingInputs = {
    panelCount: form.panelCount,
    railLinearFt: parseFloat(form.railLinearFt) || undefined,
    attachmentCount: parseInt(form.attachmentCount) || undefined,
    attachmentType: (form.attachmentType as any) || undefined,
    pitchCategory: (form.pitchCategory as any) || "LOW",
    stories: form.stories,
    workScope: (form.workScope as any) || "FULL_RR",
    includePermit: form.includePermit,
    includeInspection: form.includeInspection,
  };

  const pricing = calculateBid(pricingInputs, rates);

  async function handleSubmit() {
    setSaving(true);
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, pricing }),
      });

      if (!res.ok) throw new Error("Failed to save bid");
      const bid = await res.json();
      toast({ title: "Bid created!", description: `Bid ${bid.bidNumber} saved.` });
      router.push(`/bids/${bid.id}`);
    } catch {
      toast({ title: "Error", description: "Failed to save bid.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const canProceed = () => {
    if (step === 0) return !!form.customerId;
    if (step === 1) return form.panelCount > 0;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0",
              i < step ? "bg-green-500 text-white" : i === step ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            )}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn("text-sm hidden sm:block", i === step ? "font-semibold" : "text-muted-foreground")}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardHeader><CardTitle className="text-base">{STEPS[step]}</CardTitle></CardHeader>
        <CardContent>
          {step === 0 && <StepCustomer form={form} update={update} customers={customers} />}
          {step === 1 && <StepSystem form={form} update={update} />}
          {step === 2 && <StepRoofScope form={form} update={update} />}
          {step === 3 && <StepReview form={form} customers={customers} pricing={pricing} />}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} variant="solar">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={saving} variant="solar">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Bid
          </Button>
        )}
      </div>
    </div>
  );
}
