import { red } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#7B8D42',  // 深い緑 (Zen Green)
    },
    secondary: {
      main: '#8C6259',  // 柔らかい茶色 (Earthy Brown)
    },
    error: {
      main: '#B54742',  // 落ち着いた赤 (Muted Red)
    },
    background: {
      default: '#F4F1EA',  // 柔らかい白 (Off-White)
    },
    text: {
      primary: '#4A4A4A',  // ダークグレー (Dark Gray)
    }
  },
});

export default theme