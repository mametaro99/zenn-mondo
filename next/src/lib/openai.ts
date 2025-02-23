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
  });
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: apiKey,
  });
  const store = await MemoryVectorStore.fromDocuments(output, embeddings);
  const relevantDocs = await store.similaritySearch(question);
  const chain = loadQAMapReduceChain(llm);
  const res = await chain.call({
    input_documents: relevantDocs,
    question,
  });
  return res;
}