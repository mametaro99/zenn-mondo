import { Box, Grid, Container, Pagination } from '@mui/material'
import camelcaseKeys from 'camelcase-keys'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Error from '@/components/Error'
import Loading from '@/components/Loading'
import TestCard from '@/components/TestCard'
import { styles } from '@/styles'
import { fetcher } from '@/utils'

type TestProps = {
  id: number
  title: string
  fromToday: string
}

const Index: NextPage = () => {
  const router = useRouter()
  const page = 'page' in router.query ? Number(router.query.page) : 1
  const url = process.env.NEXT_PUBLIC_API_BASE_URL + '/tests/?page=' + page

  const { data, error } = useSWR(url, fetcher)
  if (error) return <Error />
  if (!data) return <div>Loading...</div>
  if (!data) return <Loading />

  const tests = camelcaseKeys(data.tests)
  const meta = camelcaseKeys(data.meta)

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    router.push('/?page=' + value)
  }

  return (
    <Box css={styles.pageMinHeight} sx={{
      backgroundImage: `url('/temp.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundColor: '#f4f4f4',
      animation: 'fadeIn 1.5s ease-in-out',
      '@keyframes fadeIn': {
        from: { opacity: 0 },
        to: { opacity: 1 },
      }
    }}>
      <Container maxWidth="md" sx={{ pt: 6 }}>
        <Grid container spacing={4}>
          {tests.map((test: TestProps, i: number) => (
            <Grid key={i} item xs={6} md={3}>
              <Link href={'/tests/' + test.id}>
                <TestCard
                  title={test.title}
                  fromToday={test.fromToday}
                />
              </Link>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <Pagination
            count={meta.totalPages}
            page={meta.currentPage}
            onChange={handleChange}
            color="secondary"
          />
        </Box>
      </Container>

      <Container maxWidth="md" sx={{
        pt: 6,
        animation: 'floatUp 2s ease forwards',
        opacity: 0,
        '@keyframes floatUp': {
          from: { transform: 'translateY(20px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        }
      }}>
        <Box sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // 半透明の白背景
          padding: 3,
          borderRadius: 2,
          boxShadow: 3,
        }}>
          「禅問道」は、心理学や医療健康に関する研究で使われているテストに回答できるアプリです。
          <br />
          鎌倉時代に日本に伝わった仏教の臨済宗には、禅問答という修行があります。
          禅問答とは、和尚さんが修行僧に対して、公案と呼ばれる自分を超越するような質問を投げかけ、
          修行僧は考えに考え抜いて答えを出し、和尚さんからその問題の真理を教わるという修行です。
          <br />
          この禅問道でも、和尚さんのように真理の先駆けとなる研究者によって作成されたテストに、
          我々修行僧が回答し、心や体の状態について改善案を受け取ることができます。
          <br />
        </Box>
      </Container>
    </Box>
  )
}

export default Index
