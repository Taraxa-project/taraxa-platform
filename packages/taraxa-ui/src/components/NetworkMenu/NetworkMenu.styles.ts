import { makeStyles } from '@mui/styles';
import theme from '../theme';

const useStyles = makeStyles(() => {
  return {
    iconButtonRoot: {
      padding: theme.spacing(1.625, 0.875),
      backgroundColor: '#282C3E',
      border: '1px solid #878CA4',
      borderRadius: theme.spacing(1),
      '&:hover': {
        backgroundColor: '#40465F',
      },
    },
    menuRoot: {
      right: theme.spacing(2),
    },
    menuList: {
      padding: 0,
    },
    menuPaper: {
      marginTop: theme.spacing(8),
      border: '1px solid #40465F',
      borderRadius: theme.spacing(1),
      padding: 0,
    },
    menuItemRoot: {
      padding: theme.spacing(1.5),
      lineHeight: `${theme.spacing(3)}px`,
      fontSize: theme.spacing(2),
      display: 'flex',
      backgroundColor: '#202534',
      '&:hover': {
        backgroundColor: '#40465F',
      },
      '&>svg': {
        marginRight: theme.spacing(1.5),
        visibility: 'hidden',
      },
    },
    menuItemSelected: {
      backgroundColor: '#40465F !important',
      '&>svg': {
        visibility: 'visible',
      },
    },
  };
});

export default useStyles;
