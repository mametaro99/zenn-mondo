"use server";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import path from "path";

/**
 * PDF の内容を読み取る関数
 * @param pdfBuffer PDF ファイルの ArrayBuffer
 * @returns テキスト化した PDF 内容
 * 
 */

const fsPromises = require("fs").promises;
export async function readPdf(pdfBuffer: ArrayBuffer) {
  console.log("fsPromises:", fsPromises); // ← ここを追加
  try {
    // 一時ファイルの作成
    const tempFilePath = path.join("/tmp", `temp_${Date.now()}.pdf`);
    await fsPromises.writeFile(tempFilePath, Buffer.from(pdfBuffer)); // ← ここを修正

    // PDF をロード
    const loader = new PDFLoader(tempFilePath, { splitPages: false });
    const res_pdf_obj = await loader.load();

    // 読み取り後、一時ファイルを削除
    await fsPromises.unlink(tempFilePath); // ← ここを修正

    if (res_pdf_obj.length === 0) {
      throw new Error("PDF の解析結果が空です");
    }

    const res_pdf = res_pdf_obj[0].pageContent
      .replace(/\n/g, " ")
      .replace(/,/g, "");

    return res_pdf;
  } catch (error) {
    console.error("Error reading PDF:", error);
    throw new Error("PDF の読み取りに失敗しました");
  }
}
