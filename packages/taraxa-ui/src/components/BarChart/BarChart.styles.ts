import { makeStyles } from '@mui/styles';
import theme from '../theme';

const useStyles = makeStyles(() => {
  return {
    boxRoot: {
      display: 'inline-block',
      padding: theme.spacing(1, 3, 1, 1),
      backgroundColor: theme.palette.grey.A400,
      border: `2px solid ${theme.palette.grey.A100}`,
      borderRadius: theme.spacing(0.5),
    },
    innerBox: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(1),
    },
    titleHolder: {
      paddingLeft: theme.spacing(4),
      fontSize: theme.spacing(2),
      lineHeight: theme.spacing(3),
    },
  };
});

export default useStyles;
