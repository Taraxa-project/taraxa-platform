import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => {
  return {
    root: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: '0.063rem 0.5rem',
      borderRadius: '0.5rem',
      marginLeft: '1%',
    },
    success: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: '0.063rem 0.5rem',
      borderRadius: '0.5rem',
      marginLeft: '1%',
      color: '#3df99a',
      backgroundColor: 'rgba(21, 172, 91, 0.2)',
    },
    error: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: '0.063rem 0.5rem',
      borderRadius: '0.5rem',
      marginLeft: '1%',
      color: '#FF515A',
      backgroundColor: 'rgba(255, 81, 90, 0.2)',
    },
    secondary: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: '0.063rem 0.5rem',
      borderRadius: '0.5rem',
      marginLeft: '1%',
      color: '#878ca4',
      backgroundColor: '#202534',
    },
    container: {
      maxHeight: '0.938rem',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: '50%',
    },
  };
});

export default useStyles;
