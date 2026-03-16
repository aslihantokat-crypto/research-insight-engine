import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../lib/supabase-server";
import { embedQuery } from "../../lib/embeddings";
import { generateGroundedSummary } from "../../lib/summarize";

const DEFAULT_TOP_K = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const query = body?.query;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Missing 'query' in request body" },
        { status: 400 }
      );
    }

    const embedding = await embedQuery(query);
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.rpc("match_insight_chunks", {
      query_embedding: embedding,
      match_count: DEFAULT_TOP_K
    });

    if (error) {
      console.error("[search] Supabase error", error);
      return NextResponse.json(
        { error: "Search failed", details: error.message },
        { status: 500 }
      );
    }

    const citations = (data || []).map((row: any) => ({
      id: row.id,
      reportId: row.report_id,
      reportTitle: row.report_title,
      excerpt: row.content,
      pageNumber: row.page_number ?? null,
      score: row.similarity ?? 0,
      url: row.report_url ?? null
    }));

    const summary = await generateGroundedSummary({
      query,
      citations
    });

    return NextResponse.json({ query, summary, citations });
  } catch (err: any) {
    console.error("[search] Unexpected error", err);
    return NextResponse.json(
      { error: "Unexpected error", details: err?.message },
      { status: 500 }
    );
  }
}

