"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [profileLoading, setProfileLoading] = useState(false);
  const [integrationLoading, setIntegrationLoading] = useState(false);
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [integration, setIntegration] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings/profile").then((r) => r.json()).then(setProfile);
    fetch("/api/settings/integration").then((r) => r.json()).then(setIntegration);
  }, []);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setProfileLoading(false);
    if (res.ok) {
      const updated = await res.json();
      setProfile(updated);
      toast({ title: "Company profile saved" });
    } else {
      toast({ title: "Error saving profile", variant: "destructive" });
    }
  }

  async function saveIntegration(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIntegrationLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    const res = await fetch("/api/settings/integration", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setIntegrationLoading(false);
    if (res.ok) toast({ title: "Integration settings saved" });
    else toast({ title: "Error", variant: "destructive" });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Company Profile */}
      <form onSubmit={saveProfile}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company Profile</CardTitle>
            <CardDescription>
              Your company name appears as the <strong>Strategic Partner</strong> on all proposals sent to customers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={profile.name ?? ""}
                placeholder="e.g. Mid State Roofing"
              />
              <p className="text-xs text-muted-foreground">
                This name will appear in bold on the proposal header: <em>Strategic Partner: [Your Company Name]</em>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={profile.phone ?? ""}
                  placeholder="805-555-0100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={profile.email ?? ""}
                  placeholder="you@company.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Button type="submit" variant="solar" className="mt-4" disabled={profileLoading}>
          {profileLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save Company Profile
        </Button>
      </form>

      {/* Pipedrive Integration */}
      <form onSubmit={saveIntegration}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipedrive CRM Integration</CardTitle>
            <CardDescription>
              When you create a bid, a new Deal and Contact will be created automatically in your Pipedrive account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pipedrive API Key</Label>
              <Input
                name="pipedriveApiKey"
                type="password"
                defaultValue={integration.pipedriveApiKey ?? ""}
                placeholder="Your Pipedrive API token"
              />
              <p className="text-xs text-muted-foreground">Find this in Pipedrive → Settings → Personal → API</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pipeline ID (optional)</Label>
                <Input
                  name="pipedrivePipelineId"
                  defaultValue={integration.pipedrivePipelineId ?? ""}
                  placeholder="e.g. 1"
                />
              </div>
              <div className="space-y-2">
                <Label>Stage ID (optional)</Label>
                <Input
                  name="pipedriveStageId"
                  defaultValue={integration.pipedriveStageId ?? ""}
                  placeholder="e.g. 1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Button type="submit" variant="solar" className="mt-4" disabled={integrationLoading}>
          {integrationLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save Integration Settings
        </Button>
      </form>
    </div>
  );
}
