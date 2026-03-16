# Research Insight Engine

Internal UX research insight discovery tool built with Next.js, Supabase, and OpenAI.

## Features

- Semantic search over past research reports using Supabase + pgvector.
- Retrieval of relevant report excerpts.
- AI-generated summaries **strictly grounded** in retrieved excerpts.
- Source citations with links back to the original report.

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment**

   Copy `.env.example` to `.env.local` and fill in values:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`

3. **Configure Supabase**

   - Enable the `pgvector` extension.
   - Run `db/schema.sql` in your Supabase SQL editor to create:
     - `research_chunks` table.
     - `match_insight_chunks` RPC for semantic search.

4. **Ingest research PDFs**

   - Place PDFs into `data/pdfs/`.
   - Run:

     ```bash
     npm run ingest
     ```

   - This will:
     - Extract text from PDFs.
     - Chunk the text.
     - Generate embeddings via OpenAI.
     - Insert chunks into `research_chunks`.

5. **Run the app**

   ```bash
   npm run dev
   ```

   Then open `http://localhost:3000`.

## Project structure

- `app/`
  - `layout.tsx` – Root layout & shell.
  - `page.tsx` – Main search page.
  - `search-client.tsx` – Client-side search UI.
  - `api/search/route.ts` – Search API: embed query, call Supabase, summarize.
- `lib/`
  - `supabase-server.ts` – Server-side Supabase client.
  - `embeddings.ts` – OpenAI embedding helpers.
  - `summarize.ts` – Grounded summarization helper.
- `scripts/`
  - `ingest-pdfs.ts` – CLI script to ingest and embed PDFs into Supabase.
- `db/schema.sql` – Supabase schema + search RPC.

## Notes

- `db/schema.sql` assumes `text-embedding-3-large` (3072 dims). Adjust `embedding vector(3072)` and RPC signature if you change models.
- Summaries are generated with `gpt-4.1-mini` and explicitly instructed to only use retrieved excerpts.

