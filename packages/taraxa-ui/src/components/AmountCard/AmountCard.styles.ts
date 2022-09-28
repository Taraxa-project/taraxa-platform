import { makeStyles } from '@mui/styles';
import theme from '../theme';

const useStyles = makeStyles(() => {
  return {
    container: {
      textAlign: 'left',
      backgroundColor: theme.palette.grey.A100,
      border: '1px solid #4f5368',
      borderRadius: '4px',
      letterSpacing: '-0.02em',
      width: '150px',
      height: '80px',
    },
    amount: {
      margin: '10px 0 0 10px',
      fontSize: '22px',
      fontWeight: 700,
    },
    unit: {
      margin: '5px 0 10px 10px',
      color: '#878ca4',
      textAlign: 'left',
      fontSize: '12px',
    },
  };
});

export default useStyles;
