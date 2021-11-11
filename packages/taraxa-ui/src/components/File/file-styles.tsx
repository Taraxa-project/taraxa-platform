import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  button: {
    justifyContent: "start",
    color: "#878CA4",
    padding: "8px",
    '& > span:first-child': {
      display: "flex",
      alignItems: "baseline",
      fontSize: "14px",
      lineHeight: "17px",
      textDecoration: "underline",
      '& > span': {
        margin: "0 8px 0 0",
        width: "24px",
        height: "24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }
    },
  },
  input: {
    display: "none",
  },
});

export default useStyles;
