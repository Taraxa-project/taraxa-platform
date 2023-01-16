import { makeStyles, createStyles } from '@mui/styles';
import theme from '../theme';

const drawerWidth = 240;
const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex',
      height: '100%',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      display: 'flex',
      width: drawerWidth,
      position: 'inherit',
      backgroundColor: '#151823 !important',
      '& > div:first-child': {
        flex: 1,
      },
      '& > div:last-child': {
        padding: '64px 0',
      },
    },
    drawerPaperMobile: {
      '& > div:last-child': {
        display: 'none',
      },
    },
    drawerContainer: {
      overflow: 'auto',
      backgroundColor: '#151823',
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      backgroundColor: '#151823',
    },
  })
);

export default useStyles;
