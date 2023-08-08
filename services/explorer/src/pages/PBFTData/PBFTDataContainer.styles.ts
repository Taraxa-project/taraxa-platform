import { makeStyles } from '@mui/styles';
import { theme } from '@taraxa_project/taraxa-ui';

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
  { name: 'PBFTData' }
);

export default useStyles;
