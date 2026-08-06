import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ONE-TIME SETUP ENDPOINT — delete this file after use
// Usage: GET /api/setup?token=solar-setup-2025
const SETUP_TOKEN = "solar-setup-2025";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (token !== SETUP_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`;
    results.push("✓ Database connection OK");
  } catch (err) {
    return NextResponse.json({
      error: "Database connection failed",
      detail: String(err),
      results,
    }, { status: 500 });
  }

  // Check / create admin user
  const adminEmail = "admin@solarponics.com";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    results.push(`✓ Admin user already exists (${adminEmail})`);
  } else {
    const hashed = await bcrypt.hash("Admin@Solarponics1!", 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Solarponics Admin",
        password: hashed,
        role: "SOLARPONICS_ADMIN",
      },
    });
    results.push(`✓ Admin user created: ${adminEmail} / Admin@Solarponics1!`);
  }

  // Ensure SolarponicsConfig singleton exists
  const config = await prisma.solarponicsConfig.findUnique({ where: { id: "singleton" } });
  if (!config) {
    await prisma.solarponicsConfig.create({
      data: {
        id: "singleton",
        companyName: "Solarponics Inc.",
        licenseNumber: "CSLB#391670",
        address: "4700 El Camino Real",
        city: "Atascadero",
        state: "CA",
        zip: "93422",
        phone: "(805) 466-5595",
        email: "Ron@Solarponics.com",
        website: "https://solarponics.com",
      },
    });
    results.push("✓ Solarponics config created");
  } else {
    results.push("✓ Solarponics config already exists");
  }

  // Ensure DefaultPricingConfig exists
  const pricing = await prisma.defaultPricingConfig.findUnique({ where: { id: "default" } });
  if (!pricing) {
    await prisma.defaultPricingConfig.create({
      data: {
        id: "default",
        inflationRate: 0.03,
        salesTaxRate: 0.0875,
        freightMin: 75,
        truckRatePerMile: 6.25,
        laborDailyRatePerPerson: 430,
        warrantyReserveRate: 0.13,
        liabilityInsuranceRate: 0.0922,
        profitMargin: 0.35,
      },
    });
    results.push("✓ Default pricing config created");
  } else {
    results.push("✓ Default pricing config already exists");
  }

  return NextResponse.json({ ok: true, results });
}
