"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { BidFormData } from "./bid-form-wizard";

interface Props {
  form: BidFormData;
  update: (patch: Partial<BidFormData>) => void;
}

export function StepRoofScope({ form, update }: Props) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Roof Type</Label>
          <Select
            value={form.roofType}
            onValueChange={(v) => update({ roofType: v, flatRoofMaterial: v !== "FLAT" ? "" : form.flatRoofMaterial })}
          >
            <SelectTrigger><SelectValue placeholder="Select roof type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="COMP_SHINGLE">Comp Shingle</SelectItem>
              <SelectItem value="TILE">Tile</SelectItem>
              <SelectItem value="METAL">Metal</SelectItem>
              <SelectItem value="FLAT">Flat Roof (TPO, PVC, or Mod Bit)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Roof Pitch</Label>
          <Select value={form.pitchCategory} onValueChange={(v) => update({ pitchCategory: v })}>
            <SelectTrigger><SelectValue placeholder="Select pitch" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low (1–3/12)</SelectItem>
              <SelectItem value="MEDIUM">Medium (4–7/12)</SelectItem>
              <SelectItem value="STEEP">Steep (8+/12)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {form.roofType === "FLAT" && (
        <div className="space-y-2">
          <Label htmlFor="flatRoofMaterial">
            Membrane — Manufacturer / Brand &amp; Color <span className="text-destructive">*</span>
          </Label>
          <Input
            id="flatRoofMaterial"
            value={form.flatRoofMaterial}
            onChange={(e) => update({ flatRoofMaterial: e.target.value })}
            placeholder="e.g. GAF EverGuard TPO, White"
          />
          <p className="text-xs text-muted-foreground">Required for flat roofs — specify type (TPO/PVC/Mod Bit), brand, and color.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Stories</Label>
          <Select value={String(form.stories)} onValueChange={(v) => update({ stories: parseInt(v) })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Story</SelectItem>
              <SelectItem value="2">2 Stories</SelectItem>
              <SelectItem value="3">3+ Stories</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="railLinearFt">Rail Linear Footage</Label>
          <Input
            id="railLinearFt"
            type="number"
            step="0.5"
            value={form.railLinearFt}
            onChange={(e) => update({ railLinearFt: e.target.value })}
            placeholder="e.g. 120"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Attachment Type</Label>
          <Select value={form.attachmentType} onValueChange={(v) => update({ attachmentType: v })}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LAG_BOLT">Comp Attachment w/ Flashing</SelectItem>
              <SelectItem value="S5_CLAMP">S-5 Clamp</SelectItem>
              <SelectItem value="TILE_HOOK">Tile Hook w/ Flashing</SelectItem>
              <SelectItem value="FLAT_ROOF_BALLAST">Flat Roof Ballast</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="attachmentCount">Attachment Count</Label>
          <Input
            id="attachmentCount"
            type="number"
            value={form.attachmentCount}
            onChange={(e) => update({ attachmentCount: e.target.value })}
            placeholder="e.g. 48"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Work Scope</Label>
        <Select value={form.workScope} onValueChange={(v) => update({ workScope: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="FULL_RR">Full R&R (Remove + Replace)</SelectItem>
            <SelectItem value="REMOVAL_ONLY">Removal Only</SelectItem>
            <SelectItem value="INSTALL_ONLY">Reinstall Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes / Special Conditions</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="Any special conditions, access notes, or customer requests..."
          rows={3}
        />
      </div>
    </div>
  );
}
