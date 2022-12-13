import { makeStyles } from '@mui/styles';
import { theme } from '@taraxa_project/taraxa-ui';

const useStyles = makeStyles(
  () => {
    return {
      form: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '2rem',
        [theme.breakpoints.down('md')]: {
          flexDirection: 'column',
        },
      },
      address: {
        width: '30rem',
        [theme.breakpoints.down('md')]: {
          width: '100%',
        },
      },
      amount: {
        [theme.breakpoints.down('md')]: {
          width: '100%',
        },
      },
      button: {
        [theme.breakpoints.down('md')]: {
          width: '100%',
        },
      },
    };
  },
  { name: 'Faucet' }
);

export default useStyles;
