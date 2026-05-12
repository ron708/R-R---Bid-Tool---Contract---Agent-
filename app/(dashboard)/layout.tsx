import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MobileLayout } from "@/components/mobile-layout";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role === "SOLARPONICS_ADMIN") redirect("/admin/dashboard");

  return <MobileLayout>{children}</MobileLayout>;
}
