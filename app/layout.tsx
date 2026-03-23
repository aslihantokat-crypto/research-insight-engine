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
    <html lang="en" className="h-full bg-slate-950">
      <body
        className={`${inter.variable} ${mono.variable} h-full min-h-screen bg-slate-950 text-slate-50 antialiased flex flex-col`}
      >
        <main className="flex-1">{children}</main>

        <footer className="mt-24 border-t border-white/5 bg-gradient-to-b from-transparent to-slate-950 py-6">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs text-slate-500">
              Commencis™️ 2026. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
