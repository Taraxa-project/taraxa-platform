import { makeStyles } from '@mui/styles';
import theme from '../theme';

const useStyles = makeStyles(() => {
  const baseBox = {
    display: 'inline-block',
    padding: theme.spacing(1, 3, 1, 1),
    border: `2px solid ${theme.palette.grey[700]}`,
    borderRadius: theme.spacing(0.5),
  };

  return {
    boxRoot: {
      ...baseBox,
      backgroundColor: theme.palette.grey.A400,
    },
    boxRootBright: {
      ...baseBox,
      backgroundColor: theme.palette.grey.A100,
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
