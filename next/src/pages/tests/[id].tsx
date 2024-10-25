import ArticleIcon from '@mui/icons-material/Article'
import PersonIcon from '@mui/icons-material/Person'
import UpdateIcon from '@mui/icons-material/Update'
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

type TestProps = {
  id: number
  title: string
  description: string
  site_url: string
  improvementSuggestion: string
  minScore: number
  maxScore: number
  avgScore: number
  createdAt: string
  fromToday: string
}

type TestAnswerDetailProps = {
  score: number
  question_id: number
}

type TestAnswerProps = {
  id: number
  timestamp: string
  average: number
  test_answer_details: TestAnswerDetailProps[]
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

  const { data: testData, error: testError } = useSWR(testUrl, fetcher)
  const { data: resultData, error: resultError } = useSWR(userResultsUrl, fetcher)
  console.log(resultData)
  if (testError || resultError) return <Error />
  if (!testData || !resultData) return <Loading />

  const test: TestProps = camelcaseKeys(testData)
  const testAnswers: TestAnswerProps[] = camelcaseKeys(resultData)
  console.log(test)
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

        <Box sx={{ display: 'flex', gap: '0 24px' }}>
          <Box sx={{ width: '100%' }}>
            {/* テスト受験リンク */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <a href={`/tests/${id}/take`} style={{ textDecoration: 'none' }}>
                <Typography component="p" sx={{ fontSize: 18, fontWeight: 'bold', color: '#1976D2' }}>
                  テストを受験する
                </Typography>
              </a>
            </Box>

            <Card sx={{ boxShadow: 'none', borderRadius: '12px', maxWidth: 840, m: '0 auto' }}>
              <Box sx={{ padding: { xs: '0 24px 24px 24px', sm: '0 40px 40px 40px' }, marginTop: { xs: '24px', sm: '40px' } }}>
                <MarkdownText content={`**説明:**\n\n${test.description}`} />
                <MarkdownText content={`**改善案:**\n\n${test.improvementSuggestion}`} />
                <Typography sx={{ mt: 2 }}>最小スコア: {test.minScore}</Typography>
                <Typography>最大スコア: {test.maxScore}</Typography>
                <Typography>平均スコア: {test.avgScore}</Typography>
                <MarkdownText content={`**テスト URL:** [${test.siteUrl}](${test.siteUrl})`} />
              </Box>
            </Card>

            {/* 比較表 */}
            <Box sx={{ mt: 6 }}>
              <Typography component="h3" sx={{ fontSize: 20, fontWeight: 'bold', mb: 2 }}>
                過去のテスト結果（期間ごとの比較）
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>日付</TableCell>
                    <TableCell align="right">平均スコア</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {testAnswers.map((answer: TestAnswerProps, index: number) => (
                    <React.Fragment key={index}>
                      <TableRow>
                        <TableCell component="th" scope="row" colSpan={2}>
                          {new Date(answer.timestamp).toLocaleString()} - 平均スコア: {answer.average}
                        </TableCell>
                      </TableRow>
                      {answer.test_answer_details.map((detail, detailIndex) => (
                        <TableRow key={detailIndex}>
                          <TableCell>質問 {detail.question_id}</TableCell>
                          <TableCell align="right">{detail.score}</TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default TestDetail
