"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { BidFormData } from "./bid-form-wizard";

interface Props {
  form: BidFormData;
  update: (patch: Partial<BidFormData>) => void;
  customers: { id: string; firstName: string; lastName: string; siteAddress: string; siteCity: string | null }[];
}

export function StepCustomer({ form, update, customers }: Props) {
  const selected = customers.find((c) => c.id === form.customerId);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Customer *</Label>
        <Select value={form.customerId} onValueChange={(v) => update({ customerId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a customer..." />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.firstName} {c.lastName} — {c.siteAddress}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected && (
        <div className="bg-muted rounded-lg p-4 text-sm space-y-1">
          <p className="font-semibold">{selected.firstName} {selected.lastName}</p>
          <p className="text-muted-foreground">{selected.siteAddress}{selected.siteCity ? `, ${selected.siteCity}` : ""}</p>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Customer not listed?{" "}
        <Button variant="link" className="p-0 h-auto text-sm" asChild>
          <Link href="/customers/new" target="_blank"><Plus className="h-3 w-3" /> Add new customer</Link>
        </Button>
        {" "}(opens in new tab — come back to continue)
      </p>
    </div>
  );
}
