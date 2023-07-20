import { makeStyles } from '@mui/styles';
import theme from '../theme';

export interface ProgressBarCellProps {
  percentage: number;
}

const useStyles = makeStyles(() => {
  return {
    barFlex: {
      display: 'flex',
      flexDirection: 'row',
      marginBottom: '4px',
      paddingTop: '2rem',
      percentageAmount: {
        display: 'flex',
        flexDirection: 'column',
      },
      barPercentage: {
        height: '0.25rem',
        width: '100%',
      },
    },
    percentageAmount: {
      '&:first-child': {
        barPercentage: {
          borderTopLeftRadius: '2px',
          borderBottomLeftRadius: '2px',
        },
      },
      '&:last-child': {
        barPercentage: {
          borderTopRightRadius: '2px',
          borderBottomRightRadius: '2px',
        },
      },
    },
    cellContainer: {
      position: 'relative',
    },
    percentageText: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
    progressBar: {
      position: 'absolute',
      bottom: '0',
      height: '0.5rem',
      backgroundColor: theme.palette.secondary.main,
    },
    greyBar: {
      position: 'absolute',
      bottom: '0',
      height: '0.5rem',
      backgroundColor: theme.palette.background.default,
    },
    barPercentage: {
      height: '0.25rem',
      width: '100%',
      borderTopRightRadius: '2px',
      borderBottomRightRadius: '2px',
      borderTopLeftRadius: '2px',
      borderBottomLeftRadius: '2px',
      backgroundColor: theme.palette.grey[300],
    },
  };
});

export default useStyles;
