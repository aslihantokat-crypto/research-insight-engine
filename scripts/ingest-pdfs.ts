import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";

// Load .env.local so ingest uses the same env as Next.js (dotenv/config only loads .env)
// Support running from either `app/` or repo root.
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), "..", ".env.local") });
dotenv.config();
import { embedText } from "../lib/embeddings";
import { createClient } from "@supabase/supabase-js";
import { PDFParse } from "pdf-parse";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const PDF_INPUT_DIR = path.join(process.cwd(), "data", "pdfs");

/** Verify Supabase credentials before ingesting; exit with clear message if invalid. */
async function verifySupabaseAccess(): Promise<void> {
  const { error } = await supabase.from("research_chunks").select("id").limit(1);
  if (error) {
    if (error.message === "Invalid API key" || (error as { code?: string }).code === "PGRST301") {
      console.error(
        "Supabase rejected the request: Invalid API key.\n" +
          "  → Check SUPABASE_SERVICE_ROLE_KEY in .env.local (Project Settings → API → service_role secret).\n" +
          "  → Ensure there are no extra spaces, quotes, or newlines in the value."
      );
    } else {
      console.error("Supabase error:", error.message);
    }
    process.exit(1);
  }
}

/** Log underlying cause of a fetch/network error so we can diagnose. */
function logInsertError(file: string, index: number, err: { message?: string; cause?: unknown }) {
  const msg = err.message ?? String(err);
  const fromSupabase = msg === "Invalid API key" ? " (Supabase: check SUPABASE_SERVICE_ROLE_KEY in .env.local)" : "";
  const cause = (err as { cause?: { message?: string; code?: string } }).cause;
  const detail = cause
    ? ` (cause: ${cause.code ?? "unknown"} ${cause.message ?? ""})`.trim()
    : "";
  console.error(
    `Failed to insert chunk ${index} for ${file}: ${msg}${fromSupabase}${detail}`
  );
}

async function loadPdf(filePath: string) {
  const buf = await fs.readFile(filePath);
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

type Chunk = {
  reportTitle: string;
  reportId: string;
  pageNumber: number | null;
  content: string;
};

function chunkText(fullText: string, opts?: { maxTokens?: number }): Chunk[] {
  // Very naive approximation: chunk by character length.
  const maxChars = (opts?.maxTokens ?? 400) * 4;
  const blocks: Chunk[] = [];

  const lines = fullText.split(/\n+/).map((l) => l.trim());
  let buffer: string[] = [];

  for (const line of lines) {
    if (!line) continue;
    const next = [...buffer, line].join("\n");
    if (next.length > maxChars) {
      if (buffer.length) {
        blocks.push({
          reportTitle: "",
          reportId: "",
          pageNumber: null,
          content: buffer.join("\n")
        });
        buffer = [line];
      } else {
        blocks.push({
          reportTitle: "",
          reportId: "",
          pageNumber: null,
          content: line
        });
        buffer = [];
      }
    } else {
      buffer.push(line);
    }
  }

  if (buffer.length) {
    blocks.push({
      reportTitle: "",
      reportId: "",
      pageNumber: null,
      content: buffer.join("\n")
    });
  }

  return blocks;
}

async function ingest() {
  await verifySupabaseAccess();

  const entries = await fs.readdir(PDF_INPUT_DIR);
  const pdfFiles = entries.filter((f) => f.toLowerCase().endsWith(".pdf"));

  if (!pdfFiles.length) {
    console.log("No PDF files found in", PDF_INPUT_DIR);
    return;
  }

  for (const file of pdfFiles) {
    const filePath = path.join(PDF_INPUT_DIR, file);
    const reportId = path.basename(file, path.extname(file));
    const reportTitle = reportId.replace(/[-_]/g, " ");

    console.log("Ingesting", filePath);
    const text = await loadPdf(filePath);
    const chunks = chunkText(text);

    for (const [index, chunk] of chunks.entries()) {
      const content = chunk.content;
      const embedding = await embedText(content);

      try {
        const { error } = await supabase.from("research_chunks").insert({
          report_id: reportId,
          report_title: reportTitle,
          page_number: null,
          content,
          embedding
        });

        if (error) {
          logInsertError(file, index, error as { message?: string; cause?: unknown });
        }
      } catch (err) {
        logInsertError(file, index, err as { message?: string; cause?: unknown });
      }
    }
  }

  console.log("Ingestion complete.");
}

ingest().catch((err) => {
  console.error("Ingestion failed", err);
  process.exit(1);
});

