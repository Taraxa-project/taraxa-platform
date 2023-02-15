import { makeStyles } from '@mui/styles';
import { theme } from '@taraxa_project/taraxa-ui';

const useStyles = makeStyles(() => {
  return {
    card: {
      width: '100%',
      background: `${theme.palette.background.default} !important`,
      borderRadius: '4px',
    },
    cardHeader: {
      marginLeft: '1rem',
      marginTop: '1rem !important',
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
