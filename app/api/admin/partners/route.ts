import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendPartnerInviteEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "SOLARPONICS_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { companyName, loginEmail, password, phone, licenseNumber } = body;

  if (!companyName?.trim()) return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  if (!loginEmail?.trim()) return NextResponse.json({ error: "Login email is required" }, { status: 400 });
  if (!password || password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: loginEmail.trim().toLowerCase() } });
  if (existing) return NextResponse.json({ error: "A user with that email already exists" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);

  const contractor = await prisma.contractor.create({
    data: {
      name: companyName.trim(),
      email: loginEmail.trim().toLowerCase(),
      phone: phone?.trim() || null,
      licenseNumber: licenseNumber?.trim() || null,
    },
  });

  await prisma.user.create({
    data: {
      email: loginEmail.trim().toLowerCase(),
      name: companyName.trim(),
      password: hashed,
      role: "PARTNER_OWNER",
      contractorId: contractor.id,
    },
  });

  // Send welcome email with login credentials (non-blocking — don't fail the request if email fails)
  try {
    await sendPartnerInviteEmail({
      to: loginEmail.trim().toLowerCase(),
      companyName: companyName.trim(),
      password,
    });
  } catch (err) {
    console.error("Partner invite email failed:", err);
  }

  return NextResponse.json({ ok: true, contractorId: contractor.id }, { status: 201 });
}
