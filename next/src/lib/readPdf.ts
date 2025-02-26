"use server";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import path from "path";

export async function readPdf(pdfFile: string) {
  const loader = new PDFLoader(pdfFile, { splitPages: false });
  const res_pdf_obj = await loader.load();
  const res_pdf = res_pdf_obj[0].pageContent
    .replace(/\n/g, " ")
    .replace(/,/g, "");
  return res_pdf;
}

export async function getStaticProps() {
  const pdfFilePath = path.join(process.cwd(), 'path/to/your/pdf/file.pdf');
  const pdfContent = await readPdf(pdfFilePath);

  return {
    props: {
      pdfContent,
    },
  };
}