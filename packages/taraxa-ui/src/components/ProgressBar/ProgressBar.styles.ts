import { makeStyles } from '@mui/styles';
import theme from '../theme';

const useStyles = makeStyles(() => {
  return {
    cellContainer: {
      position: 'relative',
    },
    percentageText: {
      textAlign: 'center',
      margin: '0 auto',
    },
    progressBar: {
      width: '100%',
      borderRadius: '2px',
      overflow: 'hidden',
      height: '0.25rem',
      backgroundColor: theme.palette.grey[300],
    },
  };
});

export default useStyles;
