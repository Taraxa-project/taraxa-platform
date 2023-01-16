import { makeStyles } from '@mui/styles';
import theme from '../theme';

const useStyles = makeStyles(() => {
  return {
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'left',
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.grey.A700,
    },
    title: {
      letterSpacing: '-0.02em',
      fontWeight: 500,
      lineHeight: '2.75rem',
      color: theme.palette.text.primary,
      marginTop: '1rem',
      marginBottom: '1rem',
    },
    subtitle: {
      fontStyle: 'normal',
      fontWeight: '400',
      fontSize: '1rem',
      lineHeight: '1.5rem',
      color: theme.palette.text.secondary,
      marginBottom: '1rem',
    },
  };
});

export default useStyles;
