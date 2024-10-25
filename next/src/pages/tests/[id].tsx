import {
  Box,
  Container,
  Typography,
  Card,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from '@mui/material'
import camelcaseKeys from 'camelcase-keys'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Error from '@/components/Error'
import Loading from '@/components/Loading'
import MarkdownText from '@/components/MarkdownText'
import { fetcher } from '@/utils'
import React from 'react'
import AverageScoreChart from '@/components/AverageScoreChart'

type TestQuestionProps = {
  id: number
  questionText: string
  isReversedScore: boolean
}

type TestProps = {
  id: number
  title: string
  description: string
  siteUrl: string
  improvementSuggestion: string
  minScore: number
  maxScore: number
  avgScore: number
  createdAt: string
  fromToday: string
}

type TestAnswerDetailProps = {
  score: number
  questionId: number
}

type TestAnswerProps = {
  id: number
  timestamp: string
  average: number
  testAnswerDetails: TestAnswerDetailProps[]
}

const TestDetail: NextPage = () => {
  const router = useRouter()

  // router.isReadyでクエリが準備できているかを確認
  if (!router.isReady) {
    return <Loading />
  }
  const { id } = router.query
  const testUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/tests/${id}`
  const userResultsUrl = id ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/current/tests/${id}/test_answers` : null
  const questionsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/tests/${id}/questions`


  const { data: testData, error: testError } = useSWR(testUrl, fetcher)
  const { data: resultData, error: resultError } = useSWR(userResultsUrl, fetcher)
  const { data: questionData, error: questionError } = useSWR(questionsUrl, fetcher)

  if (testError || resultError) return <Error />
  if (!testData || !resultData) return <Loading />

  const test: TestProps = camelcaseKeys(testData)
  const testAnswers: TestAnswerProps[] = camelcaseKeys(resultData)
  const questions: TestQuestionProps[] = camelcaseKeys(questionData)

  console.log(test)

  const getScoreChange = (current: number, previous: number) => {
    if (current > previous) return <span style={{ color: 'blue' }}>↗</span>
    if (current < previous) return <span style={{ color: 'red' }}>↘</span>
    return ''
  }

  const averages = testAnswers.map(answer => ({
    date: new Date(answer.timestamp).toLocaleDateString(),
    score: answer.average,
  }));

  const overallAvgScore = test.avgScore; // Overall average score
  
  return (
    <Box sx={{ backgroundColor: '#EDF2F7', pb: 6, minHeight: 'calc(100vh - 57px)' }}>
      <Container maxWidth="lg">
        <Box sx={{ pt: 6, pb: 3 }}>
          <Box sx={{ maxWidth: 840, m: 'auto', textAlign: 'center' }}>
            <Typography component="h2" sx={{ fontSize: { xs: 21, sm: 25 }, fontWeight: 'bold' }}>
              {test.title}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: '0 24px'}}>
          <Box sx={{ width: '100%' }}>
            {/* テスト受験リンク */}
            <Box sx={{ textAlign: 'center', mt: 4, mb: 5}}>
              <a href={`/tests/${id}/questionForm`} style={{ textDecoration: 'none' }}>
                <Button component="p" sx={{ fontSize: 18, fontWeight: 'bold' }} color="primary" variant="contained" >
                  テストを受験する
                </Button>
              </a>
            </Box>

            <AverageScoreChart averages={averages} overallAvgScore={overallAvgScore} title={test.title} />
            {/* //中央に配置 */}
            <Card sx={{ boxShadow: 'none', borderRadius: '12px', maxWidth: 840, m: '5px auto'}}>
              <Box sx={{ padding: { xs: '0 24px 24px 24px', sm: '0 40px 40px 40px' }, marginTop: { xs: '24px', sm: '40px' } }}>
                <MarkdownText content={`## 説明\n\n${test.description}`} />
                <MarkdownText content={`## 改善案\n\n${test.improvementSuggestion}`} />
                <br />
                <MarkdownText content={`引用URL: [${test.siteUrl}](${test.siteUrl})`} />
              </Box>
            </Card>


            {/* 比較表 */}
            <Box sx={{ mt: 6 }}>
              <Typography component="h3" sx={{ fontSize: 20, fontWeight: 'bold', mb: 2 }}>
                あなたの過去のテスト結果（期間ごとの比較）
              </Typography>
              <Box sx={{ overflowX: 'auto' }}> 
                <Table sx={{ minWidth: 600, width: '100%' }}> {/* Set a minimum width for the table */}
                  <TableHead>
                    <TableRow>
                      <TableCell>質問名/回答日</TableCell>
                      {testAnswers.map((answer, index) => (
                        <TableCell key={index}>{new Date(answer.timestamp).toLocaleDateString()}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questions?.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell>{question.questionText}</TableCell>
                        {testAnswers.map((answer, index) => {
                          const detail = answer.testAnswerDetails.find((d) => d.question_id === question.id);
                          return (
                            <TableCell key={index}>
                              {detail?.score}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                    {/* 平均スコアの行 */}
                    <TableRow>
                      <TableCell>平均点</TableCell>
                      {testAnswers.map((answer, index) => (
                        <TableCell key={index}>
                          {answer.average}
                          {index > 0 && getScoreChange(answer.average, testAnswers[index - 1].average)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default TestDetail
