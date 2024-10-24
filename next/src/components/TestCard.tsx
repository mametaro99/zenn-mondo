import { Box, Card, CardContent, Typography } from '@mui/material'

type TestCardProps = {
  title: string
  fromToday: string
}

const omit = (text: string) => (len: number) => (ellipsis: string) =>
  text.length >= len ? text.slice(0, len - ellipsis.length) + ellipsis : text

const TestCard = (props: TestCardProps) => {
  return (
    <Card
      sx={{
        borderRadius: '8px', // 四角形デザイン（角を少し丸める）
        padding: '16px', // 余白
        transition: 'box-shadow 0.3s ease', // ホバー時の浮き上がり効果のためのトランジション
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)', // 通常時の影
        '&:hover': {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)', // ホバー時の影
        },
      }}
    >
      <CardContent>
        <Typography
          component="h3"
          sx={{
            mb: 2,
            minHeight: 48,
            fontSize: 16,
            fontWeight: 'bold',
            lineHeight: 1.5,
          }}
        >
          {omit(props.title)(45)('...')}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 12 }}>{props.fromToday}</Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default TestCard
