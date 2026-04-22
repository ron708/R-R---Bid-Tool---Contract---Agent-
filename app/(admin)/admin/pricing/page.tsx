"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const RATE_FIELDS = [
  {
    key: "inflationRate",
    label: "Inflation Rate",
    hint: "% of parts to buffer material cost inflation (e.g. 0.03 = 3%)",
    step: "0.001",
  },
  {
    key: "salesTaxRate",
    label: "Sales Tax Rate",
    hint: "CA sales tax on parts + inflation (e.g. 0.0875 = 8.75%)",
    step: "0.001",
  },
  {
    key: "freightMin",
    label: "Freight Minimum ($)",
    hint: "Minimum freight / receiving charge applied to every job",
    step: "1",
  },
  {
    key: "truckRatePerMile",
    label: "Truck Rate ($/mile)",
    hint: "One-way truck expense per mile from shop to job site",
    step: "0.01",
  },
  {
    key: "laborDailyRatePerPerson",
    label: "Labor Rate ($/person/day)",
    hint: "All-in daily labor cost per crew member",
    step: "1",
  },
  {
    key: "warrantyReserveRate",
    label: "Warranty Reserve Rate",
    hint: "% of (parts + labor) held for warranty reserve (e.g. 0.13 = 13%)",
    step: "0.001",
  },
  {
    key: "liabilityInsuranceRate",
    label: "Liability Insurance Rate",
    hint: "% of all other costs for liability insurance (e.g. 0.0922 = 9.22%)",
    step: "0.001",
  },
  {
    key: "profitMargin",
    label: "Profit Margin",
    hint: "Target gross margin (e.g. 0.35 = 35%). Contract Price = Costs ÷ (1 − margin)",
    step: "0.01",
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/admin/pricing").then((r) => r.json()).then(setRates);
  }, []);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data: Record<string, number> = {};
    RATE_FIELDS.forEach(({ key }) => {
      data[key] = parseFloat(formData.get(key) as string) || 0;
    });

    const res = await fetch("/api/admin/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);
    if (res.ok) toast({ title: "Pricing updated" });
    else toast({ title: "Error saving pricing", variant: "destructive" });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Default Pricing Rates</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Platform-wide cost-plus margin model rates. All contractors inherit these defaults.
          Contract Price = Total Costs ÷ (1 − Profit Margin).
        </p>
      </div>

      <form onSubmit={save}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost-Plus Rate Table</CardTitle>
            <CardDescription>
              Rates verified against the Solarponics Excel bid tool (OVERHEAD COST SHEET).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {RATE_FIELDS.map(({ key, label, hint, step }) => (
              <div key={key} className="space-y-1">
                <Label className="text-sm font-medium">{label}</Label>
                <Input
                  name={key}
                  type="number"
                  step={step}
                  min="0"
                  defaultValue={rates[key] ?? 0}
                />
                <p className="text-xs text-muted-foreground">{hint}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Button type="submit" variant="solar" className="mt-4" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Pricing
        </Button>
      </form>
    </div>
  );
}
