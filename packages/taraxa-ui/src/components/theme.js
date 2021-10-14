import { createTheme } from "@material-ui/core/styles";

const defaultTheme = createTheme();
const theme = createTheme({
  typography: {
    h1: {
      fontFamily: ["Poppins", "sans-serif"].join(","),
    },
    h2: {
      fontFamily: ["Inter", "sans-serif"].join(","),
    },
    h3: {
      fontFamily: ["Poppins", "sans-serif"].join(","),
    },
    h4: {
      fontFamily: ["Poppins", "sans-serif"].join(","),
    },
    h5: {
      fontFamily: ["Poppins", "sans-serif"].join(","),
    },
    h6: {
      fontFamily: ["Poppins", "sans-serif"].join(","),
    },
    button: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: "1rem",
      textTransform: "none",
    },
    body1: {
      fontFamily: ["Inter", "sans-serif"].join(","),
    },
    body2: {
      fontFamily: ["Inter", "sans-serif"].join(","),
    },
    fontFamily: ["Inter", "sans-serif"].join(","),
  },
  palette: {
    primary: {
      main: "#FFF",
    },
    secondary: {
      main: "#15AC5B",
      contrastText: "#FFF",
    },
    text: {
      primary: "#FFF",
      secondary: "#878CA4",
    },
    action: {
      disabledBackground: "",
      disabled: "#FFF",
      disabledOpacity: 50,
    },
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: "#282C3E",
        color: "#FFF",
      },
      fontFamily: "Inter",
    },
    MuiToolbar: {
      regular: {
        minHeight: "72px",
        [defaultTheme.breakpoints.up('xs')]: {
          minHeight: "72px",
        },
      },
      fontFamily: "Inter",
    },
    MuiButtonBase: {
      root: {
        "&.Mui-disabled": {
          opacity: 0.7,
        },
      },
    },
    MuiButton: {
      root: {
        height: "52px",
      },
      outlinedSizeSmall: {
        height: "32px",
        padding: "8px 16px",
      },
      outlinedSecondary: {
        backgroundColor: "#31364B",
        borderColor: "#6A7085",
        color: "#FFF",
        borderRadius: "8px",
        "&:hover": {
          borderColor: "#6A7085",
        },
        "&.Mui-disabled": {
          backgroundColor: "#202534",
          borderColor: "#282C3E",
          color: "#40465F",
        },
      },
      containedSizeSmall: {
        height: "32px",
        padding: "8px 16px",
      },
      textSizeSmall: {
        height: "32px",
        padding: "8px 16px",
      },
    },
    MuiCssBaseline: {
      "@global": {
        "*::-webkit-scrollbar": {
          width: "3px",
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: "#878CA4",
        },
      },
    },
    MuiFormControlLabel: {
      label: {
        color: "#FFF",
      },
    },
    h4: {
      fontFamily: "Poppins",
    },
  },
});

export default theme;
