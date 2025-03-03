import { loadQAMapReduceChain } from "langchain/chains";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "@langchain/openai";
import { OpenAI } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

export async function openAiApi(
  apiKey: string,
  question: string,
  output: Document<Record<string, any>>[]
) {
  const llm = new OpenAI({
    openAIApiKey: apiKey,
    temperature: 0.7, // 創造性の調整 (0.7はバランスが取れている)
    maxTokens: 2000, // 最大出力トークン数
  });

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: apiKey,
  });

  const store = await MemoryVectorStore.fromDocuments(output, embeddings);
  const relevantDocs = await store.similaritySearch(question);
  const chain = loadQAMapReduceChain(llm, {
  });

  const res = await chain.call({
    input_documents: relevantDocs,
    question,
  });

  return res;
}
