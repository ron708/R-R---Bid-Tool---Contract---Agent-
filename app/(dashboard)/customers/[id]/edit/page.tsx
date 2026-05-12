"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditCustomerPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    siteAddress: "", siteCity: "", siteState: "CA", siteZip: "",
  });

  useEffect(() => {
    fetch(`/api/customers/${id}`)
      .then((r) => r.json())
      .then((c) => setFields({
        firstName: c.firstName ?? "",
        lastName: c.lastName ?? "",
        email: c.email ?? "",
        phone: c.phone ?? "",
        siteAddress: c.siteAddress ?? "",
        siteCity: c.siteCity ?? "",
        siteState: c.siteState ?? "CA",
        siteZip: c.siteZip ?? "",
      }));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });

    setLoading(false);
    if (!res.ok) {
      toast({ title: "Error", description: "Failed to update customer.", variant: "destructive" });
      return;
    }
    toast({ title: "Customer updated" });
    router.push(`/customers/${id}`);
  }

  function set(field: string, value: string) {
    setFields((f) => ({ ...f, [field]: value }));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/customers/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Customer</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Customer Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                <Input id="firstName" required value={fields.firstName} onChange={(e) => set("firstName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                <Input id="lastName" required value={fields.lastName} onChange={(e) => set("lastName", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                <Input id="email" type="email" required value={fields.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
                <Input id="phone" type="tel" required value={fields.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteAddress">Site Address <span className="text-destructive">*</span></Label>
              <Input id="siteAddress" required value={fields.siteAddress} onChange={(e) => set("siteAddress", e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteCity">City</Label>
                <Input id="siteCity" value={fields.siteCity} onChange={(e) => set("siteCity", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteState">State</Label>
                <Input id="siteState" maxLength={2} className="uppercase" value={fields.siteState} onChange={(e) => set("siteState", e.target.value.toUpperCase())} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteZip">Zip</Label>
                <Input id="siteZip" value={fields.siteZip} onChange={(e) => set("siteZip", e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="solar" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/customers/${id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
