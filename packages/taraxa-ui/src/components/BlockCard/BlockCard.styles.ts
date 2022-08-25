import { makeStyles } from '@mui/styles';
import theme from '../theme';

const useStyles = makeStyles(() => {
  return {
    card: {
      width: 'auto',
      background: `${theme.palette.background.default} !important`,
      borderRadius: '4px',
    },
    cardHeader: {
      background: theme.palette.background.paper,
      color: theme.palette.common.white,
      borderBottom: `1px solid ${theme.palette.grey.A100} !important`,
      padding: '16px 37px',
      fontWeight: 400,
      fontSize: '1rem !important',
      lineHeight: '24px important',
    },
    cardContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      padding: '23px 37px',
    },
  };
});

export default useStyles;
