import { CharacterTextSplitter } from "langchain/text_splitter";

export async function textSplitter(str: string) {
  const splitter = new CharacterTextSplitter({
    separator: " ",
    chunkSize: 512,
    chunkOverlap: 24,
  });

  const output = await splitter.createDocuments([str]);
  return output
}