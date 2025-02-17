import ArrowBackSharpIcon from '@mui/icons-material/ArrowBackSharp'
import { LoadingButton } from '@mui/lab'
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Switch,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import axios, { AxiosError } from 'axios'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState, useMemo } from 'react'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import useSWR from 'swr'
import Error from '@/components/Error'
import Loading from '@/components/Loading'
import MarkdownText from '@/components/MarkdownText'
import { useAdminState, useSnackbarState } from '@/hooks/useGlobalState'
import { useRequireAdminSignedIn } from '@/hooks/useRequireSignedIn'
import { fetcher } from '@/utils'
import camelcaseKeys from 'camelcase-keys'


type TestFormData = {
  title: string
  description: string
  siteUrl: string
  improvementSuggestion: string
  minScore: number
  maxScore: number
  avgScore: number
  status: string
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
  const [, setSnackbar] = useSnackbarState()
  const [previewChecked, setPreviewChecked] = useState<boolean>(false)
  const [statusChecked, setStatusChecked] = useState<boolean>(false)
  const [isFetched, setIsFetched] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState<string>('');
  const [questions, setQuestions] = useState<QuestionProps[]>([]);
  const [editingisRevercedScore, setEditingisRevercedScore] = useState<boolean>(false);
  const [, setCreatingQuestionId] = useState<number | null>(null);
  const [creatingQuestionText, setCreatingQuestionText] = useState<string>('');
  const [creatingisRevercedScore, setCreatingisRevercedScore] = useState<boolean>(false);
  const [questionSaved, setQuestionSaved] = useState(false);

  const handleChangePreviewChecked = () => {
    setPreviewChecked(!previewChecked)
  }

  const handleChangeStatusChecked = () => {
    setStatusChecked(!statusChecked)
  }

  const { id } = router.query
  const url = process.env.NEXT_PUBLIC_API_BASE_URL + '/current/tests/' + id
  const { data, error } = useSWR(user.isSignedIn && id ? url : null, fetcher)

  const questionsUrl = process.env.NEXT_PUBLIC_API_BASE_URL + `/tests/${id}/questions`
  const { data: questionsData, error: questionsError, mutate } = useSWR(
    user.isSignedIn && id ? questionsUrl : null,
    fetcher,
  )

  useEffect(() => {
    if (questionSaved) {
      mutate();
      setQuestionSaved(false);
    }
  }, [questionSaved, mutate]);

  useEffect(() => {
    if (questionsData) {
      setQuestions(questionsData)
    }
  }, [questionsData])

  const test = useMemo(() => {
    const camelcasedData = camelcaseKeys(data, { deep: true })
    console.log(camelcasedData)

    if (!data) {
      return {
        id: 0,
        title: '',
        description: '',
        siteUrl: '',
        improvementSuggestion: '',
        minScore: 0,
        maxScore: 0,
        avgScore: 0,
        createdAt: '',
        fromToday: '',
        status: false,
      }
    }
    return {
      id: camelcasedData.id,
      title: camelcasedData.title == null ? '' : camelcasedData.title,
      description: camelcasedData.description == null ? '' : camelcasedData.description,
      siteUrl: camelcasedData.siteUrl == null ? '' : camelcasedData.siteUrl,
      improvementSuggestion: camelcasedData.improvementSuggestion == null ? '' : camelcasedData.improvementSuggestion,
      minScore: camelcasedData.minScore,
      maxScore: camelcasedData.maxScore,
      avgScore: camelcasedData.avgScore,
      createdAt: camelcasedData.createdAt,
      fromToday: camelcasedData.fromToday,
      status: camelcasedData.status,
    }
  }, [data])

  const { handleSubmit, control, reset, watch } = useForm<TestFormData>({
    defaultValues: test,
  })

  useEffect(() => {
    if (data) {
      reset(test)
      setStatusChecked(test.status == '公開中')
      setIsFetched(true)
    }
  }, [data, reset, test])

  const onSubmit: SubmitHandler<TestFormData> = (data) => {
    if (data.title == '') {
      return setSnackbar({
        message: 'テストの保存にはタイトルが必要です',
        severity: 'error',
        pathname: '/admin/tests/edit/[id]',
      })
    }

    if (statusChecked && data.description == '') {
      return setSnackbar({
        message: '説明なしのテストは公開はできません',
        severity: 'error',
        pathname: '/admin/tests/edit/[id]',
      })
    }

    setIsLoading(true)

    const patchUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL + '/current/tests/' + id

    const headers = {
      'Content-Type': 'application/json',
      'access-token': localStorage.getItem('access-token'),
      client: localStorage.getItem('client'),
      uid: localStorage.getItem('uid'),
    }

    const status = statusChecked ? 'published' : 'draft'
    const patchData = {
      test: {
        title: data.title,
        description: data.description,
        site_url: data.siteUrl,
        improvement_suggestion: data.improvementSuggestion,
        min_score: data.minScore,
        max_score: data.maxScore,
        avg_score: data.avgScore,
        status: status,
      },
    }

    axios({
      method: 'PATCH',
      url: patchUrl,
      data: patchData,
      headers: headers,
    })
      .then(() => {
        setSnackbar({
          message: 'テストを保存しました',
          severity: 'success',
          pathname: '/admin/tests/edit/[id]',
        })
      })
      .catch((err: AxiosError<{ error: string }>) => {
        console.log(err.message)
        setSnackbar({
          message: 'テストの保存に失敗しました',
          severity: 'error',
          pathname: '/admin/tests/edit/[id]',
        })
      })
    setIsLoading(false)
  }

  const handleQuestion = (
    questionId: number,
    questionText: string,
    isRevercedScore: boolean
  ) => {
    setEditingQuestionId(questionId);
    setEditingQuestionText(questionText);
    setEditingisRevercedScore(isRevercedScore);
  };

  const handleSaveQuestion = async (questionId: number) => {
    const headers = {
      'access-token': localStorage.getItem('access-token'),
      client: localStorage.getItem('client'),
      uid: localStorage.getItem('uid'),
    };

    try {
      await axios.patch(`${url}/questions/${questionId}`, {
        question: {
          question_text: editingQuestionText,
          isReversedScore: editingisRevercedScore,
        },
      }, { headers });
      setSnackbar({
        message: '質問を保存しました',
        severity: 'success',
        pathname: router.pathname,
      });

      setEditingQuestionId(null);
      setEditingQuestionText('');
      setEditingisRevercedScore(false);
      setQuestionSaved(true);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError && err.response
          ? err.response.data.message || '不明なエラーが発生しました'
          : 'ネットワークエラーが発生しました';

      setSnackbar({
        message: `フレーズの保存に失敗しました: ${errorMessage}`,
        severity: 'error',
        pathname: router.pathname,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditingQuestionText('');
    setEditingisRevercedScore(false);
  };

  const handleCreateQuestion = async () => {
    const headers = {
      'access-token': localStorage.getItem('access-token'),
      client: localStorage.getItem('client'),
      uid: localStorage.getItem('uid'),
    };
    
    try {
      await axios.post(`${url}/questions`, {
        question: {
          question_text: creatingQuestionText,
          isReversedScore: creatingisRevercedScore,
        },
      }, { headers });
      setSnackbar({
        message: '質問を新規作成しました',
        severity: 'success',
        pathname: router.pathname,
      });

      setCreatingQuestionId(null);
      setCreatingQuestionText('');
      setCreatingisRevercedScore(false);
      setQuestionSaved(true);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError && err.response
          ? err.response.data.message || '不明なエラーが発生しました'
          : 'ネットワークエラーが発生しました';

      setSnackbar({
        message: `フレーズの作成に失敗しました: ${errorMessage}`,
        severity: 'error',
        pathname: router.pathname,
      });
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    const headers = {
      'access-token': localStorage.getItem('access-token'),
      client: localStorage.getItem('client'),
      uid: localStorage.getItem('uid'),
    };

    try {
      await axios.delete(`${url}/questions/${questionId}`, { headers });
      setSnackbar({
        message: '質問を削除しました',
        severity: 'success',
        pathname: router.pathname,
      });

      setQuestionSaved(true);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError && err.response
          ? err.response.data.message || '不明なエラーが発生しました'
          : 'ネットワークエラーが発生しました';

      setSnackbar({
        message: `フレーズの削除に失敗しました: ${errorMessage}`,
        severity: 'error',
        pathname: router.pathname,
      });
    }
  }

  if (error) return <Error />
  if (!data || !isFetched) return <Loading />

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ backgroundColor: '#EDF2F7', minHeight: '100vh' }}
    >
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#EDF2F7',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ width: 50 }}>
            <Link href="/admin/home">
              <IconButton>
                <ArrowBackSharpIcon />
              </IconButton>
            </Link>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: { xs: '0 16px', sm: '0 24px' },
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Switch
                checked={previewChecked}
                onChange={handleChangePreviewChecked}
              />
              <Typography sx={{ color: "black", fontSize: { xs: 12, sm: 15 } }}>
                プレビュー表示
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Switch
                checked={statusChecked}
                onChange={handleChangeStatusChecked}
              />
              <Typography sx={{ color: "black", fontSize: { xs: 12, sm: 15 } }}>
                下書き／公開
              </Typography>
            </Box>
            <LoadingButton
              variant="contained"
              type="submit"
              loading={isLoading}
              sx={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: { xs: 12, sm: 16 },
              }}
            >
              更新する
            </LoadingButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Container
        maxWidth="lg"
        sx={{ pt: 11, pb: 3, display: 'flex', justifyContent: 'center' }}
      >
        {!previewChecked && (
            <><Box sx={{ width: 840 }}>
            <Box sx={{ mb: 2 }}>
              <Typography>タイトル</Typography>
              <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                {...field}
                type="text"
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                placeholder="Write in Title"
                fullWidth
                sx={{ backgroundColor: 'white' }} />
              )} />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography>説明</Typography>
              <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                {...field}
                type="text"
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                multiline
                fullWidth
                placeholder="Write in Markdown Text"
                rows={10}
                sx={{ backgroundColor: 'white' }} />
              )} />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography>改善案</Typography>
              <Controller
              name="improvementSuggestion"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                {...field}
                type="textarea"
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                multiline
                fullWidth
                placeholder="Improvement Suggestion in Markdown Text"
                rows={10}
                sx={{ backgroundColor: 'white' }} />
              )} />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography>引用URL</Typography>
              <Controller
              name="siteUrl"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                {...field}
                type="url"
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                placeholder="Site URL"
                fullWidth
                sx={{ backgroundColor: 'white' }} />
              )} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
              <Typography>最低スコア</Typography>
              <Controller
                name="minScore"
                control={control}
                render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  error={fieldState.invalid}
                  helperText={fieldState.error?.message}
                  placeholder="Minimum Score"
                  fullWidth
                  sx={{ backgroundColor: 'white' }} />
                )} />
              </Box>
              <Box sx={{ flex: 1 }}>
              <Typography>最高スコア</Typography>
              <Controller
                name="maxScore"
                control={control}
                render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  error={fieldState.invalid}
                  helperText={fieldState.error?.message}
                  placeholder="Maximum Score"
                  fullWidth
                  sx={{ backgroundColor: 'white' }} />
                )} />
              </Box>
              <Box sx={{ flex: 1 }}>
              <Typography>平均スコア</Typography>
              <Controller
                name="avgScore"
                control={control}
                render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  error={fieldState.invalid}
                  helperText={fieldState.error?.message}
                  placeholder="Average Score"
                  fullWidth
                  sx={{ backgroundColor: 'white' }} />
                )} />
              </Box>
            </Box>
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
             
            </Box></>
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
