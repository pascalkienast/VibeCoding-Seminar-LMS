"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/login") || pathname?.startsWith("/register")) {
    return null;
  }
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="container py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <Link href="/news" aria-label="Start" className="font-medium">Start</Link>
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/lehrplan" aria-label="Lehrplan">Lehrplan</Link>
            <Link href="/forum" aria-label="Q&A">Q&A</Link>
            <Link href="/projekte" aria-label="Projekte">Projekte</Link>
            <Link href="/tools" aria-label="Tools">Tools</Link>
            <Link href="/ideen-generator" aria-label="Ideen-Generator">Ideen-Generator</Link>
          </div>
        </div>
        <div className="hidden sm:block">
          <Navbar />
        </div>
        <button
          aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          className="sm:hidden inline-flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 p-2"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {/* Hamburger / X icon */}
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>
      {/* Mobile dropdown panel */}
      {mobileOpen && (
          <div id="mobile-menu" className="sm:hidden border-t border-neutral-200 dark:border-neutral-800">
          <div className="container py-3 flex flex-col gap-3 text-sm">
            <Link href="/lehrplan" aria-label="Lehrplan" className="py-1">Lehrplan</Link>
            <Link href="/forum" aria-label="Q&A" className="py-1">Q&A</Link>
            <Link href="/projekte" aria-label="Projekte" className="py-1">Projekte</Link>
            <Link href="/tools" aria-label="Tools" className="py-1">Tools</Link>
            <Link href="/ideen-generator" aria-label="Ideen-Generator" className="py-1">Ideen-Generator</Link>
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800" />
            <Navbar layout="vertical" />
          </div>
        </div>
      )}
    </header>
  );
}


