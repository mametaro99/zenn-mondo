import { Box, Grid, Container, Pagination } from '@mui/material'
import camelcaseKeys from 'camelcase-keys'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import TestCard from '@/components/TestCard'
import Error from '@/components/Error'
import Loading from '@/components/Loading'
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
    <Box css={styles.pageMinHeight} sx={{ backgroundColor: '#f4f4f4' }}>
      <Container maxWidth="md" sx={{ pt: 6 }}>
        <Grid container spacing={4}>
          {tests.map((test: TestProps, i: number) => (
            <Grid key={i} item xs={6} md={3}> {/* 小さい画面では1列、中程度以上の画面では2列 */}
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
           />
         </Box>
      </Container>
    </Box>
  )
}

export default Index