import type { Metadata } from "next";
import Link from "next/link";
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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100`}>
        <div className="min-h-dvh flex flex-col">
          <main className="flex-1 container py-4">{children}</main>
          <nav className="sticky bottom-0 border-t border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur bottom-safe-area">
            <ul className="grid grid-cols-4 text-sm">
              <li>
                <Link href="/" className="block text-center p-3" aria-label="Home">Home</Link>
              </li>
              <li>
                <Link href="/lehrplan" className="block text-center p-3" aria-label="Lehrplan">Lehrplan</Link>
              </li>
              <li>
                <Link href="/forum" className="block text-center p-3" aria-label="Forum">Forum</Link>
              </li>
              <li>
                <Link href="/profile" className="block text-center p-3" aria-label="Profile">Profile</Link>
              </li>
            </ul>
          </nav>
        </div>
      </body>
    </html>
  );
}
