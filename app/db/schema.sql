-- Core table holding embedded chunks of research reports.
create table if not exists public.research_chunks (
  id uuid primary key default gen_random_uuid(),
  report_id text not null,
  report_title text not null,
  report_url text,
  page_number integer,
  content text not null,
  embedding vector(1536), -- adjust to match your embedding model dimensionality
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Basic index for filtering by report.
create index if not exists research_chunks_report_id_idx
  on public.research_chunks (report_id);

-- Vector index for semantic search (pgvector).
-- Requires the pgvector extension and appropriate dimensionality.
create index if not exists research_chunks_embedding_idx
  on public.research_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- RPC helper for semantic search using pgvector.
create or replace function public.match_insight_chunks (
  query_embedding vector(1536),
  match_count int default 10,
  filter_report_id text default null
)
returns table (
  id uuid,
  report_id text,
  report_title text,
  report_url text,
  page_number integer,
  content text,
  similarity float
) as $$
begin
  return query
  select
    rc.id,
    rc.report_id,
    rc.report_title,
    rc.report_url,
    rc.page_number,
    rc.content,
    1 - (rc.embedding <=> query_embedding) as similarity
  from public.research_chunks rc
  where filter_report_id is null or rc.report_id = filter_report_id
  order by rc.embedding <=> query_embedding
  limit match_count;
end;
$$ language plpgsql stable;

