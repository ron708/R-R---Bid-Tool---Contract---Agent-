"use client";

import { useState } from "react";
import { NavSidebar } from "@/components/nav-sidebar";
import { Menu, Sun } from "lucide-react";

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Desktop sidebar (always visible md+) ── */}
      <div className="hidden md:flex h-full">
        <NavSidebar />
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 h-full md:hidden
          transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <NavSidebar onClose={() => setOpen(false)} />
      </div>

      {/* ── Content area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-solar-green" />
            <span className="font-bold text-sm text-solar-green">Solarponics</span>
            <span className="text-xs text-muted-foreground hidden xs:inline">R&R Bid Tool</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
