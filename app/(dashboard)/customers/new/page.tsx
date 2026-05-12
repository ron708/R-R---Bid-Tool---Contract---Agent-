"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);
    if (!res.ok) {
      toast({ title: "Error", description: "Failed to create customer.", variant: "destructive" });
      return;
    }
    const customer = await res.json();
    toast({ title: "Customer added" });
    router.push(`/customers/${customer.id}`);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/customers"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <h1 className="text-2xl font-bold">Add Customer</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Customer Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                <Input id="firstName" name="firstName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                <Input id="lastName" name="lastName" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
                <Input id="phone" name="phone" type="tel" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteAddress">Site Address <span className="text-destructive">*</span></Label>
              <Input id="siteAddress" name="siteAddress" required placeholder="123 Main St" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteCity">City</Label>
                <Input id="siteCity" name="siteCity" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteState">State</Label>
                <Input id="siteState" name="siteState" defaultValue="CA" maxLength={2} className="uppercase" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteZip">Zip</Label>
                <Input id="siteZip" name="siteZip" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="solar" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Customer
              </Button>
              <Button type="button" variant="outline" asChild><Link href="/customers">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
