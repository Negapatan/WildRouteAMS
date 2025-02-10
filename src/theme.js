import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#800000', // CIT Maroon
      light: '#a31545',
      dark: '#5c0000',
    },
    secondary: {
      main: '#FFD700', // CIT Gold
      light: '#fff44f',
      dark: '#c7a600',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(45deg, #800000 30%, #a31545 90%)',
          boxShadow: '0 3px 5px 2px rgba(128, 0, 0, .3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme; 