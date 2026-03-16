import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

type Citation = {
  id: string;
  reportId: string;
  reportTitle: string;
  excerpt: string;
  pageNumber: number | null;
  score: number;
  url: string | null;
};

export async function generateGroundedSummary(params: {
  query: string;
  citations: Citation[];
}): Promise<string> {
  const { query, citations } = params;

  if (!citations.length) {
    return "No relevant excerpts were found in the indexed research reports for this query.";
  }

  const sourceText = citations
    .map((c, idx) => {
      const label = `S${idx + 1}`;
      const metaParts = [
        c.reportTitle,
        typeof c.pageNumber === "number" ? `page ${c.pageNumber}` : null
      ].filter(Boolean);
      const meta = metaParts.join(", ");
      return `[${label}] (${meta})\n${c.excerpt}`;
    })
    .join("\n\n");

  const prompt = `
You are an assistant helping UX researchers rediscover insights from past research reports.

You must answer ONLY using the information in the provided excerpts.
Do not add any external knowledge or speculation.
If the excerpts do not contain enough information to answer, say so explicitly.

User query:
${query}

Excerpts (with source IDs):
${sourceText}

Instructions:
- Synthesize the key insights that directly answer the query.
- Call out patterns, tensions, and notable quotes when relevant.
- Be concise but specific.
- At the end of each paragraph, include inline source tags like [S1], [S2,S3].
- If there are conflicting findings across sources, highlight the disagreement.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "You ground answers strictly in provided excerpts." },
      { role: "user", content: prompt }
    ],
    temperature: 0.2
  });

  const text =
    completion.choices[0]?.message?.content?.trim() ||
    "Unable to generate a summary from the current excerpts.";

  return text;
}

