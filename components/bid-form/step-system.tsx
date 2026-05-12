"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BidFormData } from "./bid-form-wizard";

interface Props {
  form: BidFormData;
  update: (patch: Partial<BidFormData>) => void;
}

export function StepSystem({ form, update }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="panelCount">Panel Count *</Label>
          <Input
            id="panelCount"
            type="number"
            min={1}
            value={form.panelCount || ""}
            onChange={(e) => update({ panelCount: parseInt(e.target.value) || 0 })}
            placeholder="e.g. 24"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="systemSizeKw">System Size (kW)</Label>
          <Input
            id="systemSizeKw"
            type="number"
            step="0.01"
            value={form.systemSizeKw}
            onChange={(e) => update({ systemSizeKw: e.target.value })}
            placeholder="e.g. 8.64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="panelBrand">Panel Brand</Label>
          <Input
            id="panelBrand"
            value={form.panelBrand}
            onChange={(e) => update({ panelBrand: e.target.value })}
            placeholder="e.g. SunPower, LG, QCells"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="panelModel">Panel Model</Label>
          <Input
            id="panelModel"
            value={form.panelModel}
            onChange={(e) => update({ panelModel: e.target.value })}
            placeholder="e.g. SPR-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Inverter Type</Label>
          <Select value={form.inverterType} onValueChange={(v) => update({ inverterType: v })}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="STRING">String Inverter</SelectItem>
              <SelectItem value="MICROINVERTER">Microinverter</SelectItem>
              <SelectItem value="POWER_OPTIMIZER">Power Optimizer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="inverterBrand">Inverter Brand</Label>
          <Input
            id="inverterBrand"
            value={form.inverterBrand}
            onChange={(e) => update({ inverterBrand: e.target.value })}
            placeholder="e.g. Enphase, SolarEdge"
          />
        </div>
      </div>
    </div>
  );
}
