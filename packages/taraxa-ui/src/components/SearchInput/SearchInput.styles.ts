import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
      color: '#ffffff',
      '&::placeholder': {
        color: '#878CA4',
      },
      backgroundColor: 'transparent !important',
      border: 'unset !important',
    },
    paper: {
      border: '1px solid #40465F',
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
      lineHeight: `${theme.spacing(3.25)}px`,
      justifyContent: 'center',
      padding: theme.spacing(4.5, 0, 4.5, 0),
      color: '#878CA4',
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
      padding: theme.spacing(0.5, 0, 1.5, 1.5),
      '&:hover': {
        backgroundColor: 'unset',
      },
    },
    listItemContainer: {
      flex: '1 0 auto',
      display: 'flex',
      flexDirection: 'row',
      paddingRight: theme.spacing(3),
      borderRadius: theme.spacing(0.75),
      '&:hover': {
        backgroundColor: '#40465F',
      },
    },
    listItemTextRoot: {
      padding: '0 !important',
      margin: 0,
    },
    listItemPrimary: {
      fontSize: theme.spacing(1.75),
      lineHeight: `${theme.spacing(3.25)}px`,
      textTransform: 'uppercase',
      color: '#878CA4',
      marginBottom: theme.spacing(1),
    },
    listItemSecondary: {
      color: '#FFFFFF',
    },
    listItemSecondaryRoot: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      top: 'unset',
      right: 'unset',
      position: 'unset',
      transform: 'unset',
    },
  }),
);

export default useStyles;
