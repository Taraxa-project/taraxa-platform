import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => {
  return {
    root: {
      width: 910,
      maxHeight: 160,
      textAlign: 'left',
      backgroundColor: '#181B27 !important',
      paddingLeft: '2%',
      paddingRight: '1%',
      border: '1px solid #40465F',
      marginBottom: '5% !important',
    },
    cardContent: {
      display: 'grid',
      gridTemplateColumns: '35% 65%',
    },
    iconContainer: {
      gridColumn: '1',
    },
    topData: {
      gridColumn: '2',
    },
    icon: {
      marginLeft: 'auto',
      marginRight: 0,
    },
    label: {
      fontSize: 12,
      marginTop: '12%',
    },
    bottomSpacing: {
      marginBottom: '8%',
    },
  };
});

export default useStyles;
