import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "./contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GNS3 Scenario Builder",
  description: "Create and deploy network lab scenarios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} flex flex-col min-h-screen font-sans antialiased`}>
        <ThemeProvider>
          <main className="flex-grow bg-[var(--background)] text-[var(--foreground)]">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
