import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => {
  return {
    root: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: '0.063rem 0.5rem',
      borderRadius: '0.5rem',
    },
    success: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: '0.063rem 0.5rem',
      borderRadius: '0.5rem',
      color: '#3df99a',
      backgroundColor: 'rgba(21, 172, 91, 0.2)',
    },
    error: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: '0.063rem 0.5rem',
      borderRadius: '0.5rem',
      color: '#FF515A',
      backgroundColor: 'rgba(255, 81, 90, 0.2)',
    },
    secondary: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: '0.063rem 0.5rem',
      borderRadius: '0.5rem',
      color: '#878ca4',
      backgroundColor: '#202534',
    },
    loading: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: '0.063rem 0.5rem',
      borderRadius: '0.5rem',
      color: '#878CA4',
      backgroundColor: '#31364B',
    },
    container: {
      maxHeight: '0.938rem',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: '50%',
    },
    gappedContainer: {
      maxHeight: '0.938rem',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: '50%',
      gap: '1rem',
    },
  };
});

export default useStyles;
