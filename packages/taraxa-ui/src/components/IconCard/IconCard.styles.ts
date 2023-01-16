import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => {
  return {
    root: {
      width: 280,
      minHeight: 180,
      textAlign: 'left',
      backgroundColor: '#292C3E !important',
      paddingLeft: '10px',
      paddingRight: '5px',
      border: '1px solid #40465F !important',
      display: 'flex',
      flexDirection: 'column',
    },
    content: {
      flex: 1,
    },
    label: {
      fontSize: '14px',
      fontFamily: 'Inter',
    },
    tooltipIcon: {
      float: 'right',
      marginTop: '12%',
    },
    noIconTooltipIcon: {
      float: 'right',
      marginTop: '3%',
    },
    actions: {
      display: 'grid',
      paddingLeft: '2%',
      paddingRight: '4%',
      marginBottom: '10%',
    },
    bottomSpacing: {
      fontFamily: 'Poppins',
      marginBottom: '5%',
    },
    icon: {
      marginBottom: '10%',
      marginTop: '10%',
    },
  };
});

export default useStyles;
