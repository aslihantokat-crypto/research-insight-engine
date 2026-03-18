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
      <body
        className={`${inter.variable} ${mono.variable} min-h-screen antialiased flex flex-col`}
      >
        <div className="flex-1">{children}</div>

        <footer className="mt-24 border-t border-white/5 bg-gradient-to-b from-transparent to-slate-950 py-6">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs text-slate-500 sm:text-left">
              Commencis™️ 2026. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
