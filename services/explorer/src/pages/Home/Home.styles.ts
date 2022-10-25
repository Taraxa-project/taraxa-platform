import { makeStyles } from '@mui/styles';
import { theme } from '@taraxa_project/taraxa-ui';

const useStyles = makeStyles(() => {
  return {
    blocksWrapper: {
      display: 'flex',
      gap: '24px',
      width: '100%',
      [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
      },
    },
  };
});

export default useStyles;
