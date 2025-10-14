import type { Metadata } from "next";
import Header from "@/components/Header";
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
  description: "Einladungspflichtiges LMS MVP",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100`}>
        <div className="min-h-dvh flex flex-col">
          <Header />
          <main className="flex-1 container py-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
