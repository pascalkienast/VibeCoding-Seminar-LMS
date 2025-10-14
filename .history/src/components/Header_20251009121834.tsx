"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Header() {
  const pathname = usePathname();
  if (pathname?.startsWith("/login") || pathname?.startsWith("/register")) {
    return null;
  }
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="container py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <Link href="/news" aria-label="Home" className="font-medium">Home</Link>
          <Link href="/lehrplan" aria-label="Lehrplan">Lehrplan</Link>
          <Link href="/forum" aria-label="Forum">Forum</Link>
        </div>
        <Navbar />
      </div>
    </header>
  );
}


