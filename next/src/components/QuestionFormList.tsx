import React, { useState } from "react";
import { Box, Button, TextField, Typography, FormControl, FormLabel, FormHelperText, Input, Card, CardContent, Switch, CircularProgress, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

const questionSchema = z.object({
  question: z.string().min(1, { message: "質問を入力してください" }),
});

const fileSchema = z.object({
  apiKey: z.string().length(51, { message: "OPENAI API KEYを入力してください" }),
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

  async function onFileSubmit(values: z.infer<typeof fileSchema>) {
    setLoading(true);
    setResponseMessage(null);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("pdfFile", values.pdfFile[0]);

    try {
      const response = await fetch("/api/readPdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("PDF の読み込みに失敗しました");
      }

      const result = await response.json();
      setResponseMessage(`成功: ${result.data}`);
    } catch (error: any) {
      setErrorMessage(error.message || "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  function onQuestionSubmit(values: z.infer<typeof questionSchema>) {
    console.log("質問送信:", values);
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
      <Box component="form" onSubmit={handleSubmitFile(onFileSubmit)} sx={{ mb: 4 }}>
        <Typography variant="h6">PDF 読み込みフォーム</Typography>
        <TextField
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

          {/* 送信ボタン */}
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "送信"}
          </Button>

          {/* 成功メッセージ */}
          {responseMessage && <Alert severity="success" sx={{ mt: 2 }}>{responseMessage}</Alert>}

          {/* エラーメッセージ */}
          {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
        </Box>
      </Box>
  );
};

export default QuestionFormList;
