import { makeStyles } from '@mui/styles';
import theme from '../theme';

const useStyles = makeStyles(() => {
  return {
    card: {
      background:
        'linear-gradient(180deg, #212536 0%, rgba(24, 27, 39, 0) 100%) !important',
      borderRadius: '4px',
      padding: '40px',
    },
    cardContent: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      gap: '1rem',
      justifyContent: 'space-between',
      [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        alignItems: 'start',
      },
    },
    titleContainer: {
      display: 'flex',
      flexDirection: 'column',
    },
    wrapper: {
      display: 'flex',
      flexDirection: 'row',
      gap: '2.25rem',
      [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        alignItems: 'start',
      },
    },
    detailsContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'end',
      alignSelf: 'end',
      [theme.breakpoints.down('md')]: {
        alignItems: 'start',
        alignSelf: 'start',
      },
    },
    awardContainer: {
      background:
        'linear-gradient(149.76deg, rgba(101, 107, 126, 0.2) 14.96%, rgba(22, 25, 37, 0.2) 95.34%)',
      borderRadius: '50%',
      width: '80px',
      height: '80px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  };
});

export default useStyles;
