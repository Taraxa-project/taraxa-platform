import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    width: 311,
    minHeight: 340,
    textAlign: "left",
    backgroundColor: '#1E2231',
    border: "1px solid #282C3E",
    padding: "34px 24px 24px"
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 0
  },
  actions: {
    flexDirection: "column",
    padding: 0,
    '& > button': {
      marginBottom: 0,
    }
  },
  label: {
    overflowWrap: "anywhere",
    wordBreak: "break-all"
  },
  userDetails: {
    display: "flex",
    flex: 1,
    paddingLeft: 10
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 47,
    height: 47,
    marginRight: 20,
    '& svg': {
      borderRadius: '50%',
    }
  },
  icon: {
    marginBottom: '5%',
    marginTop: '5%'
  }
});

export default useStyles;