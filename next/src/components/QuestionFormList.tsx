import React, { useState } from "react";
import { Box, Button, TextField, Typography, FormControl, FormLabel, FormHelperText, Input, Card, CardContent, Switch, CircularProgress, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { readPdf } from "@/lib/readPdf";
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
  const [question,setQuestion] = useState('');

  const [text, setText] = useState<string>("");

  async function onFileSubmit(values: z.infer<typeof fileSchema>) {
    setLoading(true);
    setResponseMessage(null);
    setErrorMessage(null);

    const str = await readPdf(`data/${values.pdfFile[0].name}`);
    const split_str = await textSplitter(str);
    const res = await openAiApi(values.apiKey, values.question, split_str);
    console.log(res);
    setText(res.text);
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

          {/* 質問内容を入力 */} 
          <TextField
            label="質問内容を入力"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)} // Separate state for API Key
            fullWidth
            sx={{ mb: 2 }}
          />

          {/* 送信ボタン */}
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "送信"}
          </Button>

          {/* 成功メッセージ */}
          {responseMessage && <Alert severity="success" sx={{ mt: 2 }}>{responseMessage}</Alert>}

          {/* エラーメッセージ */}
          {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
        </Box>
        <p>{text}</p>
      </Box>
      
  );
};

export default QuestionFormList;
