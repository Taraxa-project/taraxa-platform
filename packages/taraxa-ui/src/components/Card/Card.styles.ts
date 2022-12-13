import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => {
  return {
    root: {
      width: '100%',
      backgroundColor: '#282C3E',
      padding: '20px 24px',
      border: '1px solid #40465F',
      borderRadius: '4px',
    },
    content: {
      padding: 0,
      paddingBottom: '0 !important',
    },
    actions: {
      display: 'block',
      padding: 0,
      '& > button': {
        marginTop: '16px',
      },
      '& > button:first-child': {
        marginTop: 0,
      },
    },
  };
});

export default useStyles;
