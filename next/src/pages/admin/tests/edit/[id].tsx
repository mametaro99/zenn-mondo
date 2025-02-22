import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import axios, { AxiosError } from 'axios'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState, useMemo } from 'react'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import Error from '@/components/Error'
import Loading from '@/components/Loading'
import MarkdownText from '@/components/MarkdownText'
import { useAdminState, useSnackbarState } from '@/hooks/useGlobalState'
import { useRequireAdminSignedIn } from '@/hooks/useRequireSignedIn'
import { fetcher } from '@/utils'
import camelcaseKeys from 'camelcase-keys'
import TestEditHeader from '@/components/TestEditHeader'
import { useTestData } from '@/hooks/useTestData'
import { useTestQuestions } from '@/hooks/useTestQuestions'
import { useQuestionManager } from '@/hooks/useQuestionManager'
import TestForm from '@/components/TestEditForm'

type TestFormData = {
  id?: string
  title: string
  description: string
  siteUrl: string
  improvementSuggestion: string
  minScore: number
  maxScore: number
  avgScore: number
  status: string
  createdAt: string
  fromToday: string
}


type QuestionProps = {
  id: number
  question_text: string
  isReversedScore: boolean
}


const CurrentTestEdit: NextPage = () => {
  useRequireAdminSignedIn()
  const router = useRouter()
  const [user] = useAdminState()
  const [previewChecked, setPreviewChecked] = useState<boolean>(false)
  const [statusChecked, setStatusChecked] = useState<boolean>(false)
  const [isDataFetched] = useState<boolean>(false)
  const [isLoading] = useState<boolean>(false)

  const handleChangePreviewChecked = () => {
    setPreviewChecked(!previewChecked)
  }

  const handleChangeStatusChecked = () => {
    setStatusChecked(!statusChecked)
  }

  const { handleSubmit, control, reset, watch } = useForm<TestFormData>({
    defaultValues: test || {},
  })

  const onSubmit: SubmitHandler<TestFormData> = data => {
    console.log(data);
  }

  const { id } = router.query
  const { test, error, isFetched } = useTestData(id, user);
  const { questions, mutate } = useTestQuestions(id, user);
  const questionManager = useQuestionManager(id as string, mutate);
   
  if (error) return <Error />
  if (!test || !isFetched) return <Loading />

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ backgroundColor: '#EDF2F7', minHeight: '100vh' }}
    >
      <TestEditHeader
        previewChecked={previewChecked}
        onPreviewCheckedChange={handleChangePreviewChecked}
        statusChecked={statusChecked}
        onStatusCheckedChange={handleChangeStatusChecked}
        isLoading={isLoading}
      />
      <Container
        maxWidth="lg"
        sx={{ pt: 11, pb: 3, display: 'flex', justifyContent: 'center' }}
      >
        {!previewChecked && (
            <><TestForm test={test} control={control} />
              <Box sx={{ mt: 4 }}>
              <Typography variant="h5">質問一覧</Typography>
              {questions.map((question, index) => (
                <Card key={question.id} sx={{ mb: 2 }}>
                  <CardContent>
                    {editingQuestionId === question.id ? (
                      <Box>
                        <TextField
                          fullWidth
                          label="質問名"
                          value={editingQuestionText}
                          onChange={(e) => setEditingQuestionText(e.target.value)}
                          autoFocus
                          sx={{ mb: 2 }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-center' }}>
                          <Typography>スコア反転</Typography>
                          <Switch
                            checked={editingisRevercedScore}
                            onChange={() => setEditingisRevercedScore(!editingisRevercedScore)}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button onClick={() => handleSaveQuestion(question.id)} color="primary" variant="contained">
                            保存
                          </Button>
                          <Button onClick={handleCancelEdit} color="secondary" variant="outlined">
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
                            <Button
                              onClick={() => handleQuestion(question.id, question.question_text, question.isReversedScore)}
                              color="primary"
                              variant="contained"
                            >
                              編集
                            </Button>
                            <Button
                              onClick={() => handleDeleteQuestion(question.id)}
                              color="error"
                              variant="contained"
                            >
                              削除
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
              {/* 新しいフレーズを追加 */}
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">新しい質問を追加</Typography>
                    <TextField
                      fullWidth
                      label="質問名"
                      value={creatingQuestionText}
                      onChange={(e) => setCreatingQuestionText(e.target.value)}
                      sx={{ mb: 2 }}
                    />       
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <Typography>スコア反転</Typography>
                      <Switch
                        checked={creatingisRevercedScore}
                        onChange={() => setCreatingisRevercedScore(!creatingisRevercedScore)}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button onClick={() => handleCreateQuestion()} color="primary" variant="contained">
                      保存
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </>
          )}
        {previewChecked && (
          <Box sx={{ width: 840 }}>
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: 21, sm: 25 },
                fontWeight: 'bold',
                textAlign: 'center',
                pt: 2,
                pb: 4,
              }}
            >
              {watch('title')}
            </Typography>
            <Card sx={{ boxShadow: 'none', borderRadius: '12px' }}>
              <Box
                sx={{
                  padding: { xs: '0 24px 24px 24px', sm: '0 40px 40px 40px' },
                  marginTop: { xs: '24px', sm: '40px' },
                }}
              >
                <MarkdownText content={`## 説明\n\n${watch('description')}`} />
                <MarkdownText content={`## 改善案\n\n${watch('improvementSuggestion')}`} />
                <br />
                <MarkdownText content={`- 引用URL:${watch('siteUrl')}`} />
              </Box>
            </Card>
            {/* 各質問を表示 */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5">質問一覧</Typography>
              {questions.map((question, index) => (
                <Card key={question.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{index + 1}. {question.question_text}</Typography>
                    <Typography>スコア反転: {question.isReversedScore ? 'あり' : 'なし'}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default CurrentTestEdit
