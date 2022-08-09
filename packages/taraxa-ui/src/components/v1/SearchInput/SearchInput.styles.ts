import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

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
      backgroundColor: '#31364B',
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
  }),
);

export default useStyles;
