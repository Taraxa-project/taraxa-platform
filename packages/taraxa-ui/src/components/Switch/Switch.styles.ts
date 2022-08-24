import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => {
  return {
    root: {
      '& .MuiFormControlLabel-label': {
        fontSize: '14px',
      },
    },
  };
});

export default useStyles;
