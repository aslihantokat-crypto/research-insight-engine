import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
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

      const { error } = await supabase.from("research_chunks").insert({
        report_id: reportId,
        report_title: reportTitle,
        page_number: null,
        content,
        embedding
      });

      if (error) {
        console.error(
          `Failed to insert chunk ${index} for ${file}:`,
          error.message
        );
      }
    }
  }

  console.log("Ingestion complete.");
}

ingest().catch((err) => {
  console.error("Ingestion failed", err);
  process.exit(1);
});

