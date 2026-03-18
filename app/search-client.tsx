 "use client";

import { useState } from "react";

type Citation = {
  id: string;
  reportId: string;
  reportTitle: string;
  excerpt: string;
  pageNumber: number | null;
  score: number;
  url: string | null;
};

type SearchResponse = {
  query: string;
  summary: string;
  citations: Citation[];
};

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async (q: string) => {
    if (!q.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Search failed");
      }

      const data: SearchResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await runSearch(query);
  };

  const evidenceCount = result?.citations?.length ?? 0;
  const uniqueReports = result
    ? new Set(result.citations.map((c) => c.reportId)).size
    : 0;
  const avgScore = result
    ? result.citations.reduce((sum, c) => sum + (c.score ?? 0), 0) /
      Math.max(1, evidenceCount)
    : 0;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-12">
      <section className="space-y-7">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
              COMMENCIS RESEARCH INSIGHT ENGINE
            </p>
            <span className="rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1 text-[11px] font-medium text-slate-300">
              Grounded in internal studies
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            Ask a question. Get a research-ready answer.
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-400">
            Generate a deliverable-style summary backed by scannable evidence.
            Every claim is grounded in retrieved excerpts from Commencis
            research repository.
          </p>
        </div>

        <form onSubmit={handleSearch} className="pt-1">
          <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/40 p-3 shadow-xl shadow-slate-950/30">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-950/70 px-4 py-4 ring-1 ring-slate-800 focus-within:ring-2 focus-within:ring-indigo-400/70">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/90 text-slate-950 shadow-sm">
                <span className="text-lg" aria-hidden>
                  ⌕
                </span>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kullanıcıların kart başvuru sürecinde en sık karşılaştıkları kullanılabilirlik sorunları nedir?"
                className="flex-1 bg-transparent text-base text-slate-50 placeholder:text-slate-500 outline-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                {isLoading ? "Searching…" : "Search"}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-2 text-[11px] text-slate-500">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-950/50 px-2 py-1">
                  Tip: ask for “top themes” + key quotes
                </span>
                <span className="rounded-full bg-slate-950/50 px-2 py-1">
                  Tip: add segment or timeframe
                </span>
              </div>
              <span className="rounded-full bg-slate-950/50 px-2 py-1">
                Output: summary + evidence
              </span>
            </div>
          </div>
        </form>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

      {error && (
        <div className="rounded-2xl border border-red-900/60 bg-red-950/60 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {result && (
        <section className="space-y-4">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

          <div className="grid gap-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl shadow-slate-950/30">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Insight summary
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-500">
                    This summary is generated only from retrieved excerpts. Use
                    it as a draft research readout.
                  </p>
                </div>
                <span className="rounded-full border border-slate-800 bg-slate-950/50 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                  Report draft
                </span>
              </div>

              <div className="mt-5 grid gap-4">
                <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-950/60 to-slate-950/30 p-5">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_55%)]" />
                  <div className="relative space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                        Highlighted summary
                      </p>
                      <span className="rounded-full bg-slate-900/60 px-2 py-1 text-[10px] font-medium text-slate-300">
                        Query: {result.query}
                      </span>
                    </div>
                    <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                      <p className="whitespace-pre-wrap">{result.summary}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Evidence items
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-100">
                      {evidenceCount}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Unique reports
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-100">
                      {uniqueReports}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Avg relevance
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-100">
                      {avgScore.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/30 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Evidence
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-500">
                    Scan by source, then open the report for full context.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-950/60 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                    Sorted by relevance
                  </span>
                </div>
              </div>

              <ol className="mt-5 space-y-3 overflow-auto pr-1 text-sm">
                {result.citations.map((c, idx) => {
                  const score = c.score ?? 0;
                  const clamped = Math.max(0, Math.min(1, score));
                  const width = `${Math.round(clamped * 100)}%`;

                  return (
                    <li
                      key={c.id}
                      className="rounded-3xl border border-slate-800 bg-slate-950/35 p-5 shadow-sm shadow-slate-950/30 hover:border-indigo-400/40"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                              Evidence {idx + 1}
                            </span>
                            {typeof c.pageNumber === "number" && (
                              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                                Page {c.pageNumber}
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-slate-400">
                            {c.reportTitle}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <div className="w-28">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-900">
                              <div
                                className="h-full rounded-full bg-indigo-400"
                                style={{ width }}
                              />
                            </div>
                            <p className="mt-1 text-[10px] font-medium text-slate-500">
                              relevance {score.toFixed(3)}
                            </p>
                          </div>
                          {c.url && (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-2xl border border-slate-800 bg-slate-900/40 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-indigo-400/60 hover:text-white"
                            >
                              Open
                              <span aria-hidden>↗</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/45 p-4">
                        <p className="text-xs font-medium text-slate-500">
                          Excerpt
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-100">
                          {c.excerpt}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-4 text-sm text-slate-400">
          Filters sidebar (future)
        </div>
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-4 text-sm text-slate-400">
          Study metadata drawer (future)
        </div>
      </section>
    </div>
  );
}

