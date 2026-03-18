import "./globals.css";
import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Research Insight Engine",
  description: "Internal UX research insight discovery tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} antialiased`}>
        {children}
        <footer className="border-t border-slate-800/70 bg-slate-950/40 py-4 text-center text-xs text-slate-500">
          Commencis™️ 2026. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
