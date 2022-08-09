import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

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
      marginRight: theme.spacing(5),
    },
    sectionDesktop: {
      display: 'flex',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: theme.spacing(1),
    },
    sectionDesktopMobile: {
      justifyContent: 'flex-end',
    },
    searchInput: {
      marginRight: theme.spacing(8),
    },
    headerIconContainer: {
      backgroundColor: '#202534',
      border: '1px solid #40465F',
      borderRadius: '12px',
      padding: theme.spacing(1.375),
      display: 'flex',
      marginRight: theme.spacing(1.75),
      justifyContent: 'center',
      alignContent: 'center',
      textDecoration: 'none',
    },
    profileButton: {
      marginBottom: '5%',
    },
  }),
);

export default useStyles;
