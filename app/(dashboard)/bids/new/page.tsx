import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BidFormWizard } from "@/components/bid-form/bid-form-wizard";

export default async function NewBidPage() {
  const session = await getServerSession(authOptions);
  const customers = await prisma.customer.findMany({
    where: { contractorId: session!.user.contractorId! },
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true, siteAddress: true, siteCity: true, siteState: true, siteZip: true, email: true, phone: true },
  });

  const defaultRates = await prisma.defaultPricingConfig.findUnique({ where: { id: "default" } });

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">New Solar R&R Bid</h1>
      <BidFormWizard customers={customers} defaultRates={defaultRates} />
    </div>
  );
}
