"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  navLinks: { href: string; label: string }[];
  currentPath: string;
}

export function MobileDrawer({ open, onClose, navLinks, currentPath }: MobileDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-72 bg-navy shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <span className="font-heading font-bold text-white text-lg">Menu</span>
          <button
            ref={closeRef}
            onClick={onClose}
            className="p-2 rounded-lg text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            aria-label="Fermer le menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 flex flex-col p-5 gap-1" aria-label="Menu mobile">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "px-4 py-3 rounded-lg text-sm font-medium font-heading transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan",
                currentPath === href
                  ? "bg-cyan/20 text-cyan"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
              aria-current={currentPath === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-5 border-t border-white/10">
          <Link href="/join" onClick={onClose}>
            <Button variant="primary" className="w-full">
              Nous rejoindre
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
