import Logout from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import ArticleIcon from '@mui/icons-material/Article'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
} from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import axios, { AxiosResponse, AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useUserState, useAdminState } from '@/hooks/useGlobalState'

const Header = () => {
  const [user] = useUserState()
  const [admin] = useAdminState()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const router = useRouter()

   const hideHeaderPathnames = ['/admin/tests/edit/[id]']
   if (hideHeaderPathnames.includes(router.pathname)) return <></>

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const addNewArticle = () => {
    const url = process.env.NEXT_PUBLIC_API_BASE_URL + '/current/tests'

    const headers = {
      'Content-Type': 'application/json',
      'access-token': localStorage.getItem('access-token'),
      client: localStorage.getItem('client'),
      uid: localStorage.getItem('uid'),
    }

    axios({ method: 'POST', url: url, headers: headers })
      .then((res: AxiosResponse) => {
        router.push('/admin/tests/edit/' + res.data.id)
      })
      .catch((e: AxiosError<{ error: string }>) => {
        console.log(e.message)
      })
  }

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: 'white',
        color: 'black',
        boxShadow: 'none',
        py: '12px',
      }}
    >
      <Container maxWidth="lg" sx={{ px: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            {admin.isSignedIn ? (
              <Link href="/admin/home">
                <Image src="/logo1.png" width={150} height={60} alt="logo" />
              </Link>
            ) : (
              <Link href="/">
                <Image src="/logo1.png" width={150} height={60} alt="logo" />
              </Link>
            )}
          </Box>
          {(user.isFetched || admin.isFetched)&& (
            <>
              {(!user.isSignedIn && !admin.isSignedIn)&& (
                <Box>
                  <Button
                    color="primary"
                    variant="contained"
                    sx={{
                      color: 'white',
                      textTransform: 'none',
                      fontSize: 16,
                      borderRadius: 2,
                      boxShadow: 'none',
                    }}
                    onClick={() => {
                      router.push('/sign_in')
                    }}
                  >
                    Sign in
                  </Button>
                  <Link href="/sign_up">
                    <Button
                      color="primary"
                      variant="outlined"
                      sx={{
                        textTransform: 'none',
                        fontSize: 16,
                        lineHeight: '27px',
                        borderRadius: 2,
                        boxShadow: 'none',
                        border: '1.5px solid #3EA8FF',
                        ml: 2,
                      }}
                    >
                      Sign Up
                    </Button>
                  </Link>
                </Box>
              )}
              {(user.isSignedIn && !admin.isSignedIn) &&(
                 <Box sx={{ display: 'flex' }}>
                   <IconButton onClick={handleClick} sx={{ p: 0 }}>
                     <Avatar>
                       <PersonIcon />
                     </Avatar>
                   </IconButton>
                   <Menu
                     anchorEl={anchorEl}
                     id="account-menu"
                     open={open}
                     onClose={handleClose}
                     onClick={handleClose}
                   >
                     <Box sx={{ pl: 2, py: 1 }}>
                       <Typography sx={{ fontWeight: 'bold' }}>
                         {user.name}
                       </Typography>
                     </Box>
                     <Divider />
                     <Link href="/past_taken_tests">
                       <MenuItem>
                         <ListItemIcon>
                            <PersonIcon fontSize="small" />
                         </ListItemIcon>
                         受験したテスト
                       </MenuItem>
                     </Link>
                     <Link href="/sign_out">
                       <MenuItem>
                         <ListItemIcon>
                           <Logout fontSize="small" />
                         </ListItemIcon>
                         サインアウト
                       </MenuItem>
                     </Link>
                   </Menu>
                 </Box>
               )}
               {(!user.isSignedIn && admin.isSignedIn) &&(
                  <Box sx={{ display: 'flex' }}>
                    <Button
                      color="primary"
                      variant="contained"
                      sx={{
                        color: 'white',
                        textTransform: 'none',
                        fontSize: 16,
                        borderRadius: 2,
                        width: 100,
                        boxShadow: 'none',
                        mr: 2,
                      }}
                      onClick={addNewArticle}
                    >
                      Add new
                    </Button>
                    <IconButton onClick={handleClick} sx={{ p: 0 }}>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      id="account-menu"
                      open={open}
                      onClose={handleClose}
                      onClick={handleClose}
                    >
                      <Box sx={{ pl: 2, py: 1 }}>
                        <Typography sx={{ fontWeight: 'bold' }}>
                          {admin.name}
                        </Typography>
                      </Box>
                      <Divider />
                      <Link href="/admin/home">
                        <MenuItem>
                          <ListItemIcon>
                            <ArticleIcon fontSize="small" />
                          </ListItemIcon>
                          テストの管理
                        </MenuItem>
                      </Link>
                      <Link href="/admin/sign_out">
                        <MenuItem>
                          <ListItemIcon>
                            <Logout fontSize="small" />
                          </ListItemIcon>
                          サインアウト
                        </MenuItem>
                      </Link>
                    </Menu>
                  </Box>
               )}
             </>
           )}
        </Box>
      </Container>
    </AppBar>
  )
}

export default Header