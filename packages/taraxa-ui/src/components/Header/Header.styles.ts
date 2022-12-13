import { makeStyles } from '@mui/styles';
import theme from '../theme';

export const useHeaderStyles = makeStyles(() => {
  return {
    headerIconLink: {
      backgroundColor: theme.palette.grey[800],
      border: `1px solid ${theme.palette.info.main}`,
      borderRadius: '12px',
      padding: theme.spacing(1.375),
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center',
      textDecoration: 'none',
    },
    titleLink: {
      display: 'none',
      color: '#fff',
      textDecoration: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'block',
        marginLeft: '1rem !important',
      },
    },
    titleText: {
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
    profileButton: {
      marginBottom: '5%',
    },
  };
});
