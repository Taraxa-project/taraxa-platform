import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => {
  return {
    root: {
      width: '100%',
    },
    tooltip: {
      borderRadius: '4px !important',
      color: 'white !important',
      minWidth: '200',
      padding: '2%',
    },
  };
});

export default useStyles;
