import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research Insight Engine",
  description: "Internal UX research insight discovery tool"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8">
          <header className="mb-8 border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-semibold tracking-tight">
              Research Insight Engine
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Search past UX research, retrieve grounded excerpts, and generate
              trustworthy summaries.
            </p>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-500">
            Built for internal UX research discovery.
          </footer>
        </div>
      </body>
    </html>
  );
}

