import { makeStyles } from '@mui/styles';
import theme from '../theme';

const useStyles = makeStyles(() => {
  return {
    iconRoot: {
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      width: theme.spacing(2.5),
      height: theme.spacing(2.5),
      marginRight: theme.spacing(1.5),
    },
    inputRoot: {
      color: 'inherit',
      backgroundColor: theme.palette.grey.A100,
      padding: theme.spacing(1.5, 2.25, 1.5, 2.25),
      borderRadius: theme.spacing(0.75),
    },
    inputInput: {
      // vertical padding + font size from searchIcon
      fontFamily: 'Inter, sans-serif',
      fontWeight: 400,
      padding: 0,
      lineHeight: theme.spacing(2.375),
      fontSize: theme.spacing(2),
      [theme.breakpoints.up('md')]: {},
      color: theme.palette.text.primary,
      '&::placeholder': {
        color: theme.palette.text.secondary,
      },
      backgroundColor: 'transparent !important',
      border: 'unset !important',
    },
    paper: {
      border: `1px solid ${theme.palette.grey.A200}`,
      borderRadius: theme.spacing(1),
      backgroundColor: theme.palette.grey.A100,
    },
    option: {
      padding: 0,
    },
    noOptions: {
      display: 'flex',
      alignItems: 'center',
      fontSize: theme.spacing(1.75),
      lineHeight: theme.spacing(3.25),
      justifyContent: 'center',
      padding: theme.spacing(4.5, 0, 4.5, 0),
      color: theme.palette.text.secondary,
      textTransform: 'uppercase',
    },
    listBox: {
      padding: theme.spacing(2.5, 1.75),
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing(2),
      // borderRadius: theme.spacing(1),
    },
    listItem: {
      display: 'flex',
      padding: theme.spacing(0.5, 0, 1.5, 1.5),
      borderRadius: theme.spacing(0.75),
      '&.Mui-focused': {
        backgroundColor: `${theme.palette.grey.A200} !important`,
      },
      '&[aria-selected="true"]': {
        backgroundColor: `${theme.palette.grey.A200} !important`,
      },
      '&[aria-selected="true"].Mui-focused': {
        backgroundColor: `${theme.palette.grey.A200} !important`,
      },
      '&:hover': {
        backgroundColor: theme.palette.grey.A200,
      },
    },
    listItemTextRoot: {
      padding: '0 !important',
      margin: 0,
    },
    listItemPrimary: {
      fontSize: theme.spacing(1.75),
      lineHeight: theme.spacing(3.25),
      textTransform: 'uppercase',
      color: theme.palette.text.secondary,
      marginBottom: theme.spacing(1),
    },
    listItemSecondary: {
      color: theme.palette.text.primary,
    },
    listItemSecondaryRoot: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      top: 'unset',
      right: 'unset',
      position: 'unset',
      transform: 'unset',
      minWidth: 'unset',
    },
  };
});

export default useStyles;
