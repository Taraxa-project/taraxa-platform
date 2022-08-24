import { makeStyles } from '@mui/styles';
import theme from '../theme';

const useStyles = makeStyles(() => {
  return {
    networkButton: {
      border: `1px solid ${theme.palette.text.secondary} !important`,
      borderRadius: `${theme.spacing(1)} !important`,
    },
    menuRoot: {
      right: theme.spacing(2),
    },
    menuList: {
      padding: 0,
    },
    menuPaper: {
      marginTop: theme.spacing(8),
      border: `1px solid ${theme.palette.grey.A200}`,
      borderRadius: theme.spacing(1),
      padding: 0,
    },
    menuItemRoot: {
      padding: theme.spacing(1.5),
      lineHeight: `${theme.spacing(3)}px`,
      fontSize: theme.spacing(2),
      display: 'flex',
      backgroundColor: theme.palette.grey[800],
      '&:hover': {
        backgroundColor: theme.palette.grey.A200,
      },
      '&>svg': {
        marginRight: theme.spacing(1.5),
        visibility: 'hidden',
      },
    },
    menuItemSelected: {
      backgroundColor: `${theme.palette.grey.A200} !important`,
      '&>svg': {
        visibility: 'visible',
      },
    },
  };
});

export default useStyles;
