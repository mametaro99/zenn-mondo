import ArticleIcon from '@mui/icons-material/Article'
import Logout from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
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
import { useState } from 'react'
import { useUserState } from '@/hooks/useGlobalState'
import router from 'next/router'

const Header = () => {
  const [user] = useUserState()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
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
            <Link href="/">
              <Image src="/logo1.png" width={150} height={60} alt="logo" />
            </Link>
          </Box>
          {user.isFetched && (
            <>
              {!user.isSignedIn && (
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
              {user.isSignedIn && (
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
             </>
           )}
        </Box>
      </Container>
    </AppBar>
  )
}

export default Header