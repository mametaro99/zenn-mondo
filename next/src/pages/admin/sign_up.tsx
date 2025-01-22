import { LoadingButton } from '@mui/lab'
import { Box, Container, TextField, Typography, Stack } from '@mui/material'
import Link from 'next/link'
import axios, { AxiosResponse, AxiosError } from 'axios'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import { useSnackbarState } from '@/hooks/useGlobalState'
import { styles } from '@/styles'

type SignUpFormData = {
  email: string
  password: string
  name: string
}

const SignUp: NextPage = () => {
  const router = useRouter()
  const [, setSnackbar] = useSnackbarState()
  const [isLoading, setIsLoading] = useState(false)

  const { handleSubmit, control } = useForm<SignUpFormData>({
    defaultValues: { email: '', password: '' },
  })

  const validationRules = {
    email: {
      required: 'メールアドレスを入力してください。',
      pattern: {
        value:
          /^[a-zA-Z0-9_+-]+(.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/,
        message: '正しい形式のメールアドレスを入力してください。',
      },
    },
    password: {
      required: 'パスワードを入力してください。',
    },
    name: {
      required: 'ユーザー名を入力してください。',
    },
  }

  const onSubmit: SubmitHandler<SignUpFormData> = (data) => {
    const SignUp = async (data: SignUpFormData) => {
      setIsLoading(true)
      const url = process.env.NEXT_PUBLIC_API_BASE_URL + '/admin/auth'
      const headers = { 'Content-Type': 'application/json' }

      await axios({
        method: 'POST',
        url: url,
        data: data,
        headers: headers,
      })
        .then((res: AxiosResponse) => {
          localStorage.setItem(
            'access-token',
            res.headers['access-token'] || '',
          )
          localStorage.setItem('client', res.headers['client'] || '')
          localStorage.setItem('uid', res.headers['uid'] || '')
          setSnackbar({
            message: '新規登録に成功しました。ログインを行ってください。',
            severity: 'success',
            pathname: '/',
          })
          router.push('/')
        })
        .catch((e: AxiosError<{ error: string }>) => {
          console.log(e.message)
          setSnackbar({
            message: '不正なユーザー情報です',
            severity: 'error',
            pathname: '/sign_up',
          })
          setIsLoading(false)
        })
    }
    SignUp(data)
  }

  return (
    <Box
      css={styles.pageMinHeight}
      sx={{
        backgroundColor: '#EDF2F7',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ mb: 4, pt: 4 }}>
          <Typography
            component="h2"
            sx={{ fontSize: 32, color: 'black', fontWeight: 'bold' }}
          >
            科学者用 新規アカウント登録
          </Typography>
        </Box>
        <Stack
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          spacing={4}
        >
          <Controller
            name="email"
            control={control}
            rules={validationRules.email}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="text"
                label="メールアドレス"
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                sx={{ backgroundColor: 'white' }}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            rules={validationRules.password}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="password"
                label="パスワード"
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                sx={{ backgroundColor: 'white' }}
              />
            )}
          />
          <Controller
            name="name"
            control={control}
            rules={validationRules.name}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="text"
                label="ユーザー名"
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                sx={{ backgroundColor: 'white' }}
              />
            )}
          />
          <LoadingButton
            variant="contained"
            type="submit"
            loading={isLoading}
            sx={{ fontWeight: 'bold', color: 'white' }}
          >
            送信する
          </LoadingButton>
        </Stack>
      </Container>
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Link href="/admin/sign_in" passHref>
          <Typography
            sx={{ color: 'blue', textDecoration: 'underline' }}
          >
            すでにアカウントを登録している科学者の方はこちらへ
          </Typography>
        </Link>
      </Box>
    </Box>
  )
}

export default SignUp