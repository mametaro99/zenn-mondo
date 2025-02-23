import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"; // fs を使うのでサーバー側

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("pdfFile") as File;

  if (!file) {
    return NextResponse.json({ error: "ファイルが選択されていません" }, { status: 400 });
  }

  // PDF をロード
  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: file.type });
  const loader = new PDFLoader(blob, { splitPages: false });
  const res_pdf_obj = await loader.load();

  return NextResponse.json({ data: res_pdf_obj });
}
