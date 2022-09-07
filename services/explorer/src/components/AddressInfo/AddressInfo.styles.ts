import { makeStyles } from '@mui/styles';
import { theme } from '../../theme-provider';

const useStyles = makeStyles(() => {
  return {
    container: {
      display: 'flex',
      borderRadius: theme.spacing(0.5),
      backgroundColor: theme.palette.grey[900],
      border: `1px solid ${theme.palette.grey[100]}`,
      padding: theme.spacing(3),
      flexDirection: 'column',
      width: '100%',
    },
    address: {
      display: 'flex',
      alignItems: 'center',
      fontSize: theme.spacing(2.75),
      lineHeight: theme.spacing(4.125),
      marginBottom: theme.spacing(3),
    },
    iconContainer: {
      display: 'flex',
      alignItems: 'center',
      marginRight: theme.spacing(2),
      '&>svg': {
        borderRadius: '50%',
      },
    },
    clipboard: {
      marginLeft: theme.spacing(2),
      borderRadius: theme.spacing(1),
      backgroundColor: theme.palette.grey.A200,
      padding: theme.spacing(1, 2),
      minWidth: theme.spacing(2),
    },
    twoColumnFlex: {
      display: 'flex',
      padding: theme.spacing(0, 0, 3, 0),
      marginBottom: theme.spacing(3),
      borderBottom: `1px solid ${theme.palette.grey.A200}`,
      justifyContent: 'space-between',
    },
    gridHeader: {
      letterSpacing: '-0.03rem',
      color: theme.palette.grey[100],
      fontSize: theme.spacing(1.75),
      lineHeight: theme.spacing(3.25),
      fontWeight: 700,
      maxWidth: '200px',
    },
    gridValue: {
      letterSpacing: '-0.03rem',
      fontSize: theme.spacing(1.75),
      lineHeight: theme.spacing(3.25),
      color: theme.palette.text.primary,
    },
    blocksBox: {
      borderRadius: theme.spacing(0.5),
      border: `1px solid ${theme.palette.grey[700]}`,
      backgroundColor: theme.palette.grey.A100,
      padding: theme.spacing(1, 2),
      '&>div': {
        fontWeight: 700,
        fontSize: theme.spacing(2.75),
        lineHeight: theme.spacing(4.5),
      },
      '&>span': {
        fontSize: theme.spacing(1.5),
        lineHeight: theme.spacing(2.75),
        color: theme.palette.text.secondary,
      },
    },
    fullWidthHeader: {
      maxWidth: '100%',
    },
  };
});

export default useStyles;
