import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => {
  return {
    root: {
      width: '100%',
    },
    tooltip: {
      backgroundColor: '#40465F',
      borderRadius: '4px !important',
      color: 'white !important',
      minWidth: '200',
      padding: '2%',
    },
  };
});

export default useStyles;
