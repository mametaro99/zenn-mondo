import { LoadingButton } from '@mui/lab'
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material'
import axios, { AxiosError } from 'axios'
import camelcaseKeys from 'camelcase-keys'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import useSWR from 'swr'
import Error from '@/components/Error'
import Loading from '@/components/Loading'
import { useSnackbarState, useUserState } from '@/hooks/useGlobalState'
import { useRequireSignedIn } from '@/hooks/useRequireSignedIn'
import { styles } from '@/styles'
import { fetcher } from '@/utils'


type TestQuestionProps = {
  id: number
  questionText: string
  isReversedScore: boolean
}

type TestProps = {
  id: number
  title: string
  description: string
  minScore: number
  maxScore: number
}

const QuestionForm: NextPage = () => {
  const router = useRouter()
  // router.isReadyでクエリが準備できているかを確認
  if (!router.isReady) {
    return <Loading />
  }
  
  useRequireSignedIn()
  const [user] = useUserState()
  const [, setSnackbar] = useSnackbarState()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: number]: string }>({}) // エラー状態を追加

  const { id } = router.query


  // URLを常に生成
  const testUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/tests/${id}`
  const questionsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/tests/${id}/questions`

  // フックの呼び出しは条件付きにしない
  const { data: testData, error: testError } = useSWR(testUrl, fetcher)
  const { data: questionsData, error: questionsError } = useSWR(questionsUrl, fetcher)

  // ユーザーのスコアを保持するための状態
  const [scores, setScores] = useState<{ [key: number]: number }>({})

  // スコア変更のハンドラ
  const handleScoreChange = (questionId: number, score: number) => {
    setScores((prevScores) => ({ ...prevScores, [questionId]: score }))
    setErrors((prevErrors) => ({ ...prevErrors, [questionId]: '' })) // スコア変更時にエラーをリセット
  }

  // user.isSignedInの状態に応じたエラーハンドリング
  if (!user.isSignedIn) {
    return <Error />
  }

  if (testError || questionsError) return <Error />
  if (!testData || !questionsData) return <Loading />

  const test: TestProps = camelcaseKeys(testData)
  const questions: TestQuestionProps[] = camelcaseKeys(questionsData)

  // フォームの送信処理
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true); // ローディング開始

    const userId = user.id; // ユーザーIDを取得

    const payload = {
      user_id: userId,
      test_id: test.id,
      scores,
    };

    const validationErrors: { [key: number]: string } = {}
    questions.forEach((question) => {
      if (!(question.id in scores)) {
        validationErrors[question.id] = 'この質問に回答してください。'
      }
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setIsLoading(false) // エラー時はローディング停止
      return
    }

    const headers = {
      'Content-Type': 'application/json',
      'access-token': localStorage.getItem('access-token'),
      client: localStorage.getItem('client'),
      uid: localStorage.getItem('uid'),
    };

    try {
      // Axiosを使ってデータを送信
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/current/tests/${test.id}/test_answers`, payload, {
        headers: headers,
      });

      // 成功したらリダイレクト
      setSnackbar({
        message: '回答を送信しました',
        severity: 'success',
        pathname: '/tests/[id]',
      })
      router.push(`/tests/${test.id}`);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      console.error('Submission error:', error.message);
      setSnackbar({
        message: '回答の送信に失敗しました',
        severity: 'success',
        pathname: '/tests/[id]/questionForm',
      })
      setIsLoading(false); // エラー時はローディング停止
    }
  };


  return (
    <Box
      css={styles.pageMinHeight}
      sx={{
        borderTop: '0.5px solid #acbcc7',
        pb: 8,
        px: 2,
        pt: 5,
        display: 'flex', // フレックスボックスを使用
        justifyContent: 'center', // 水平方向の中央配置
        alignItems: 'center', // 垂直方向の中央配置
        flexDirection: 'column', // 縦に並べる
      }}
    >
      <Typography variant="h4" sx={{ mb: 4 }}>
        {test.title}
      </Typography>
  
      <Typography sx={{ mb: 4 }}>
        以下の質問について、{test.minScore}(あてはまらない)～{test.maxScore}(あてはまる)の間の数字で回答してください。
      </Typography>
  
      <Typography variant="body2" sx={{ mb: 2 }}>
        あてはまる: {test.maxScore}点
      </Typography>
      <Typography variant="body2" sx={{ mb: 4 }}>
        あてはまらない: {test.minScore}点
      </Typography>
  
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {questions.map((question, index) => (
            <FormControl key={question.id} component="fieldset" sx={{ mb: 3 }} error={!!errors[question.id]}>
              <Typography variant="body1">
                {index + 1}. {question.questionText}
              </Typography>
              <RadioGroup
                row
                value={scores[question.id] || ''}
                onChange={(e) => handleScoreChange(question.id, Number(e.target.value))}
              >
                {[...Array(test.maxScore - test.minScore + 1)].map((_, idx) => {
                  const scoreValue = test.minScore + idx
                  return (
                    <FormControlLabel
                      key={scoreValue}
                      control={<Radio />}
                      label={scoreValue.toString()}
                      value={scoreValue}
                    />
                  )
                })}
              </RadioGroup>
              {errors[question.id] && (
                <FormHelperText>{errors[question.id]}</FormHelperText>
              )}
            </FormControl>
          ))}
        </Box>
  
        <LoadingButton
          type="submit"
          loading={isLoading}
          variant="contained"
          color="primary"
          sx={{ mt: 2 }} // スペースを確保
        >
          Submit Answers
        </LoadingButton>
      </form>
    </Box>
  )
  
}

export default QuestionForm
