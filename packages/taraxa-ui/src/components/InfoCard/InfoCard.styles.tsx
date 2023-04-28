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
    },
    title: {
      margin: '10px 0 10px 10px',
      fontSize: '14px',
      fontWeight: 700,
      wordBreak: 'break-word',
    },
    subtitle: {
      margin: '5px 0 10px 10px',
      color: '#878ca4',
      textAlign: 'left',
      fontSize: '14px',
      fontWeight: 500,
      wordBreak: 'break-word',
    },
    description: {
      margin: '5px 0 10px 10px',
      color: '#878ca4',
      textAlign: 'left',
      fontSize: '14px',
      wordBreak: 'break-word',
    },
  };
});

export default useStyles;
