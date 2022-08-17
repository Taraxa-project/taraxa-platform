import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => {
  return {
    root: {
      width: 311,
      height: 314,
      textAlign: 'left',
      backgroundColor: '#151823',
      padding: '24px',
      border: '2px solid #31364B',
    },
    content: {
      padding: '0 !important',
    },
    title: {
      fontSize: 18,
      margin: 0,
      textAlign: 'center',
      fontWeight: 'normal',
      '& span': {
        display: 'inline-block',
        marginLeft: 10,
        verticalAlign: 'middle',
      },
    },
    itemsContainer: {
      overflowY: 'scroll',
      height: 225,
      paddingRight: 10,
      '& .contentGrid': {
        '& .gridLeft': {
          textAlign: 'left',
        },
        '& .gridRight': {
          textAlign: 'right',
        },
      },
    },
  };
});
export default useStyles;
