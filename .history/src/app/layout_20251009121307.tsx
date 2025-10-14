import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vibe Coding",
  description: "Invite-only LMS MVP",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100`}>
        <div className="min-h-dvh flex flex-col">
          <header className="border-b border-neutral-200 dark:border-neutral-800">
            <div className="container py-3 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <Link href="/" aria-label="Home" className="font-medium">Home</Link>
                <Link href="/lehrplan" aria-label="Lehrplan">Lehrplan</Link>
                <Link href="/forum" aria-label="Forum">Forum</Link>
              </div>
              <Navbar />
            </div>
          </header>
          <main className="flex-1 container py-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
