"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Link2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function BrandingPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/config").then((r) => r.json()).then(setConfig);

    const adobeStatus = searchParams.get("adobeSign");
    if (adobeStatus === "connected") toast({ title: "Adobe Sign connected!" });
    if (adobeStatus === "error") toast({ title: "Adobe Sign error", description: searchParams.get("msg") ?? undefined, variant: "destructive" });
  }, [searchParams]);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    const res = await fetch("/api/admin/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);
    if (res.ok) toast({ title: "Saved" });
    else toast({ title: "Error saving config", variant: "destructive" });
  }

  async function connectAdobeSign() {
    const res = await fetch("/api/adobe-sign/oauth-url");
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Branding & Settings</h1>

      <form onSubmit={save} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Solarponics Company Info</CardTitle>
            <CardDescription>Appears on all generated proposals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input name="companyName" defaultValue={config.companyName} />
              </div>
              <div className="space-y-2">
                <Label>License Number</Label>
                <Input name="licenseNumber" defaultValue={config.licenseNumber} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input name="address" defaultValue={config.address} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input name="city" defaultValue={config.city} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input name="state" defaultValue={config.state} />
              </div>
              <div className="space-y-2">
                <Label>Zip</Label>
                <Input name="zip" defaultValue={config.zip} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input name="phone" defaultValue={config.phone} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="email" defaultValue={config.email} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Terms & Conditions</CardTitle>
            <CardDescription>Printed on every proposal.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              name="termsConditions"
              defaultValue={config.termsConditions}
              rows={12}
              className="font-mono text-xs"
            />
          </CardContent>
        </Card>

        <Button type="submit" variant="solar" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adobe Acrobat Sign</CardTitle>
          <CardDescription>Connect your Adobe Sign account to enable e-signature on all proposals.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={connectAdobeSign}>
            <Link2 className="h-4 w-4" /> Connect Adobe Sign Account
          </Button>
          {config.adobeSignAccessToken && (
            <p className="text-sm text-green-600 mt-3">Adobe Sign is connected.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
