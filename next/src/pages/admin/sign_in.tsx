import { LoadingButton } from '@mui/lab'
import { Box, Container, TextField, Typography, Stack, Link } from '@mui/material'
import axios, { AxiosResponse, AxiosError } from 'axios'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import { useAdminState, useSnackbarState, useUserState } from '@/hooks/useGlobalState'

type SignInFormData = {
  email: string
  password: string
}

const SignIn: NextPage = () => {
  
  const router = useRouter()
  const [user] = useUserState()
  const [isLoading, setIsLoading] = useState(false)
  const [admin, setAdmin] = useAdminState()
  const [, setSnackbar] = useSnackbarState()

  if (user.isSignedIn || admin.isSignedIn) {
    setSnackbar({
      message: 'すでにログインしています。別のアカウントでログインする場合はログアウトしてください。',
      severity: 'error',
      pathname: '/',
    })
    router.push('/')
  }

  const { handleSubmit, control } = useForm<SignInFormData>({
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
  }

  const onSubmit: SubmitHandler<SignInFormData> = (data) => {
    setIsLoading(true)
    const url = process.env.NEXT_PUBLIC_API_BASE_URL + '/admin/auth/sign_in'
    const headers = { 'Content-Type': 'application/json' }

    axios({
      method: 'POST',
      url: url,
      data: {
        email: data.email,
        password: data.password,
      },
      headers: headers,
    })
      .then((res: AxiosResponse) => {
        localStorage.setItem('access-token', res.headers['access-token'])
        localStorage.setItem('client', res.headers['client'])
        localStorage.setItem('uid', res.headers['uid'])
        setAdmin({
          ...admin,
          isFetched: false,
        })
        setSnackbar({
          message: 'サインインに成功しました',
          severity: 'success',
          pathname: '/admin/home',
        })
        router.push('/admin/home')
      })
      .catch((e: AxiosError<{ error: string }>) => {
        console.log(e.message)
        setSnackbar({
          message: '登録ユーザーが見つかりません',
          severity: 'error',
          pathname: 'admin/sign_in',
        })
        setIsLoading(false)
      })
      
  }

  return (
    <Box
      sx={{
        backgroundColor: '#EDF2F7',
        minHeight: 'calc(100vh - 57px)',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ mb: 4, pt: 4 }}>
          <Typography
            component="h2"
            sx={{ fontSize: 32, color: 'black', fontWeight: 'bold' }}
          >
            科学者用 サインイン
          </Typography>
        </Box>
        <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={4}>
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
                label="パスワード"error={fieldState.invalid}
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Link href="/admin/sign_up">
          <Typography
            sx={{ color: 'blue', textDecoration: 'underline' }}
          >
            まだ、アカウントを作成していない科学者の方はこちら
          </Typography>
        </Link>
      </Box>
    </Box>
  )
}

export default SignIn