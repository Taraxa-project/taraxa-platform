import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  container: {
    borderLeft: '3px solid #878CA4',
    paddingLeft: '24px',
  },
  success: {
    borderLeftColor: '#15ac5b',
  },
  danger: {
    borderLeftColor: '#ff515a',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    lineHeight: '26px',
    marginBottom: '12px',
  },
  text: {
    fontSize: '16px',
    lineHeight: '24px',
  },
});

export default useStyles;
