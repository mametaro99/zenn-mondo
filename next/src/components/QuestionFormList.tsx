import React, { useState } from "react";
import { Box, Button, TextField, Typography, FormControl, FormLabel, FormHelperText, Card, CardContent, Switch, CircularProgress, Alert } from "@mui/material";
import { Form, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

type QuestionProps = {
  id: number;
  question_text: string;
  isReversedScore: boolean;
};

interface QuestionFormListProps {
  questions: QuestionProps[];
  questionManager: any;
  title :string;
  onDelete: (id: number) => void;
}


const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not defined");
}
const genAI = new GoogleGenerativeAI(apiKey);

const fileSchema = z.object({
  imageFile: z.custom<FileList>().refine((file) => file && file.length !== 0, {
    message: "ファイルが選択されていません",
  }),
});


const QuestionFormList: React.FC<QuestionFormListProps> = ({ questions, questionManager, title ,onDelete }) => {
  // react-hook-form setup

  const {
    register,
    handleSubmit: handleSubmitFile,
    formState: { errors },
  } = useForm({ resolver: zodResolver(fileSchema) });

  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof fileSchema>>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      imageFile: undefined,
    },
  });


  async function onFileSubmit(values: z.infer<typeof fileSchema>) {
    try {
      setLoading(true);
      setResponseMessage(null);
      setErrorMessage(null);
  
      if (!values.imageFile || values.imageFile.length === 0) {
        throw new Error("画像ファイルが選択されていません");
      }
  
      const file = values.imageFile[0];
      
      const imageBuffer = await file.arrayBuffer();
      const imageBase64 = Buffer.from(imageBuffer).toString('base64');

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


      const question = `${title}の論文で使われているテストを抽出し、各質問項目は以下のJSON形式で出力して

      {
        "questions": [
          {
            "question_text": "私が持っている信念は頻繁に変わる",
            "is_reversed_score": true
          }
        ]
      }


      - question_text には論文に記載されている各質問項目を日本語で記載
      - is_reversed_score には、その質問がスコア計算時に反転させる必要がある場合は true、そうでない場合は false`;
      
      const parts = [
        { text: question },
        {
          inlineData: { mimeType: "image/jpeg", data: imageBase64 },
        },
      ];
      
      const result = await model.generateContent(parts);
      const response = await result.response;
      const responseText = response.text();

      const jsonStartIndex = responseText.indexOf('{');
      const jsonEndIndex = responseText.lastIndexOf('}') + 1;
      const jsonString = responseText.substring(jsonStartIndex, jsonEndIndex);
      const parsedResponse = JSON.parse(jsonString);
      const questionsWithId = parsedResponse.questions.map((q: { question_text: string, is_reversed_score: boolean }) => ({
        id: Math.random().toString(36).substring(2, 15), // ランダムなIDを生成
        question_text: q.question_text,
        isReversedScore: q.is_reversed_score,
      }));


      questionManager.setCreatingBulkQuestions(questionsWithId);
      questionManager.setIsGeminiSucsess(true);
      setResponseMessage("画像が正常に処理されました");
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
      <form onSubmit={form.handleSubmit(onFileSubmit)}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6">画像 読み込みフォーム</Typography>

          <FormControl error={!!errors.imageFile}>
            <FormLabel>画像ファイル</FormLabel>
            <TextField
              type="file"
              inputProps={{ accept: ".pdf, .png, .jpeg, .jpg" }}
              {...register("imageFile")}
            />
            {errors.imageFile && <FormHelperText>{errors.imageFile.message}</FormHelperText>}
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

          {responseMessage && questionManager.isGeminiSucsess && <Alert severity="success" sx={{ mt: 2 }}>{responseMessage}</Alert>}
          {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
        </Box>
      </form>
      {/* レスポンスが成功した場合は、一括送信するフォームを作成。各質問はユーザが削除・編集することもできる */}
      {questionManager.isGeminiSucsess && (
        <form>
          {questionManager.creatingBulkQuestions.map((question: QuestionProps, index: number) => (
            <Card key={question.id} sx={{ mb: 2 }}>
              <CardContent>      
                <Box>
                  <Typography variant="h6">
                    {index + 1}. {question.question_text}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography>スコア反転: {question.isReversedScore ? "あり" : "なし"}</Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        onClick={() => questionManager.handleDeleteBulkedQuestion(question.id)}
                        color="error"
                        variant="contained"
                      >
                        削除
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={loading}
            type="button"
            onClick={questionManager.handleBulkCreateQuestions}
          >
            {loading ? <CircularProgress size={24} /> : "送信"}
          </Button>
        </form>
      )}
      </Box>

      
  );
};

export default QuestionFormList;
