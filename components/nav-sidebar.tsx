"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Sun,
  ShieldCheck,
  Building2,
  DollarSign,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const partnerLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bids/new", label: "New Bid", icon: FileText },
  { href: "/bids", label: "My Bids", icon: FileText },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

const adminLinks = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/bids", label: "Bids", icon: FileText },
  { href: "/admin/partners", label: "Partners", icon: Building2 },
  { href: "/admin/pricing", label: "Pricing", icon: DollarSign },
  { href: "/admin/branding", label: "Branding & T&C", icon: Palette },
];

interface NavSidebarProps {
  onClose?: () => void;
}

export function NavSidebar({ onClose }: NavSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "SOLARPONICS_ADMIN";
  const links = isAdmin ? adminLinks : partnerLinks;

  return (
    <aside className="flex flex-col h-full w-64 border-r bg-card shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <Sun className="h-7 w-7 text-solar-green shrink-0" />
        <div className="leading-tight">
          <p className="font-bold text-sm text-solar-green">Solarponics</p>
          <p className="text-xs text-muted-foreground">R&R Bid Tool</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {isAdmin && (
          <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Admin
          </p>
        )}
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              pathname === href || (href !== "/dashboard" && href !== "/admin/dashboard" && pathname.startsWith(href))
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-4 border-t">
        <p className="text-xs text-muted-foreground truncate mb-1">{session?.user?.name}</p>
        <p className="text-xs text-muted-foreground truncate mb-3">{session?.user?.email}</p>
        {session?.user?.contractorName && (
          <p className="text-xs font-medium truncate mb-3">{session.user.contractorName}</p>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </Button>
      </div>
    </aside>
  );
}
