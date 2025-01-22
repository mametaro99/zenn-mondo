import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useUserState, useSnackbarState, useAdminState } from '@/hooks/useGlobalState'

export function useRequireSignedIn() {
  const router = useRouter()
  const [user] = useUserState()
  const [, setSnackbar] = useSnackbarState()

  useEffect(() => {
    if (user.isFetched && !user.isSignedIn) {
      setSnackbar({
        message: 'サインインしてください',
        severity: 'error',
        pathname: '/sign_in',
      })
      router.push('/sign_in')
    }
  }, [user, router, setSnackbar])
}

export function useRequireAdminSignedIn() {
  const router = useRouter()
  const [admin] = useAdminState()
  const [, setSnackbar] = useSnackbarState()

  useEffect(() => {
    if (admin.isFetched && !admin.isSignedIn) {
      setSnackbar({
        message: 'サインインしてください',
        severity: 'error',
        pathname: 'admin/sign_in',
      })
      router.push('admin/sign_in')
    }
  }, [admin, router, setSnackbar])
}