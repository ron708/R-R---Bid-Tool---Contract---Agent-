"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [integration, setIntegration] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings/integration").then((r) => r.json()).then(setIntegration);
  }, []);

  async function saveIntegration(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    const res = await fetch("/api/settings/integration", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);
    if (res.ok) toast({ title: "Settings saved" });
    else toast({ title: "Error", variant: "destructive" });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

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
        <Button type="submit" variant="solar" className="mt-4" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </form>
    </div>
  );
}
