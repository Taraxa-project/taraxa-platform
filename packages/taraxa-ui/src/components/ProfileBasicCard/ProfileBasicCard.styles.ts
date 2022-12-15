import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => {
  return {
    root: {
      display: 'flex',
      flexDirection: 'column',
      width: 311,
      minHeight: 340,
      textAlign: 'center',
      backgroundColor: '#1E2231 !important',
      border: '1px solid #282C3E !important',
      padding: '34px 24px 24px !important',
    },
    content: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 !important',
    },
    actions: {
      flexDirection: 'column',
      padding: 0,
    },
    value: {
      marginTop: '5% !important',
      marginBottom: '5% !important',
      wordBreak: 'break-word',
      fontWeight: 'bold',
    },
    description: {
      marginTop: '5%',
      marginBottom: '5%',
      wordBreak: 'break-word',
    },
    iconContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '3%',
    },
    icon: {
      marginRight: '5%',
      display: 'flex',
    },
  };
});

export default useStyles;
