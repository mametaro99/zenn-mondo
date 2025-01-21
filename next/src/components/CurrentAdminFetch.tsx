import axios, { AxiosResponse, AxiosError } from 'axios'
import { useEffect } from 'react'
import { useAdminState } from '@/hooks/useGlobalState'

const CurrentAdminFetch = () => {
  const [admin, setAdmin] = useAdminState()

  useEffect(() => {
    if (admin.isFetched) {
      return
    }

    if (localStorage.getItem('access-token')) {
      const url = process.env.NEXT_PUBLIC_API_BASE_URL + '/current/admin'
      axios
        .get(url, {
          headers: {
            'Content-Type': 'application/json',
            'access-token': localStorage.getItem('access-token'),
            client: localStorage.getItem('client'),
            uid: localStorage.getItem('uid'),
          },
        })
        .then((res: AxiosResponse) => {
          setAdmin({
            ...admin,
            ...res.data,
            isSignedIn: true,
            isFetched: true,
          })
        })
        .catch((err: AxiosError<{ error: string }>) => {
          console.log(err.message)
          setAdmin({
            ...admin,
            isFetched: true,
          })
        })
    } else {
      setAdmin({
        ...admin,
        isFetched: true,
      })
    }
  }, [admin, setAdmin])

  return <></>
}

export default CurrentAdminFetch