"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const RATE_FIELDS = [
  { key: "panelRemoval", label: "Panel Removal (per panel)", placeholder: "$ per panel" },
  { key: "panelInstall", label: "Panel Reinstall (per panel)", placeholder: "$ per panel" },
  { key: "railRemovalPerFt", label: "Rail Removal (per linear ft)", placeholder: "$ per ft" },
  { key: "railInstallPerFt", label: "Rail Reinstall (per linear ft)", placeholder: "$ per ft" },
  { key: "attachmentRemoval", label: "Attachment Removal (ea)", placeholder: "$ each" },
  { key: "attachmentInstall", label: "Attachment Reinstall (ea)", placeholder: "$ each" },
  { key: "pitchAdderMedium", label: "Medium Pitch Adder (per panel)", placeholder: "$ per panel" },
  { key: "pitchAdderSteep", label: "Steep Pitch Adder (per panel)", placeholder: "$ per panel" },
  { key: "storyAdder", label: "Multi-Story Adder (per panel)", placeholder: "$ per panel" },
  { key: "permitFee", label: "Permit Fee (flat)", placeholder: "$ flat" },
  { key: "inspectionFee", label: "Inspection Fee (flat)", placeholder: "$ flat" },
  { key: "laborRatePerHour", label: "Labor Rate (per hour)", placeholder: "$ per hour" },
  { key: "travelFlatFee", label: "Travel Fee (flat, 0 = none)", placeholder: "$ flat" },
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
    const form = new FormData(e.currentTarget);
    const data: Record<string, number> = {};
    RATE_FIELDS.forEach(({ key }) => {
      data[key] = parseFloat(form.get(key) as string) || 0;
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
          These are the platform-wide defaults. Individual contractors will inherit these rates.
          <span className="text-amber-600 font-medium"> Update these after the Excel bid tool is reviewed.</span>
        </p>
      </div>

      <form onSubmit={save}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rate Table</CardTitle>
            <CardDescription>All dollar amounts. Set to 0 to disable a line item.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {RATE_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <Input
                  name={key}
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={rates[key] ?? 0}
                  placeholder={placeholder}
                />
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
