import { makeStyles } from '@mui/styles';
import theme from '../theme';

const useStyles = makeStyles(() => {
  return {
    wrapper: {
      width: '100%',
      display: 'flex',
      gap: '10px',
      flexDirection: 'column',
    },
    hashContainer: {
      width: 'calc(100% - 10rem)',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    details: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '1rem',
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'start',
      },
    },
  };
});

export default useStyles;
