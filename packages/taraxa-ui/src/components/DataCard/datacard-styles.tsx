import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    width: "320px",
    minHeight: 180,
    textAlign: "center",
    backgroundColor: '#151823',
    paddingLeft: "24px",
    paddingRight: "24px",
    border: "1px solid #15AC5B",
  },
  mobileRoot: {
    width: '85%',
    minHeight: 180,
    textAlign: "center",
    backgroundColor: '#151823',
    paddingLeft: "24px",
    paddingRight: "24px",
    border: "1px solid #15AC5B",
  },
  chips: {
    marginTop: "13px",
    marginBottom: "22px"
  },
  title: {
    marginBottom: '5%',
    fontWeight: 700,
    wordBreak: 'break-all',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  tooltipIcon: {
    float: 'right',
    marginTop: '5%',
  },
  label: {
    fontSize: 12,
    marginTop: "5%",
    marginBottom: "5%"
  },
  actions: {
    display: "grid",
    marginBottom: "44px",
    padding: 0,
  },
  icon: {
    marginBottom: '5%',
    marginTop: '5%'
  }
});

export default useStyles;