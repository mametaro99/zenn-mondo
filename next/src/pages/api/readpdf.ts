export const config = {
  runtime: "nodejs",  // Node.jsランタイムを使用する
  api: {
  bodyParser: {
    sizeLimit: '10mb' // Set desired value here
  }
}
};

import { NextApiRequest, NextApiResponse } from "next";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { promises as fsPromises } from "fs";
import path from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { pdfBuffer } = req.body;

    if (!pdfBuffer) {
      return res.status(400).json({ error: "No PDF buffer provided" });
    }

    const tempFilePath = path.join("/tmp", `temp_${Date.now()}.pdf`);
    await fsPromises.writeFile(tempFilePath, Buffer.from(pdfBuffer));

    const loader = new PDFLoader(tempFilePath, { splitPages: false });
    const res_pdf_obj = await loader.load();

    await fsPromises.unlink(tempFilePath);

    if (res_pdf_obj.length === 0) {
      return res.status(400).json({ error: "Empty PDF content" });
    }

    const res_pdf = res_pdf_obj[0].pageContent.replace(/\n/g, " ").replace(/,/g, "");

    return res.status(200).json({ text: res_pdf });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return res.status(500).json({ error: "Failed to process PDF" });
  }
}
