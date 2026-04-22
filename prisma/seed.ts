import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Global Solarponics config
  await prisma.solarponicsConfig.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      companyName: "Solarponics Inc.",
      licenseNumber: "",
      address: "",
      city: "",
      state: "CA",
      zip: "",
      phone: "",
      email: "info@solarponics.com",
      website: "https://solarponics.com",
      termsConditions: `TERMS AND CONDITIONS

1. SCOPE OF WORK: Solarponics Inc. will perform the solar system remove and replace (R&R) services as described in this proposal.

2. PAYMENT: Payment is due upon completion of work unless otherwise agreed in writing.

3. WARRANTY: Labor warranty of 1 year from date of completion. Equipment warranty per manufacturer terms.

4. PERMITS: Permit fees, if included in this proposal, cover standard permit processing. Additional fees due to municipal requirements are the responsibility of the property owner.

5. SITE CONDITIONS: Contractor is not responsible for pre-existing roof damage discovered during removal.

6. CANCELLATION: Cancellation within 72 hours of scheduled work date may result in a cancellation fee.

7. GOVERNING LAW: This agreement shall be governed by the laws of the State of California.`,
    },
  });

  // Default pricing config — PLACEHOLDER values to be replaced with actual Excel bid tool rates
  await prisma.defaultPricingConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      // PLACEHOLDER RATES — replace after Excel bid tool review
      panelRemoval: 35,
      railRemovalPerFt: 2.5,
      attachmentRemoval: 8,
      panelInstall: 45,
      railInstallPerFt: 3.5,
      attachmentInstall: 12,
      pitchAdderMedium: 5,
      pitchAdderSteep: 15,
      storyAdder: 8,
      permitFee: 350,
      inspectionFee: 150,
      laborRatePerHour: 85,
      travelFlatFee: 0,
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
