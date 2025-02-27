import React, { useState } from "react";
import { Box, Button, TextField, Typography, FormControl, FormLabel, FormHelperText, Input, Card, CardContent, Switch, CircularProgress, Alert } from "@mui/material";
import { Form, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { textSplitter } from "@/lib/textSplitter";
import { openAiApi } from "@/lib/openai";

type QuestionProps = {
  id: number;
  question_text: string;
  isReversedScore: boolean;
};

interface QuestionFormListProps {
  questions: QuestionProps[];
  questionManager: any;
  onDelete: (id: number) => void;
}



const fileSchema = z.object({
  question: z
    .string({ required_error: "質問を入力してください" })
    .min(1, { message: "質問を入力してください" }),
  apiKey: z.string().nonempty({ message: "OPENAI API KEYを入力してください" }),
  pdfFile: z.custom<FileList>().refine((file) => file && file.length !== 0, {
    message: "ファイルが選択されていません",
  }),
});


const QuestionFormList: React.FC<QuestionFormListProps> = ({ questions, questionManager, onDelete }) => {
  // react-hook-form setup

  const {
    register,
    handleSubmit: handleSubmitFile,
    formState: { errors },
  } = useForm({ resolver: zodResolver(fileSchema) });

  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [question,setQuestion] = useState('');

  const [text, setText] = useState<string>("");

  const form = useForm<z.infer<typeof fileSchema>>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      question: "",
      apiKey: "",
      pdfFile: undefined,
    },
  });


  async function onFileSubmit(values: z.infer<typeof fileSchema>) {
    try {
      setLoading(true);  // 処理中状態に設定
      setResponseMessage(null);  // 前のレスポンスメッセージをクリア
      setErrorMessage(null);  // 前のエラーメッセージをクリア
  
      if (!values.pdfFile || values.pdfFile.length === 0) {
        throw new Error("PDFファイルが選択されていません");
      }
  
      const file = values.pdfFile[0];
      console.log("Selected file:", file);
  
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
  
      fileReader.onload = async () => {
        try {
          const pdfBuffer = fileReader.result as ArrayBuffer;
          console.log("PDF file read successfully");
  
          // サーバーのAPIを呼び出す
          const res = await fetch('/api/readpdf', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pdfBuffer: Array.from(new Uint8Array(pdfBuffer)) }), // PDFファイルを送信
          });
  
          if (!res.ok) {
            throw new Error(`Failed to process PDF: ${res.statusText}`);
          }
  
          const data = await res.json();
          console.log("PDF content:", data.text);
  
          // PDF内容を分割
          const split_str = await textSplitter(data.text);
          console.log("Split text:", split_str);
  
          // OpenAI APIを呼び出し
          const openAiResponse = await openAiApi(values.apiKey, values.question, split_str);
          console.log("OpenAI API response:", openAiResponse);
  
          // レスポンスを画面に表示
          setText(openAiResponse.text);
  
        } catch (error) {
          console.error("Error processing PDF:", error);
  
          // OpenAI APIキーが無効な場合のエラーハンドリング
          if (error.message.includes("401")) {
            setErrorMessage("無効なAPIキーが提供されました。正しいAPIキーを入力してください。");
          } else {
            setErrorMessage("PDFの処理中にエラーが発生しました");
          }
        }
      };
  
      fileReader.onerror = (error) => {
        console.error("Error reading file:", error);
        setErrorMessage("ファイルの読み込みに失敗しました");
      };
    } catch (error) {
      console.error("Error in onFileSubmit:", error);
      setErrorMessage("エラーが発生しました");
    } finally {
      setLoading(false);  // 処理終了後に読み込み状態を解除
    }
  }
  
  
    
  

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5">質問一覧</Typography>
      {questions.map((question, index) => (
        <Card key={question.id} sx={{ mb: 2 }}>
          <CardContent>
            {questionManager.editingQuestionId === question.id ? (
              <Box>
                <TextField
                  fullWidth
                  label="質問名"
                  value={questionManager.editingQuestionText}
                  onChange={(e) => questionManager.setEditingQuestionText(e.target.value)}
                  autoFocus
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography>スコア反転</Typography>
                  <Switch
                    checked={questionManager.editingisRevercedScore}
                    onChange={() => questionManager.setEditingisRevercedScore(!questionManager.editingisRevercedScore)}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button onClick={() => questionManager.handleSaveQuestion(question.id)} color="primary" variant="contained">
                    保存
                  </Button>
                  <Button onClick={questionManager.resetEdit} color="secondary" variant="outlined">
                    キャンセル
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6">{index + 1}. {question.question_text}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography>スコア反転: {question.isReversedScore ? 'あり' : 'なし'}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={() => questionManager.handleQuestion(question.id, question.question_text, question.isReversedScore)} color="primary" variant="contained">
                      編集
                    </Button>
                    <Button onClick={() => onDelete(question.id)} color="error" variant="contained">
                      削除
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">新しい質問を追加</Typography>
          <TextField
            fullWidth
            label="質問名"
            value={questionManager.creatingQuestionText}
            onChange={(e) => questionManager.setCreatingQuestionText(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <Typography>スコア反転</Typography>
            <Switch
              checked={questionManager.creatingisRevercedScore}
              onChange={() => questionManager.setCreatingisRevercedScore(!questionManager.creatingisRevercedScore)}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={questionManager.handleCreateQuestion} color="primary" variant="contained">
              保存
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ファイル送信フォーム */}
      <Form {...form}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6">PDF 読み込みフォーム</Typography>
          <TextField
            {...register("apiKey", { required: "APIキーを入力してください" })}
            label="OPENAI API KEY"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)} // Separate state for API Key
            fullWidth
            sx={{ mb: 2 }}
          />

            {/* PDFファイル入力 */}
            <FormControl error={!!errors.pdfFile}>
              <FormLabel>PDFファイル</FormLabel>
              <TextField type="file" inputProps={{ accept: ".pdf" }} {...register("pdfFile")} />
              {errors.pdfFile && <FormHelperText>{errors.pdfFile.message}</FormHelperText>}
            </FormControl>

            {/* 質問内容を入力 */} 
            <TextField
              {...register("question", { required: "質問を入力してください" })}
              label="質問内容を入力"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)} // Separate state for API Key
              fullWidth
              sx={{ mb: 2 }}
            />

            {/* 送信ボタン */}
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                console.log("Button clicked");
                handleSubmitFile(
                  async (values) => {
                    console.log("Form submitted with values:", values);
                    await onFileSubmit(values);
                  },
                  (errors) => {
                    console.log("Validation errors:", errors);
                  }
                )();
              }}
            >
              {loading ? <CircularProgress size={24} /> : "送信"}
            </Button>

            {/* 成功メッセージ */}
            {responseMessage && <Alert severity="success" sx={{ mt: 2 }}>{responseMessage}</Alert>}

            {/* エラーメッセージ */}
            {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
          </Box>
        </Form>
        <p>{text}</p>
      </Box>
      
  );
};

export default QuestionFormList;
