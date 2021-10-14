import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1,
    },
    footer: {
      borderTop: '1px solid #40465f',
      marginTop: '56px',
      width: '100%',
      paddingTop: '32px',
    },
    footerMobile: {
      borderTop: '1px solid #40465f',
      marginTop: '56px',
      width: '100%',
      padding: '32px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
    },
    logoMobile: {
      gridRow: 1,
      alignItems: 'center',
      display: 'grid',
      gridTemplateColumns: '30% 30% 60%',
    },
    description: {
      gridRow: 2,
      marginTop: '32px',
      marginBottom: '32px',
    },
    descriptionMobile: {
      gridRow: 2,
      marginTop: '32px',
      marginBottom: '32px',
    },
    bottomNavigation: {
      gridRow: 3,
      backgroundColor: '#151823 !important',
      paddingBottom: '2% !important',
      marginTop: '2% !important',
    },
    bottomNavigationItem: {
      color: '#fff !important',
      justifyContent: 'flex-end',
    },
    footerList: {
      gridRow: 4,
      display: 'flex',
      marginBottom: '64px',
      textAlign: 'left',
    },
    footerParagraph: {
      cursor: 'pointer',
      textDecoration: 'none',
      '& > p': {
        fontSize: '14px',
      },
    },
    mobileIcons: {
      width: '100%',
      textAlign: 'left',
    },
    mobileFooterUL: {
      width: '100%',
      paddingLeft: '0 !important',
      display: 'flex',
    },
    footerUl: {
      textAlign: 'right',
      display: 'flex',
    },
    footerLi: {
      display: 'flex',
      marginRight: '16px',
      width: '40px',
      height: '40px',
      alignItems: 'center',
      '&:last-child': {
        marginRight: 0,
      },
    },
    footerSVG: {
      textAlign: 'left',
      flex: 1,
    },
    footerSVGMobile: {
      textAlign: 'left',
      gridColumn: 1,
      gridRow: 1,
    },
  }),
);

export default useStyles;
