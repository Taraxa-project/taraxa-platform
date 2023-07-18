import { makeStyles } from '@mui/styles';
import theme from '../theme';

export interface BarFlexCellProps {
  percentage: number;
}

const useStyles = makeStyles((props: BarFlexCellProps) => {
  return {
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
      width: `${props.percentage}%`,
      height: '8px',
      backgroundColor: '#00aaff',
    },
    greyBar: {
      position: 'absolute',
      bottom: '0',
      width: '100%',
      height: '8px',
      backgroundColor: theme.palette.secondary.main,
    },
  };
});

export default useStyles;
