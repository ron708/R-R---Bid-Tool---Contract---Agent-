"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Plus, X } from "lucide-react";

export function AddPartnerForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const password = form.get("password") as string;
    const confirmPassword = form.get("confirmPassword") as string;
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: form.get("companyName"),
        loginEmail: form.get("loginEmail"),
        password,
        phone: form.get("phone"),
        licenseNumber: form.get("licenseNumber"),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      toast({ title: "Error", description: data.error ?? "Failed to create partner", variant: "destructive" });
      return;
    }

    toast({ title: "Partner created", description: "They can now log in with the credentials you set." });
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="solar" className="flex items-center gap-2">
        <Plus className="h-4 w-4" /> Add Strategic Partner
      </Button>
    );
  }

  return (
    <Card className="border-solar-green/40 shadow-md">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base">Add New Strategic Partner</CardTitle>
          <CardDescription>Creates a company account and login credentials in one step.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Company Info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Company Info</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Company Name <span className="text-destructive">*</span></Label>
                <Input id="companyName" name="companyName" required placeholder="Mid State Roofing" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Company Phone</Label>
                <Input id="phone" name="phone" type="tel" placeholder="805-555-0100" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input id="licenseNumber" name="licenseNumber" placeholder="CSLB #123456" />
              </div>
            </div>
          </div>

          {/* Login Credentials */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Login Credentials</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="loginEmail">Login Email <span className="text-destructive">*</span></Label>
                <Input id="loginEmail" name="loginEmail" type="email" required placeholder="estimator@midstateroofing.com" />
                <p className="text-xs text-muted-foreground">This will be their username to sign in.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                <Input id="password" name="password" type="password" required minLength={8} placeholder="Min 8 characters" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} placeholder="Re-enter password" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" variant="solar" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Partner Account
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
