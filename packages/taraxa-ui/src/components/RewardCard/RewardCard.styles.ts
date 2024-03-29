import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => {
  return {
    root: {
      width: '100%',
      minHeight: 180,
      textAlign: 'center',
      backgroundColor: '#282C3E !important',
      padding: '20px !important',
      border: '1px solid #6A7085 !important',
    },
    content: {
      display: 'block',
      padding: '0 !important',
    },
    main: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    informationCard: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      textAlign: 'left',
      marginRight: '30px',
    },
    actionCard: {
      width: '370px',
    },
    rewardContent: {
      color: 'white',
      border: '1px solid #15AC5B',
      padding: '16px 32px',
      margin: '16px 0',
      fontWeight: 700,
    },
    iconContainer: {
      display: 'flex',
    },
    iconContent: {
      display: 'flex',
      alignItems: 'center',
      marginRight: '16px',
    },
    icon: {
      display: 'flex',
      width: '24px',
      height: '24px',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: '16px',
    },
    dataListContainer: {
      width: '100%',
      gridColumn: '1 / span 2',
      marginTop: '45px',
    },
    label: {
      fontSize: 12,
      marginTop: '5%',
      marginBottom: '5%',
    },

    actions: {
      display: 'grid',
      marginBottom: '5%',
    },
    dot: {
      height: '15px',
      width: '15px',
      borderRadius: '50%',
      display: 'inline-block',
      marginRight: '10px',
    },
    active: {
      backgroundColor: '#15AC5B',
    },
    inactive: {
      backgroundColor: '#6a7085',
    },
  };
});

export default useStyles;
