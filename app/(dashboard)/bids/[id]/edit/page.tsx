"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Fields = {
  panelCount: string;
  panelBrand: string;
  panelModel: string;
  systemSizeKw: string;
  inverterType: string;
  inverterBrand: string;
  roofType: string;
  flatRoofMaterial: string;
  pitchCategory: string;
  stories: string;
  railLinearFt: string;
  attachmentType: string;
  attachmentCount: string;
  workScope: string;
  notes: string;
};

const empty: Fields = {
  panelCount: "", panelBrand: "", panelModel: "", systemSizeKw: "",
  inverterType: "", inverterBrand: "", roofType: "", flatRoofMaterial: "",
  pitchCategory: "", stories: "1", railLinearFt: "", attachmentType: "",
  attachmentCount: "", workScope: "FULL_RR", notes: "",
};

export default function EditBidPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<Fields>(empty);
  const [bidNumber, setBidNumber] = useState("");

  useEffect(() => {
    fetch(`/api/bids/${id}`)
      .then((r) => r.json())
      .then((b) => {
        setBidNumber(b.bidNumber ?? "");
        setFields({
          panelCount:       String(b.panelCount ?? ""),
          panelBrand:       b.panelBrand ?? "",
          panelModel:       b.panelModel ?? "",
          systemSizeKw:     b.systemSizeKw != null ? String(b.systemSizeKw) : "",
          inverterType:     b.inverterType ?? "",
          inverterBrand:    b.inverterBrand ?? "",
          roofType:         b.roofType ?? "",
          flatRoofMaterial: b.flatRoofMaterial ?? "",
          pitchCategory:    b.pitchCategory ?? "",
          stories:          String(b.stories ?? 1),
          railLinearFt:     b.railLinearFt != null ? String(b.railLinearFt) : "",
          attachmentType:   b.attachmentType ?? "",
          attachmentCount:  b.attachmentCount != null ? String(b.attachmentCount) : "",
          workScope:        b.workScope ?? "FULL_RR",
          notes:            b.notes ?? "",
        });
      });
  }, [id]);

  function set(key: keyof Fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.panelCount || parseInt(fields.panelCount) < 1) {
      toast({ title: "Panel count is required", variant: "destructive" });
      return;
    }
    if (fields.roofType === "FLAT" && !fields.flatRoofMaterial.trim()) {
      toast({ title: "Membrane / brand is required for flat roofs", variant: "destructive" });
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/bids/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    setLoading(false);

    if (!res.ok) {
      toast({ title: "Error saving bid", variant: "destructive" });
      return;
    }
    toast({ title: "Bid updated" });
    router.push(`/bids/${id}`);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/bids/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Bid</h1>
          {bidNumber && <p className="text-sm text-muted-foreground">{bidNumber}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Solar System */}
        <Card>
          <CardHeader><CardTitle className="text-base">Solar System</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Panel Count <span className="text-destructive">*</span></Label>
                <Input type="number" min={1} value={fields.panelCount}
                  onChange={(e) => set("panelCount", e.target.value)} placeholder="e.g. 24" />
              </div>
              <div className="space-y-2">
                <Label>System Size (kW)</Label>
                <Input type="number" step="0.01" value={fields.systemSizeKw}
                  onChange={(e) => set("systemSizeKw", e.target.value)} placeholder="e.g. 8.64" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Panel Brand</Label>
                <Input value={fields.panelBrand}
                  onChange={(e) => set("panelBrand", e.target.value)} placeholder="e.g. SunPower, LG" />
              </div>
              <div className="space-y-2">
                <Label>Panel Model</Label>
                <Input value={fields.panelModel}
                  onChange={(e) => set("panelModel", e.target.value)} placeholder="e.g. SPR-400" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Inverter Type</Label>
                <Select value={fields.inverterType} onValueChange={(v) => set("inverterType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STRING">String Inverter</SelectItem>
                    <SelectItem value="MICROINVERTER">Microinverter</SelectItem>
                    <SelectItem value="POWER_OPTIMIZER">Power Optimizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Inverter Brand</Label>
                <Input value={fields.inverterBrand}
                  onChange={(e) => set("inverterBrand", e.target.value)} placeholder="e.g. Enphase, SolarEdge" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roof & Scope */}
        <Card>
          <CardHeader><CardTitle className="text-base">Roof & Scope</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Roof Type</Label>
                <Select value={fields.roofType}
                  onValueChange={(v) => set("roofType", v)}>
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
                <Select value={fields.pitchCategory} onValueChange={(v) => set("pitchCategory", v)}>
                  <SelectTrigger><SelectValue placeholder="Select pitch" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low (1–3/12)</SelectItem>
                    <SelectItem value="MEDIUM">Medium (4–7/12)</SelectItem>
                    <SelectItem value="STEEP">Steep (8+/12)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {fields.roofType === "FLAT" && (
              <div className="space-y-2">
                <Label>Membrane — Manufacturer / Brand &amp; Color <span className="text-destructive">*</span></Label>
                <Input value={fields.flatRoofMaterial}
                  onChange={(e) => set("flatRoofMaterial", e.target.value)}
                  placeholder="e.g. GAF EverGuard TPO, White" />
                <p className="text-xs text-muted-foreground">Specify type (TPO/PVC/Mod Bit), brand, and color.</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stories</Label>
                <Select value={fields.stories} onValueChange={(v) => set("stories", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Story</SelectItem>
                    <SelectItem value="2">2 Stories</SelectItem>
                    <SelectItem value="3">3+ Stories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rail Linear Footage</Label>
                <Input type="number" step="0.5" value={fields.railLinearFt}
                  onChange={(e) => set("railLinearFt", e.target.value)} placeholder="e.g. 120" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Attachment Type</Label>
                <Select value={fields.attachmentType} onValueChange={(v) => set("attachmentType", v)}>
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
                <Label>Attachment Count</Label>
                <Input type="number" value={fields.attachmentCount}
                  onChange={(e) => set("attachmentCount", e.target.value)} placeholder="e.g. 48" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Work Scope</Label>
              <Select value={fields.workScope} onValueChange={(v) => set("workScope", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_RR">Full R&R (Remove + Replace)</SelectItem>
                  <SelectItem value="REMOVAL_ONLY">Removal Only</SelectItem>
                  <SelectItem value="INSTALL_ONLY">Reinstall Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes / Special Conditions</Label>
              <Textarea value={fields.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Any special conditions, access notes, or customer requests..."
                rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" variant="solar" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Changes
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/bids/${id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
