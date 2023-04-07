import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => {
  return {
    tableCell: {
      border: 'none',
      height: 'auto',
      borderBottom: '1px solid #1e2231 !important',
    },
    content: {
      borderRadius: '2px',
      marginRight: '-16px',
      marginLeft: '-16px',
    },
    text: {
      fontFamily: 'Inter',
      fontStyle: 'normal',
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '22px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      letterSpacing: '-0.03em',
      color: '#878ca4',
      height: '170px',
    },
  };
});

export default useStyles;
