"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { MobileDrawer } from "./MobileDrawer";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/about", label: "À propos" },
  { href: "/initiatives", label: "Nos initiatives" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-navy shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan rounded">
              <span className="font-heading font-bold text-xl text-white">JCI</span>
              <span className="font-heading font-semibold text-cyan text-sm leading-tight hidden sm:block">
                Tabarre<br />Excelsior
              </span>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Navigation principale">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium font-heading transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan",
                    pathname === href
                      ? "text-cyan"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                  aria-current={pathname === href ? "page" : undefined}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* CTA + burger */}
            <div className="flex items-center gap-3">
              <Link
                href="/espace-membre/connexion"
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-heading font-medium text-white/90 border border-white/25 hover:border-cyan hover:text-cyan hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Espace Membre
              </Link>

              <Link href="/join" className="hidden md:block">
                <Button size="sm" variant="primary">
                  Nous rejoindre
                </Button>
              </Link>

              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                aria-label="Ouvrir le menu"
                aria-expanded={drawerOpen}
                aria-controls="mobile-menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navLinks={navLinks}
        currentPath={pathname}
      />
    </>
  );
}
