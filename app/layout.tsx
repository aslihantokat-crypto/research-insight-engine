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
        <footer className="mt-8 border-t border-slate-800/60 bg-gradient-to-b from-slate-950/0 via-slate-950/30 to-slate-950/60 py-5 text-center text-xs text-slate-400">
          Commencis™️ 2026. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
