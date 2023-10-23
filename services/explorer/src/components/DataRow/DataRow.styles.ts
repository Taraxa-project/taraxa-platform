import { makeStyles } from '@mui/styles';
import { theme } from '@taraxa_project/taraxa-ui';

const useStyles = makeStyles(
  () => {
    return {
      wrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        [theme.breakpoints.down('md')]: {
          flexDirection: 'column',
          alignItems: 'start',
          gap: '0.5rem',
        },
      },
      dataContainer: {
        width: 'calc(100% - 14rem)',
        [theme.breakpoints.down('md')]: {
          width: '100%',
        },
      },
      wrapText: {
        whiteSpace: 'normal',
        overflowWrap: 'break-word',
      },
    };
  },
  { name: 'DataRow' }
);

export default useStyles;
