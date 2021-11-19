import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  info: {
    '& > p': {
      fontSize: '14px',
    },
  },
  button: {
    width: '46px',
    height: '37px',
    border: '1px solid #6a7085',
    borderRadius: '4px',
    padding: '0 !important',
    minWidth: 'auto',
    marginLeft: '9px',
  },
});

export default useStyles;
