import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    transition: "opacity 0.5s linear",
    height: "64px",
    lineHeight: "64px",
    width: "230px",
    background: "#282c3e",
    borderRadius: "16px",
    fontWeight: "bold",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: "16px"
  },
  mobile: {
    boxShadow: "4px 5px 41px 4px rgba(0, 0, 0, 0.75)"
  },
  progress: {
    color: "#6a7083"
  },
  show: {
    opacity: 1
  },
  hide: {
    opacity: 0
  }
});

export default useStyles;
