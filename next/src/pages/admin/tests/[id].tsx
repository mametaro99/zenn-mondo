import ArticleIcon from '@mui/icons-material/Article'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Avatar,
  Box,
  Container,
  Typography,
  Card,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  IconButton,
} from '@mui/material'
import camelcaseKeys from 'camelcase-keys'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Error from '@/components/Error'
import Loading from '@/components/Loading'
import MarkdownText from '@/components/MarkdownText'
import { useAdminState } from '@/hooks/useGlobalState'
import { useRequireAdminSignedIn } from '@/hooks/useRequireSignedIn'
import { styles } from '@/styles'
import { fetcher } from '@/utils'

type CurrentTestProps = {
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
  status: string
}

const CurrentArticleDetail: NextPage = () => {
  useRequireAdminSignedIn()
  const [admin] = useAdminState()
  const router = useRouter()
  const url = process.env.NEXT_PUBLIC_API_BASE_URL + '/current/tests/'
  const { id } = router.query

  const { data, error } = useSWR(
    admin.isSignedIn && id ? url + id : null,
    fetcher,
  )
  if (error) return <Error />
  if (!data) return <Loading />
  
  const test: CurrentTestProps = camelcaseKeys(data)

  return (
    <Box
      css={styles.pageMinHeight}
      sx={{
        backgroundColor: '#EDF2F7',
        pb: 6,
      }}
    >
      <Box
        sx={{
          display: { xs: 'block', lg: 'none' },
          backgroundColor: 'white',
          borderTop: '0.5px solid #acbcc7',
          height: 56,
          color: '#6e7b85',
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Box sx={{ display: 'flex', gap: '0 8px' }}>
            <SettingsIcon />
            <Typography
              component="p"
              sx={{ mr: 1, fontSize: { xs: 14, sm: 16 } }}
            >
              ステータス: {test.status}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: '0 8px' }}>
            <ArticleIcon />
            <Typography
              component="p"
              sx={{ mr: 1, fontSize: { xs: 14, sm: 16 } }}
            >
              公開: {test.createdAt}
            </Typography>
          </Box>
        </Container>
      </Box>
      <Container maxWidth="lg">
        <Box sx={{ pt: 6, pb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0 8px',
              m: 'auto',
            }}
          >
            <Box sx={{ width: 40, height: 40 }}>
              <Link href={'/admin/home'}>
                <Avatar>
                  <Tooltip title="テストの管理に戻る">
                    <IconButton sx={{ backgroundColor: '#DDDDDD' }}>
                      <ChevronLeftIcon sx={{ color: '#99AAB6' }} />
                    </IconButton>
                  </Tooltip>
                </Avatar>
              </Link>
            </Box>
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Typography
                component="h2"
                sx={{
                  fontSize: { xs: 21, sm: 25 },
                  fontWeight: 'bold',
                  lineHeight: '40px',
                }}
              >
                {test.title}
              </Typography>
            </Box>
          </Box>
          <Typography
            component="p"
            align="center"
            sx={{
              display: {
                xs: 'block',
                lg: 'none',
              },
              color: '#6e7b85',
              mt: '20px',
            }}
          >
            {test.createdAt}に公開
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: '0 24px' }}>
          <Box sx={{ width: '100%' }}>
            <Card
              sx={{
                boxShadow: 'none',
                borderRadius: '12px',
                maxWidth: 840,
                m: '0 auto',
              }}
            >
              <Box
                sx={{
                  padding: { xs: '0 24px 24px 24px', sm: '0 40px 40px 40px' },
                  marginTop: { xs: '24px', sm: '40px' },
                }}
              >
                <MarkdownText content={test.description} />
              </Box>
            </Card>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', lg: 'block' },
              width: 300,
              minWidth: 300,
            }}
          >
            <Card sx={{ boxShadow: 'none', borderRadius: '12px' }}>
              <List sx={{ color: '#6e7b85' }}>
                <ListItem divider>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ pr: 1 }}>
                        <SettingsIcon />
                      </Box>
                      <ListItemText primary="ステータス" />
                    </Box>
                    <Box>
                      <ListItemText primary={test.status} />
                    </Box>
                  </Box>
                </ListItem>
                <ListItem>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ pr: 1 }}>
                        <ArticleIcon />
                      </Box>
                      <ListItemText primary="公開" />
                    </Box>
                    <Box>
                      <ListItemText primary={test.createdAt} />
                    </Box>
                  </Box>
                </ListItem>
              </List>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default CurrentArticleDetail