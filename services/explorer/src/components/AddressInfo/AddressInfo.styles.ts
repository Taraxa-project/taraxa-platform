import { makeStyles } from '@mui/styles';
import { theme } from '../../theme-provider';

const useStyles = makeStyles(
  () => {
    return {
      iconContainer: {
        display: 'flex',
        alignItems: 'center',
        marginRight: theme.spacing(2),
        '&>svg': {
          borderRadius: '50%',
        },
      },
      tabIconContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing(1),
      },
      twoColumnFlex: {
        display: 'flex',
        flexDirection: 'row',
        padding: theme.spacing(0, 0, 3, 0),
        justifyContent: 'space-between',
        [theme.breakpoints.down(1000)]: {
          flexDirection: 'column',
          gap: '2rem',
        },
      },
      gridHeader: {
        letterSpacing: '-0.03rem',
        color: theme.palette.grey[100],
        fontSize: theme.spacing(1.75),
        lineHeight: theme.spacing(3.25),
        fontWeight: 700,
        maxWidth: '200px',
      },
      blocksBox: {
        borderRadius: theme.spacing(0.5),
        border: `1px solid ${theme.palette.grey[700]}`,
        backgroundColor: theme.palette.grey.A100,
        padding: theme.spacing(1, 2),
        minWidth: '150px',
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
  },
  { name: 'AddressInfo' }
);

export default useStyles;
