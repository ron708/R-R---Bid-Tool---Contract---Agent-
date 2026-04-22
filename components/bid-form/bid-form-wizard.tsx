"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { StepCustomer } from "./step-customer";
import { StepSystem } from "./step-system";
import { StepRoofScope } from "./step-roof-scope";
import { StepCost } from "./step-cost";
import { StepReview } from "./step-review";
import { calculateBid, DEFAULT_RATES, type PricingInputs, type RateTable } from "@/lib/pricing-engine";
import {
  calcBidDefaults,
  COMMISSION_AMOUNT,
  CREW_COUNT,
  PERMIT_FEE,
  RACK_RATE_PER_PANEL,
  SAVE_THE_DEAL_MARGIN,
} from "@/lib/bid-rules";
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
  notes: string;
  // Step 4: Cost Inputs
  // Auto-calculated (hidden from UI, set by effects):
  partsEstimate: number;     // panels × 1.5 × $35
  morePartsEstimate: number; // always 0
  crewCount: number;         // always 2
  crewDays: number;          // by panels + roof + stories
  commissionAmount: number;  // always $400
  milesFromJob: number;      // auto-fetched from address, user can override
  // Toggles (user-visible):
  includePermit: boolean;    // Yes → $250
  includeRack: boolean;      // Yes → panelCount × $18
  subContractorCost: number; // partner-only; hidden from customer PDF
  // Deal option:
  saveTheDeal: boolean;      // true → 30% margin instead of 35%
}

const STEPS = ["Customer", "System", "Roof & Scope", "Cost Inputs", "Review"];

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  siteAddress: string;
  siteCity: string | null;
  siteState: string | null;
  siteZip: string | null;
  email: string | null;
  phone: string | null;
}

interface Props {
  customers: Customer[];
  defaultRates: Partial<RateTable> | null;
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
  notes: "",
  partsEstimate: 0,
  morePartsEstimate: 0,
  crewCount: CREW_COUNT,
  crewDays: 1.3,
  commissionAmount: COMMISSION_AMOUNT,
  milesFromJob: 0,
  includePermit: false,
  includeRack: false,
  subContractorCost: 0,
  saveTheDeal: false,
};

export function BidFormWizard({ customers, defaultRates }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BidFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [milesLoading, setMilesLoading] = useState(false);

  const update = useCallback(
    (patch: Partial<BidFormData>) => setForm((f) => ({ ...f, ...patch })),
    []
  );

  // ── Auto-calculate parts + crew when panel count / roof type / stories change ──
  useEffect(() => {
    if (form.panelCount <= 0) return;
    setForm((f) => ({ ...f, ...calcBidDefaults(f.panelCount, f.roofType, f.stories) }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.panelCount, form.roofType, form.stories]);

  // ── Auto-calculate one-way miles from job address when customer changes ────────
  useEffect(() => {
    if (!form.customerId) return;
    const customer = customers.find((c) => c.id === form.customerId);
    if (!customer?.siteAddress) return;

    const address = [customer.siteAddress, customer.siteCity, customer.siteState, customer.siteZip]
      .filter(Boolean)
      .join(", ");

    let cancelled = false;
    setMilesLoading(true);

    fetch(`/api/utils/distance?address=${encodeURIComponent(address)}`)
      .then((r) => r.json())
      .then(({ miles }: { miles?: number }) => {
        if (!cancelled && typeof miles === "number" && miles > 0) {
          setForm((f) => ({ ...f, milesFromJob: miles }));
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setMilesLoading(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.customerId]);

  // ── Derived values for pricing ────────────────────────────────────────────────
  const permitFeeAmount = form.includePermit ? PERMIT_FEE : 0;
  const rackCost = form.includeRack ? form.panelCount * RACK_RATE_PER_PANEL : 0;

  const baseRates: RateTable = {
    ...DEFAULT_RATES,
    ...Object.fromEntries(
      Object.entries(defaultRates ?? {}).filter(([, v]) => v != null)
    ),
  };

  const rates: RateTable = {
    ...baseRates,
    profitMargin: form.saveTheDeal ? SAVE_THE_DEAL_MARGIN : baseRates.profitMargin,
  };

  const pricingInputs: PricingInputs = {
    panelCount: form.panelCount,
    partsEstimate: form.partsEstimate,
    morePartsEstimate: 0,
    milesFromJob: form.milesFromJob,
    crewCount: form.crewCount,
    crewDays: form.crewDays,
    commissionAmount: form.commissionAmount,
    subContractorCost: form.subContractorCost,
    rackCost,
    permitFee: permitFeeAmount,
  };

  const pricing = calculateBid(pricingInputs, rates);

  async function handleSubmit() {
    setSaving(true);
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          permitFeeAmount,
          rackCost,
          saveTheDeal: form.saveTheDeal,
          pricing,
        }),
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
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1 min-w-0">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0",
              i < step ? "bg-green-500 text-white" : i === step ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            )}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn("text-sm hidden sm:block truncate", i === step ? "font-semibold" : "text-muted-foreground")}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border shrink-0 min-w-[8px]" />}
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
          {step === 3 && (
            <StepCost
              form={form}
              update={update}
              milesLoading={milesLoading}
              permitFeeAmount={permitFeeAmount}
              rackCost={rackCost}
            />
          )}
          {step === 4 && <StepReview form={form} customers={customers} pricing={pricing} />}
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
