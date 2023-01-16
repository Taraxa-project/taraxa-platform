import { makeStyles } from '@mui/styles';
import { theme } from '../../theme-provider';

const useStyles = makeStyles(
  () => {
    return {
      tabIconContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing(1),
      },
    };
  },
  { name: 'TransactionData' }
);

export default useStyles;
