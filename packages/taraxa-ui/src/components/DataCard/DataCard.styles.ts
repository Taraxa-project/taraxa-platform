import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => {
  return {
    root: {
      width: '320px',
      minHeight: 180,
      textAlign: 'center',
      backgroundColor: '#151823 !important',
      paddingLeft: '24px',
      paddingRight: '24px',
      border: '1px solid #15AC5B !important',
    },
    mobileRoot: {
      width: '85%',
      minHeight: 180,
      textAlign: 'center',
      backgroundColor: '#151823',
      paddingLeft: '24px',
      paddingRight: '24px',
      border: '1px solid #15AC5B !important',
    },
    chips: {
      marginTop: '13px',
      marginBottom: '22px',
    },
    descriptionLegend: {
      marginTop: '38px',
      marginBottom: '38px',
      fontSize: '16px',
      lineHeight: '24px',
      display: 'flex',
      alignItems: 'center',
      textAlign: 'center',
      color: '#878CA4',
      paddingTop: '12.5px',
      paddingBottom: '12.5px',
    },
    title: {
      marginBottom: '5%',
      fontWeight: 700,
      wordBreak: 'break-all',
    },
    iconContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    tooltipIcon: {
      float: 'right',
      marginTop: '2rem',
    },
    label: {
      fontFamily: 'Inter',
      fontSize: 12,
    },
    actions: {
      display: 'grid',
      marginBottom: '28px',
      padding: 0,
    },
    icon: {
      marginBottom: '5%',
      marginTop: '5%',
    },
  };
});

export default useStyles;
