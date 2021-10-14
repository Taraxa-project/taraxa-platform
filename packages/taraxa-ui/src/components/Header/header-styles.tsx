import { alpha, makeStyles, Theme, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    titleContainer: {
      display: 'none',
      color: '#fff',
      textDecoration: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'block',
      },
    },
    title: {
      fontSize: '16px !important',
      fontFamily: 'Inter',
      fontWeight: 700,
    },
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: alpha(theme.palette.common.black, 0.15),
      '&:hover': {
        backgroundColor: alpha(theme.palette.common.black, 0.25),
      },
      marginRight: theme.spacing(2),
      marginLeft: '5%',
      width: '200%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
      },
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputRoot: {
      color: 'inherit',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: '20ch',
      },
    },
    sectionDesktop: {
      display: 'flex',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    sectionDesktopMobile: {
      justifyContent: 'flex-end',
    },
    headerIconContainer: {
      backgroundColor: '#202534',
      border: '1px solid #40465F',
      borderRadius: '12px',
      width: 48,
      height: 48,
      marginRight: '1%',
      display: 'grid',
      justifyContent: 'center',
      alignContent: 'center',
      textDecoration: 'none',
    },
    profileButton: {
      marginBottom: '5%'
    }
  }),
);

export default useStyles;