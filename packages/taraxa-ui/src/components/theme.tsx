import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';

const theme: Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFFFFF',
      contrastText: '#000000',
    },
    secondary: {
      main: '#15AC5B',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#878CA4',
    },
    grey: {
      A100: '#31364B',
      100: '#6A7085',
    },
    background: {
      default: '#151823',
      paper: '#1E2231',
    },
  },
  typography: {
    h1: {
      fontFamily: ['Poppins', 'sans-serif'].join(','),
    },
    h2: {
      fontFamily: ['Inter', 'sans-serif'].join(','),
    },
    h3: {
      fontFamily: ['Poppins', 'sans-serif'].join(','),
    },
    h4: {
      fontFamily: ['Poppins', 'sans-serif'].join(','),
    },
    h5: {
      fontFamily: ['Poppins', 'sans-serif'].join(','),
    },
    h6: {
      fontFamily: ['Poppins', 'sans-serif'].join(','),
    },
    button: {
      fontFamily: ['Inter', 'sans-serif'].join(','),
      fontSize: '1rem',
      textTransform: 'none',
    },
    body1: {
      fontFamily: ['Inter', 'sans-serif'].join(','),
    },
    body2: {
      fontFamily: ['Inter', 'sans-serif'].join(','),
    },
    fontFamily: ['Inter', 'sans-serif'].join(','),
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          fontFamily: 'Inter',
          backgroundColor: '#282C3E',
          color: '#FFF',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        regular: {
          minHeight: '72px',
          fontFamily: 'Inter',
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            opacity: 0.7,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          height: '52px',
        },
        outlinedSizeSmall: {
          height: '32px',
          padding: '8px 16px',
        },
        outlinedSecondary: {
          backgroundColor: '#31364B',
          borderColor: '#6A7085',
          color: '#FFF',
          borderRadius: '8px',
          '&:hover': {
            borderColor: '#6A7085',
          },
          '&.Mui-disabled': {
            backgroundColor: '#202534',
            borderColor: '#282C3E',
            color: '#40465F',
          },
        },
        containedSizeSmall: {
          height: '32px',
          padding: '8px 16px',
        },
        textSizeSmall: {
          height: '32px',
          padding: '8px 16px',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '@global': {
          '*::-webkit-scrollbar': {
            width: '3px',
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: '#878CA4',
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          color: '#FFF',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          width: '100%',
          color: '#ffffff',
          tableLayout: 'fixed',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #40465F',
          background: '#1B1E2B',
          color: '#878CA4',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #282C3E',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          textAlign: 'left',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        },
        head: {
          color: '#878CA4',
          background: '#1B1E2B',
        },
        body: {
          border: 'none',
          height: 'auto',
        },
      },
    },
  },
} as ThemeOptions);

export default theme;
