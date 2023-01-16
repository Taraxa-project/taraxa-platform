import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => {
  return {
    container: {
      padding: '12px 12px 12px 0',
      borderRadius: '8px',
      display: 'flex',
    },
    icon: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 27px',
    },
    success: {
      backgroundColor: '#1E2231',
      color: '#878CA4',
    },
    danger: {
      backgroundColor: 'rgba(255, 81, 90, 0.1)',
    },
    info: {
      backgroundColor: 'rgba(72, 189, 255, 0.1)',
    },
    title: {
      lineHeight: '26px',
    },
    text: {
      fontSize: '16px',
      lineHeight: '24px',
    },
  };
});
export default useStyles;
