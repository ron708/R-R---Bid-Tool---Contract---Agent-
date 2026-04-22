import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Global Solarponics config — real company info from contract form 25-003-A-SVC
  await prisma.solarponicsConfig.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      companyName: "Solarponics Inc.",
      licenseNumber: "CSLB#391670",
      address: "4700 El Camino Real",
      city: "Atascadero",
      state: "CA",
      zip: "93422",
      phone: "(805) 466-5595",
      email: "info@solarponics.com",
      website: "https://solarponics.com",
      termsConditions: `SOLAR PANEL REMOVE & REPLACE (R&R) — TERMS AND CONDITIONS

1. SCOPE OF WORK: Solarponics Inc. will perform the solar system remove and replace (R&R) services as described in this agreement. Work will be performed by Solarponics technicians and/or its authorized Strategic Partner.

2. PAYMENT: A deposit of 10% of the total contract price is due upon signing. The remaining 90% balance is due upon completion of work. Payment is accepted by check, ACH, or credit card.

3. WARRANTY: Solarponics Inc. warrants all labor performed under this agreement for a period of one (1) year from the date of completion. Equipment and component warranties are provided per manufacturer terms and are separate from this labor warranty.

4. PERMITS: Permit fees, if included in this proposal, cover standard permit processing. Any additional fees imposed by local municipalities beyond standard permitting are the responsibility of the property owner.

5. SITE CONDITIONS: Solarponics Inc. is not responsible for pre-existing roof damage, wiring deficiencies, micro-cracking of panels, or equipment failures discovered during removal. Any additional work required will be quoted separately before proceeding.

6. PREEXISTING CONDITIONS: Customer acknowledges that solar equipment being removed may have pre-existing damage not caused by Solarponics or its Strategic Partner. A preexisting conditions inspection report will be provided upon request.

7. CANCELLATION: Customer has the right to cancel this contract within five (5) business days of signing without penalty (California Right to Cancel). Cancellation after five business days but before the scheduled work date may result in a cancellation fee of up to 20% of the contract value to cover mobilization costs.

8. ACCESS: Customer agrees to provide safe, unobstructed access to the roof, attic (if applicable), and electrical systems on the scheduled work date. Failure to provide access may result in a rescheduling fee.

9. PHOTOGRAPHS: Solarponics Inc. and/or its Strategic Partner will photograph the site before, during, and after work for quality assurance, documentation, and warranty purposes.

10. HAZARDOUS CONDITIONS: If unsafe conditions are discovered on the job site (electrical hazards, structural concerns, etc.), Solarponics reserves the right to halt work until conditions are corrected by the appropriate contractor.

11. GOVERNING LAW: This agreement shall be governed by the laws of the State of California. Any disputes arising under this agreement shall be resolved in San Luis Obispo County, California.

12. ENTIRE AGREEMENT: This document, including any attached scope of work and pricing schedule, constitutes the entire agreement between the parties and supersedes all prior oral or written representations.

©2025 Solarponics Inc. | 4700 El Camino Real, Atascadero, CA 93422 | (805) 466-5595 | CSLB#391670`,
    },
  });

  // Default pricing config — real rates from Solarponics Excel bid tool (OVERHEAD COST SHEET)
  await prisma.defaultPricingConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      inflationRate: 0.03,           // 3% of parts (material cost inflation buffer)
      salesTaxRate: 0.0875,          // 8.75% CA sales tax on parts + inflation
      freightMin: 75,                // minimum $75 freight / receiving charge
      truckRatePerMile: 6.25,        // $6.25/mile truck expense
      laborDailyRatePerPerson: 430,  // $430/person/day crew labor
      warrantyReserveRate: 0.13,     // 13% of (parts + labor) for warranty reserve
      liabilityInsuranceRate: 0.0922,// 9.22% of all other costs for liability insurance
      profitMargin: 0.35,            // 35% target gross margin for service work
    },
  });

  // Solarponics admin user
  const adminPassword = await bcrypt.hash("Admin@Solarponics1!", 12);
  await prisma.user.upsert({
    where: { email: "admin@solarponics.com" },
    update: {},
    create: {
      email: "admin@solarponics.com",
      name: "Solarponics Admin",
      password: adminPassword,
      role: UserRole.SOLARPONICS_ADMIN,
    },
  });

  // Demo roofing partner
  const partner = await prisma.contractor.upsert({
    where: { email: "demo@roofingpartner.com" },
    update: {},
    create: {
      name: "Demo Roofing Co.",
      email: "demo@roofingpartner.com",
      phone: "805-555-0100",
      address: "123 Main St",
      city: "Santa Barbara",
      state: "CA",
      zip: "93101",
      licenseNumber: "DEMO-12345",
    },
  });

  const partnerPassword = await bcrypt.hash("Partner@Demo1!", 12);
  await prisma.user.upsert({
    where: { email: "estimator@demo.com" },
    update: {},
    create: {
      email: "estimator@demo.com",
      name: "Demo Estimator",
      password: partnerPassword,
      role: UserRole.PARTNER_OWNER,
      contractorId: partner.id,
    },
  });

  console.log("Seed complete.");
  console.log("Admin login:   admin@solarponics.com / Admin@Solarponics1!");
  console.log("Partner login: estimator@demo.com / Partner@Demo1!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
