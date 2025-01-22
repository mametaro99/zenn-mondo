import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAdminState } from '@/hooks/useGlobalState'

const SignOut: NextPage = () => {
  const router = useRouter()
  const [, setAdmin] = useAdminState()

  useEffect(() => {
    localStorage.clear()
    setAdmin({
      id: 0,
      name: '',
      email: '',
      isSignedIn: false,
      isFetched: true,
    })
    router.push('/')
  }, [router, setAdmin])

  return <></>
}

export default SignOut