import { Context, MilvusVectorDatabase, OpenAIEmbedding } from "@zilliz/claude-context-core";

const targetPath = process.argv[2];

if (!targetPath) {
  throw new Error("Usage: node index.mjs <absolute-path>");
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

if (!process.env.MILVUS_TOKEN) {
  throw new Error("MILVUS_TOKEN is required");
}

const embedding = new OpenAIEmbedding({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
});

const vectorDatabase = new MilvusVectorDatabase({
  address: process.env.MILVUS_ADDRESS,
  token: process.env.MILVUS_TOKEN,
});

const context = new Context({
  embedding,
  vectorDatabase,
});

const forceReindex = process.env.FORCE_REINDEX === "1";

const stats = await context.indexCodebase(
  targetPath,
  (progress) => {
    const percentage =
      typeof progress?.percentage === "number"
        ? ` ${progress.percentage.toFixed(1)}%`
        : "";
    console.log(`[index] ${progress.phase}${percentage}`);
  },
  forceReindex,
);

console.log(`[done] indexedFiles=${stats.indexedFiles} totalChunks=${stats.totalChunks}`);

const results = await context.semanticSearch(targetPath, "Next.js app router localization", 3);
console.log(`[search] results=${results.length}`);

for (const result of results) {
  console.log(`[hit] ${result.relativePath}:${result.startLine}-${result.endLine}`);
}
