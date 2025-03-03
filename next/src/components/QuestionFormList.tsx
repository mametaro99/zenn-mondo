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
  const [text, setText] = useState<string>("");

  const form = useForm<z.infer<typeof fileSchema>>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      pdfFile: undefined,
    },
  });


  async function onFileSubmit(values: z.infer<typeof fileSchema>) {
    try {
      setLoading(true);
      setResponseMessage(null);
      setErrorMessage(null);
  
      if (!values.pdfFile || values.pdfFile.length === 0) {
        throw new Error("PDFファイルが選択されていません");
      }
  
      const file = values.pdfFile[0];
      const pdfBuffer = await file.arrayBuffer();
  
      const res = await fetch("/api/readpdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pdfBuffer: Array.from(new Uint8Array(pdfBuffer)) }),
      });
  
      if (!res.ok) {
        throw new Error(`Failed to process PDF: ${res.statusText}`);
      }
  
      const data = await res.json();
      const split_str = await textSplitter(data.text);
      console.log(split_str)
      if (!process.env.NEXT_PUBLIC_OPENAPI_KEY) {
        throw new Error("OpenAI API key is not defined");
      }


      const question = `論文に記載されている心理テストの質問項目を抽出してください。それぞれの質問項目は以下のJSON形式で出力してください。

      {
        "questions": [
          {
            "question_text": "質問内容",
            "is_reversed_score": trueまたはfalse
          }
        ]
      }

      - question_text には質問内容をそのまま記載してください。
      - is_reversed_score には、その質問がスコア計算時に反転させる必要がある場合は true、そうでない場合は false を設定してください。`;

      const openAiResponse = await openAiApi(process.env.NEXT_PUBLIC_OPENAPI_KEY, question, split_str);
      
      console.log(openAiResponse)
      setText(openAiResponse.text);
      setResponseMessage("PDFが正常に処理されました");
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error.message || "処理中にエラーが発生しました");
    } finally {
      setLoading(false);
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

          <FormControl error={!!errors.pdfFile}>
            <FormLabel>PDFファイル</FormLabel>
            <TextField
              type="file"
              inputProps={{ accept: ".pdf" }}
              {...register("pdfFile")}
            />
            {errors.pdfFile && <FormHelperText>{errors.pdfFile.message}</FormHelperText>}
          </FormControl>


          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={loading}
            type="submit" // Use submit type to trigger the form submission
            onClick={handleSubmitFile(onFileSubmit)} // Add onClick handler to trigger onFileSubmit
            >
            {loading ? <CircularProgress size={24} /> : "送信"}
          </Button>

          {responseMessage && <Alert severity="success" sx={{ mt: 2 }}>{responseMessage}</Alert>}
          {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
        </Box>
      </Form>
            
        <p>{text}</p>
      </Box>
      
  );
};

export default QuestionFormList;
