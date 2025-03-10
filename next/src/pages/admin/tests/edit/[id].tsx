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
import QuestionFormList from "@/components/QuestionFormList";

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
  const [previewChecked, setPreviewChecked] = useState<boolean>(false)
  const [statusChecked, setStatusChecked] = useState<boolean>(false)
  const [isFetched, setIsFetched] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [, setSnackbar] = useSnackbarState()

  const handleChangePreviewChecked = () => {
    setPreviewChecked(!previewChecked)
  }

  const handleChangeStatusChecked = () => {
    setStatusChecked(!statusChecked)
  }

  const { id } = router.query
  const { test, error, isFetched: isTestFetched} = useTestData(id, user);

  const { handleSubmit, control, reset, watch } = useForm<TestFormData>({
    defaultValues: test || {},
  })

  useEffect(() => {
    if (test) {
      reset(test)
      setStatusChecked(test.status == '公開中')
      setIsFetched(true)
    }
  }, [test, reset])



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



  const { questions, mutate } = useTestQuestions(id, user);
  const questionManager = useQuestionManager(id as string, mutate);


  const handleDeleteQuestion = async (id: number) => {
    await questionManager.handleDeleteQuestion(id);
  };

   
  if (error) return <Error />
  if (!test || !isTestFetched) return <Loading />

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ backgroundColor: '#EDF2F7', minHeight: '100vh' }}
    >
      <Container
        maxWidth="lg"
        sx={{ pt: 11, pb: 3, display: 'flex', justifyContent: 'center', flexFlow: 'column'}}
      >
        <TestForm 
          test={test} 
          control={control}
          previewChecked={previewChecked}
          onPreviewCheckedChange={handleChangePreviewChecked}
          statusChecked={statusChecked}
          onStatusCheckedChange={handleChangeStatusChecked}
          isLoading={isLoading}
        />
        {!previewChecked && (
          <Box sx={{ width: 840 }}>
            <QuestionFormList
              questions={questions}
              questionManager={questionManager}
              title={test.title}
              onDelete={handleDeleteQuestion}
            />
          </Box>
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
