// Create custom Material UI DK theme
import { createTheme } from '@material-ui/core/styles'
const theme = createTheme({})

const DKTheme = createTheme({
  palette: {
    type: 'dark',
    primary: {
      light: '#2edc74',
      main: '#14c25a',
      dark: '#2d6d08',
      contrastText: '#fff'
    }
  },
  typography: {
    fontFamily: 'Poppins, Arial, sans-serif'
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: '#000'
      }
    },
    MuiTab: {
      root: {
        minWidth: '80px',
        minHeight: '30px',
        [theme.breakpoints.up('xs')]: {
          minWidth: 0
        }
      },
      wrapper: {
        fontWeight: 400,
        fontSize: '12px',
        letterSpacing: '1px'
      }
    },
    MuiTabs: {
      root: {
        minHeight: '30px'
      }
    },
    MuiCheckbox: {
      root: {
        padding: '6px'
      }
    },
    MuiFormLabel: {
      root: {
        fontFamily: 'Lora',
        fontSize: '1rem',
        marginTop: '1rem'
      }
    },
    MuiOutlinedInput: {
      input: {
        padding: '6px 8px'
      }
    }
  }
})

export default DKTheme
